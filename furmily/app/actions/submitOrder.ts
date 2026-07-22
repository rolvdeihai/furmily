// app/actions/submitOrder.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function submitOrder(input: {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: {
    product_id: string;
    quantity: number;
  }[];
  notes?: string;
  // === Tambahan untuk shipping ===
  shipping_service_id?: string;
  shipping_cost?: number;
  total_weight?: number;
  distance_km?: number;
  shipping_estimation?: string;
}) {
  // 1. Find or create customer
  let customerId: string;
  const { data: existingCustomer } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('phone', input.customer.phone)
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        name: input.customer.name,
        phone: input.customer.phone,
        email: input.customer.email || '',
        address: input.customer.address || '',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    customerId = newCustomer.id;
  }

  // 2. Get product details (including discount_percent)
  const productIds = input.items.map(item => item.product_id);
  const { data: products, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, name, category, price, stock, discount_percent')
    .in('id', productIds);
  if (productError) throw new Error(productError.message);

  const productMap = new Map(products.map(p => [p.id, p]));

  let subtotal = 0;
  const orderItems = input.items.map(item => {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (product.stock < item.quantity) {
      throw new Error(`Stok ${product.name} tidak mencukupi. Sisa: ${product.stock}`);
    }

    const discountPercent = product.discount_percent ?? 0;
    const effectivePrice = Math.round(product.price * (1 - discountPercent / 100));
    const itemSubtotal = effectivePrice * item.quantity;
    subtotal += itemSubtotal;

    return {
      product_id: item.product_id,
      product_name: product.name,
      variant: product.category,
      quantity: item.quantity,
      price: effectivePrice,
      subtotal: itemSubtotal,
    };
  });

  // Total = subtotal + ongkir
  const shippingCost = input.shipping_cost ?? 0;
  const total = subtotal + shippingCost;

  // 3. Create order dengan total termasuk ongkir
  const orderNumber = `ORD-${Date.now()}`;
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      total_amount: total,
      status: 'pending',
      notes: input.notes || '',
      // === Tambahan field shipping ===
      shipping_service_id: input.shipping_service_id || null,
      shipping_cost: shippingCost,
      total_weight: input.total_weight || 0,
      distance_km: input.distance_km || 0,
      shipping_estimation: input.shipping_estimation || '',
    })
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  // 4. Insert order items
  const itemsToInsert = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsToInsert);
  if (itemsError) throw new Error(itemsError.message);

  // 5. Deduct stock
  for (const item of orderItems) {
    const product = productMap.get(item.product_id);
    if (product) {
      await supabaseAdmin
        .from('products')
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', product.id);
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin/dashboard');

  return {
    success: true,
    orderId: order.id,
    orderNumber: order.order_number,
  };
}