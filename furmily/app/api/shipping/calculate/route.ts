// app/api/shipping/calculate/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const { serviceId, weight, length, width, height, distance } = await request.json();

        // Ambil data service
        const { data: service, error } = await supabaseAdmin
            .from('shipping_services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (error || !service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Hitung berat volume
        const volumeWeight = (length * width * height) / 6000;
        // Berat tagihan = max(berat aktual, berat volume)
        let chargeableWeight = Math.max(weight, volumeWeight);
        // Terapkan minimum weight
        if (chargeableWeight < service.minimum_weight) {
            chargeableWeight = service.minimum_weight;
        }

        // Total ongkir = base_fare + (chargeableWeight * price_per_kg) + (distance * price_per_km)
        const total = service.base_fare
            + (chargeableWeight * service.price_per_kg)
            + (distance * service.price_per_km);

        return NextResponse.json({
            service,
            weight,
            volumeWeight,
            chargeableWeight,
            total,
            breakdown: {
                base_fare: service.base_fare,
                weight_cost: chargeableWeight * service.price_per_kg,
                distance_cost: distance * service.price_per_km,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}