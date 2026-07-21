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

  let total = 0;
  const orderItems = input.items.map(item => {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (product.stock < item.quantity) {
      throw new Error(`Stok ${product.name} tidak mencukupi. Sisa: ${product.stock}`);
    }

    // ✅ Calculate effective price with discount
    const discountPercent = product.discount_percent ?? 0;
    const effectivePrice = Math.round(product.price * (1 - discountPercent / 100));
    const subtotal = effectivePrice * item.quantity;
    total += subtotal;

    return {
      product_id: item.product_id,
      product_name: product.name,
      variant: product.category,
      quantity: item.quantity,
      price: effectivePrice,      // ✅ stored discounted price
      subtotal,
    };
  });

  // 3. Create order with discounted total
  const orderNumber = `ORD-${Date.now()}`;
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      total_amount: total,        // ✅ discounted total
      status: 'pending',
      notes: input.notes || '',
    })
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  // 4. Insert order items (already have discounted price)
  const itemsToInsert = orderItems.map(item => ({
    ...item,
    order_id: order.id,
  }));
  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(itemsToInsert);
  if (itemsError) throw new Error(itemsError.message);

  // 5. Deduct stock (same as before)
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