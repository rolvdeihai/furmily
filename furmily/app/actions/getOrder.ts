'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getOrderById(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}