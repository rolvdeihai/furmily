'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// Ambil konten about
export async function getAboutContent() {
  const { data, error } = await supabaseAdmin
    .from('about_page')
    .select('content')
    .limit(1)
    .single();

  if (error) {
    // Jika belum ada row, return fallback
    return {
      content: `<p><strong>Furmily</strong> adalah brand premium yang berdedikasi untuk menyediakan camilan sehat dan bergizi bagi kucing dan anjing kesayangan Anda. Kami percaya bahwa hewan peliharaan layak mendapatkan yang terbaik — dari bahan-bahan alami pilihan hingga proses produksi yang higienis.</p><p>Semua produk Furmily diproses dengan metode <strong>freeze drying</strong>, yang mempertahankan nutrisi, rasa, dan tekstur alami bahan makanan. Tanpa pengawet, tanpa pemanis buatan, tanpa bahan tambahan berbahaya.</p><p>Kami berkomitmen untuk mendukung kesehatan dan kebahagiaan hewan peliharaan Anda melalui produk-produk berkualitas tinggi yang kami racik dengan cinta.</p>`
    };
  }

  return data;
}

// Update konten about
export async function updateAboutContent(content: string) {
  // Cek apakah row sudah ada
  const { data: existing } = await supabaseAdmin
    .from('about_page')
    .select('id')
    .limit(1)
    .single();

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from('about_page')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    result = await supabaseAdmin
      .from('about_page')
      .insert({ content });
  }

  if (result.error) throw new Error(result.error.message);

  revalidatePath('/about');
  revalidatePath('/admin/about');
  return { success: true };
}