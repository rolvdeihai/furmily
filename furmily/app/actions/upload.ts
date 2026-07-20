'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export async function uploadProductImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  console.log('🔄 Uploading file to bucket:', filePath);

  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('❌ Upload error:', error);
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(filePath);

  console.log('✅ Upload successful, public URL:', publicUrlData.publicUrl);

  return { url: publicUrlData.publicUrl };
}