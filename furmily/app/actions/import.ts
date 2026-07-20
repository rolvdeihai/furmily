// app/actions/import.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';

// Define expected CSV row structure
interface CSVRow {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  product_name: string;
  quantity: string;
  price: string;
  notes?: string;
}

export async function importOrdersFromCSV(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CSVRow[];  // ✅ Type assertion to CSVRow[]

  if (records.length === 0) {
    throw new Error('File CSV kosong atau tidak valid.');
  }

  let count = 0;
  for (const record of records) {
    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      product_name,
      quantity,
      price,
      notes,
    } = record;

    // Skip invalid rows
    if (!customer_name || !customer_phone || !product_name || !quantity || !price) continue;

    const qty = parseInt(quantity);
    const priceNum = parseFloat(price);
    if (isNaN(qty) || qty <= 0 || isNaN(priceNum)) continue;

    // 1. Find or create customer
    let customerId: string;
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('phone', customer_phone)
      .maybeSingle();
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          name: customer_name,
          phone: customer_phone,
          email: customer_email || '',
          address: customer_address || '',
        })
        .select()
        .single();
      if (customerError || !newCustomer) {
        throw new Error(`Gagal membuat pelanggan: ${customerError?.message}`);
      }
      customerId = newCustomer.id;
    }

    // 2. Create order
    const orderNumber = `ORD-${Date.now()}-${count}`;
    const total = qty * priceNum;
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        order_number: orderNumber,
        total_amount: total,
        status: 'pending',
        notes: notes || '',
      })
      .select()
      .single();
    if (orderError || !order) {
      throw new Error(`Gagal membuat pesanan: ${orderError?.message}`);
    }

    // 3. Create order item
    const { error: itemError } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_name: product_name,
        variant: '',
        quantity: qty,
        price: priceNum,
        subtotal: total,
      });
    if (itemError) throw new Error(itemError.message);

    count++;
  }

  revalidatePath('/admin/orders');
  return { count };
}