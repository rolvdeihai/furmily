// app/actions/orders.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function getOrders(filters?: { status?: string }) {
  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');
}

export async function getCustomers() {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}