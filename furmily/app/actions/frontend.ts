// app/actions/frontend.ts
'use server';

import { supabase } from '@/lib/supabaseClient';  // ✅ anon client (not admin)
import { Product } from './products';

export async function getPublicProducts(): Promise<Product[]> {
  console.log('🔍 Fetching products with anon client...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('📦 Data:', data);
  console.log('❌ Error:', error);

  if (error) throw new Error(error.message);
  return data || [];
}