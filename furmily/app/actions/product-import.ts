// app/actions/product-import.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function parseProductsFromText(rawText: string): Promise<any[]> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  const model = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('DeepSeek API key is required for AI extraction.');
  }

  const prompt = `
Anda adalah asisten ekstraksi data produk. Berikut adalah teks yang diekstrak dari dokumen / gambar / file.

Teks:
"""
${rawText.slice(0, 4000)}
"""

Ekstrak semua produk yang terdapat dalam teks. Setiap produk harus memiliki field:
- name (string, wajib)
- category (string, salah satu: "Freeze Dried", "Food Topper", "Supplements")
- description (string, opsional)
- price (number, wajib)
- stock (number, wajib, default 0)
- discount_percent (number, default 0)
- weight (number, dalam kg, default 0 jika tidak disebutkan)
- image_url (string, opsional)
- badge (string, opsional, misal: "Best Seller", "Premium")

Kembalikan hanya JSON array dari objek-objek produk. Jangan tambahkan teks lain.
`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Anda adalah ekstraktor data produk yang presisi. Kembalikan hanya JSON array.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    let jsonText = content.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonText = jsonMatch[1];

    const products = JSON.parse(jsonText);
    if (!Array.isArray(products)) throw new Error('AI response is not an array');
    return products;
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error(`Gagal mengekstrak data: ${(error as Error).message}`);
  }
}

export async function saveProducts(products: any[]) {
  let count = 0;
  const errors: string[] = [];

  for (const productData of products) {
    try {
      if (!productData.name || !productData.category) {
        errors.push(`Produk "${productData.name || 'tanpa nama'}" tidak memiliki name/category`);
        continue;
      }

      const payload = {
        id: randomUUID(),
        name: productData.name.trim(),
        category: productData.category.trim(),
        description: productData.description || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        discount_percent: productData.discount_percent || 0,
        weight: productData.weight ?? 0,   // ✅ Tambahkan ini
        image_url: productData.image_url || '',
        badge: productData.badge || '',
      };

      const { error } = await supabaseAdmin
        .from('products')
        .insert(payload);

      if (error) throw new Error(error.message);
      count++;
    } catch (rowError: any) {
      errors.push(`Product ${productData.name || count + 1}: ${rowError.message}`);
    }
  }

  revalidatePath('/admin/products');

  if (errors.length > 0) {
    return { count, errors };
  }
  return { count };
}
