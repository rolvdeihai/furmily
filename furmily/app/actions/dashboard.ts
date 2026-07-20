'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getDashboardStats() {
  // Total orders
  const { count: totalOrders, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });
  if (orderError) throw new Error(orderError.message);

  // Total revenue (sum of total_amount from orders with status != cancelled)
  const { data: revenueData, error: revenueError } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .neq('status', 'cancelled');
  if (revenueError) throw new Error(revenueError.message);
  const totalRevenue = revenueData.reduce((sum, o) => sum + o.total_amount, 0);

  // Total products
  const { count: totalProducts, error: productError } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true });
  if (productError) throw new Error(productError.message);

  // Total customers
  const { count: totalCustomers, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true });
  if (customerError) throw new Error(customerError.message);

  // Recent orders (last 5)
  const { data: recentOrders, error: recentError } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      customer:customers(name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentError) throw new Error(recentError.message);

  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    recentOrders,
  };
}