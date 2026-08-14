'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// Ambil konten Why Us
export async function getWhyUsContent() {
  const { data, error } = await supabaseAdmin
    .from('landing_why_us')
    .select('content')
    .limit(1)
    .single();

  if (error) {
    // Fallback default
    return {
      content: `
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div class="text-center">
    <div class="text-5xl mb-4">🌿</div>
    <h3 class="text-xl font-bold text-furmily-primary">100% Bahan Alami</h3>
    <p class="text-gray-600 mt-2">Tanpa pengawet, pewarna buatan, atau bahan tambahan berbahaya.</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">🧊</div>
    <h3 class="text-xl font-bold text-furmily-primary">Teknologi Freeze Dried</h3>
    <p class="text-gray-600 mt-2">Mempertahankan nutrisi, rasa, dan tekstur alami bahan makanan.</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">❤️</div>
    <h3 class="text-xl font-bold text-furmily-primary">Dibuat dengan Cinta</h3>
    <p class="text-gray-600 mt-2">Setiap produk kami racik khusus untuk kesehatan hewan kesayangan Anda.</p>
  </div>
</div>
      `
    };
  }

  return data;
}

// Update konten Why Us
export async function updateWhyUsContent(content: string) {
  // Cek apakah row sudah ada
  const { data: existing } = await supabaseAdmin
    .from('landing_why_us')
    .select('id')
    .limit(1)
    .single();

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from('landing_why_us')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    result = await supabaseAdmin
      .from('landing_why_us')
      .insert({ content });
  }

  if (result.error) throw new Error(result.error.message);

  revalidatePath('/');
  revalidatePath('/admin/landing');
  return { success: true };
}