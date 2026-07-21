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

export async function createOrder(data: {
  customerId: string;
  items: { product_name: string; variant?: string; quantity: number; price: number; subtotal: number }[];
  totalAmount: number;
  notes?: string;
  deliveryEstimate?: string;
}) {
  const orderNumber = `ORD-${Date.now()}`;
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: data.customerId,
      order_number: orderNumber,
      total_amount: data.totalAmount,
      status: 'pending',
      notes: data.notes || '',
      delivery_estimate: data.deliveryEstimate || '',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const itemsToInsert = data.items.map(item => ({
    order_id: order.id,
    product_name: item.product_name,
    variant: item.variant || '',
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
  }));
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsToInsert);
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath('/admin/orders');
  return order;
}

export async function updateOrder(orderId: string, data: {
  status?: string;
  notes?: string;
  delivery_estimate?: string;
}) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders');
}

export async function deleteOrder(orderId: string) {
  // Hapus order_items dulu
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .delete()
    .eq('order_id', orderId);
  if (itemsError) throw new Error(itemsError.message);

  // Hapus order
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders');
}

// ✅ NEW: Update order items (delete old, insert new)
export async function updateOrderItems(
  orderId: string,
  items: { product_name: string; variant?: string; quantity: number; price: number; subtotal: number }[]
) {
  // 1. Delete existing items
  const { error: deleteError } = await supabaseAdmin
    .from('order_items')
    .delete()
    .eq('order_id', orderId);
  if (deleteError) throw new Error(deleteError.message);

  // 2. Insert new items
  if (items.length > 0) {
    const itemsToInsert = items.map(item => ({
      order_id: orderId,
      product_name: item.product_name,
      variant: item.variant || '',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));
    const { error: insertError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsToInsert);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath('/admin/orders');
}

// ✅ NEW: Update entire order (header + items) at once
export async function updateFullOrder(
  orderId: string,
  data: {
    customer_id?: string;
    status?: string;
    notes?: string;
    delivery_estimate?: string;
    items?: { product_name: string; variant?: string; quantity: number; price: number; subtotal: number }[];
  }
) {
  // 1. Update order header
  const updateData: any = {
    status: data.status,
    notes: data.notes || '',
    delivery_estimate: data.delivery_estimate || '',
    updated_at: new Date().toISOString(),
  };

  // ✅ If customer_id is provided and it's a new order, update it
  if (data.customer_id) {
    updateData.customer_id = data.customer_id;
  }

  // 2. Update items if provided
  if (data.items) {
    // Delete existing items
    const { error: deleteError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    if (deleteError) throw new Error(deleteError.message);

    // Insert new items
    if (data.items.length > 0) {
      const itemsToInsert = data.items.map(item => ({
        order_id: orderId,
        product_name: item.product_name,
        variant: item.variant || '',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      }));
      const { error: insertError } = await supabaseAdmin
        .from('order_items')
        .insert(itemsToInsert);
      if (insertError) throw new Error(insertError.message);

      // ✅ Recalculate total from items
      const total = data.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      updateData.total_amount = total;
    } else {
      // No items, total = 0
      updateData.total_amount = 0;
    }
  }

  // 3. Update order header (including total_amount)
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');
}