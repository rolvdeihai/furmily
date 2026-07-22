// app/actions/shipping.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

// ================================================================
// 1. SHIPPING SERVICES (CRUD)
// ================================================================

export async function getShippingServices() {
  const { data, error } = await supabaseAdmin
    .from('shipping_services')
    .select('*')
    .order('courier_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveShippingServices() {
  const { data, error } = await supabaseAdmin
    .from('shipping_services')
    .select('*')
    .eq('is_active', true)
    .order('courier_name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createShippingService(data: {
  courier_name: string;
  service_name: string;
  base_fare: number;
  price_per_kg: number;
  price_per_km: number;
  minimum_weight: number;
  is_active?: boolean;
}) {
  const { error } = await supabaseAdmin
    .from('shipping_services')
    .insert({ ...data, is_active: data.is_active ?? true });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/shipping');
}

export async function updateShippingService(id: string, data: {
  courier_name?: string;
  service_name?: string;
  base_fare?: number;
  price_per_kg?: number;
  price_per_km?: number;
  minimum_weight?: number;
  is_active?: boolean;
}) {
  const { error } = await supabaseAdmin
    .from('shipping_services')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/shipping');
}

export async function deleteShippingService(id: string) {
  const { error } = await supabaseAdmin
    .from('shipping_services')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/shipping');
}

export async function toggleShippingService(id: string, is_active: boolean) {
  const { error } = await supabaseAdmin
    .from('shipping_services')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/shipping');
}

// ================================================================
// 2. STORE SETTINGS (dengan koordinat)
// ================================================================

export async function getStoreSettings() {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateStoreSettings(data: {
  store_name?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}) {
  const existing = await getStoreSettings();
  if (existing) {
    const { error } = await supabaseAdmin
      .from('store_settings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from('store_settings')
      .insert({ ...data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin/shipping');
}

// ================================================================
// 3. KOMBINASI DATA UNTUK ORDER PAGE
// ================================================================

export async function getShippingData() {
  const [services, store] = await Promise.all([
    getActiveShippingServices(),
    getStoreSettings(),
  ]);
  return { services, store };
}