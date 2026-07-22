'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export interface ProductFormData {
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  discount_percent?: number;
  weight?: number;          // ✅ tambahkan
  image_url?: string;
  badge?: string;
}

export interface Product extends ProductFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

export async function getProducts(filters?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> {
  let query = supabaseAdmin.from('products').select('*');

  if (filters?.search) {
    const search = filters.search.trim();
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }
  if (filters?.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(formData: ProductFormData) {
  const id = randomUUID();
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{ ...formData, id, weight: formData.weight ?? 0 }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return data;
}

export async function updateProduct(id: string, formData: ProductFormData) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('category')
    .order('category');
  if (error) throw new Error(error.message);
  const unique = [...new Set(data.map(item => item.category))];
  return unique;
}