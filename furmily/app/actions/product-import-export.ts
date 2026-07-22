// app/actions/product-import-export.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';
import { Product } from './products';

export async function exportProductsCSV(products: Product[]): Promise<string> {
  if (products.length === 0) return '';
  const headers: (keyof Product)[] = [
    'name', 'category', 'description', 'price', 'stock',
    'discount_percent', 'weight', 'image_url', 'badge', 'id', 'created_at', 'updated_at'
  ];
  const csv = [
    headers.join(','),
    ...products.map(row =>
      headers.map(h => {
        const value = row[h] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');
  return csv;
}

export async function importProductsCSV(formData: FormData) {
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
    const {
      name,
      category,
      description,
      price,
      stock,
      discount_percent,
      weight,
      image_url,
      badge,
      id,
    } = record;
    if (!name || !category || !price || stock === undefined) continue;

    const productData: any = {
      name,
      category,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock),
      discount_percent: discount_percent ? parseInt(discount_percent) : 0,
      weight: weight ? parseFloat(weight) : 0,   // ✅
      image_url: image_url || '',
      badge: badge || '',
    };

    if (id) {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('name', name)
        .maybeSingle();
      if (existing) {
        const { error } = await supabaseAdmin
          .from('products')
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabaseAdmin
          .from('products')
          .insert([productData]);
        if (error) throw new Error(error.message);
      }
    }
    count++;
  }
  revalidatePath('/admin/products');
  return { count };
}