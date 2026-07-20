'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';

// Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
  order_count?: number;
}

// Fetch customers with optional filters and order count
export async function getCustomers(filters?: {
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Customer[]> {
  let query = supabaseAdmin.from('customers').select('*');

  if (filters?.search) {
    const search = filters.search.trim();
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data: customers, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  // Get order counts per customer
  const { data: orderCounts, error: countError } = await supabaseAdmin
    .from('orders')
    .select('customer_id', { count: 'exact', head: false })
    .in('customer_id', customers.map(c => c.id));

  if (countError) throw new Error(countError.message);

  const countMap: Record<string, number> = {};
  orderCounts?.forEach(order => {
    countMap[order.customer_id] = (countMap[order.customer_id] || 0) + 1;
  });

  return customers.map(c => ({
    ...c,
    order_count: countMap[c.id] || 0,
  }));
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}) {
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('phone', data.phone)
    .maybeSingle();
  if (checkError) throw new Error(checkError.message);
  if (existing) throw new Error('Nomor telepon sudah terdaftar.');

  const { data: newCustomer, error } = await supabaseAdmin
    .from('customers')
    .insert([data])
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/customers');
  return newCustomer;
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const { error } = await supabaseAdmin
    .from('customers')
    .update(data)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/customers');
}

export async function deleteCustomer(id: string) {
  const { count, error } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', id);
  if (error) throw new Error(error.message);
  const orderCount = count ?? 0; // ✅ handle null/undefined
  if (orderCount > 0) {
    throw new Error('Pelanggan memiliki pesanan, tidak dapat dihapus.');
  }

  const { error: deleteError } = await supabaseAdmin
    .from('customers')
    .delete()
    .eq('id', id);
  if (deleteError) throw new Error(deleteError.message);
  revalidatePath('/admin/customers');
}

export async function exportCustomersCSV(customers: Customer[]): Promise<string> {
  if (customers.length === 0) return '';

  const headers = ['name', 'phone', 'email', 'address', 'order_count', 'created_at'];
  const csv = [
    headers.join(','),
    ...customers.map(row =>
      headers.map(h => {
        // ✅ Use type assertion to avoid implicit any
        const value = (row as any)[h] ?? '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');

  return csv;
}

export async function importCustomersCSV(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as any[];

  let count = 0;
  for (const record of records) {
    const { name, phone, email, address } = record;
    if (!name || !phone) continue;

    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();
    if (existing) continue;

    const { error } = await supabaseAdmin
      .from('customers')
      .insert([{ name, phone, email: email || '', address: address || '' }]);
    if (error) throw new Error(error.message);
    count++;
  }

  revalidatePath('/admin/customers');
  return { count };
}