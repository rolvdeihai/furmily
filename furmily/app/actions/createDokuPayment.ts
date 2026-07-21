// app/actions/createDokuPayment.ts
// app/actions/createDokuPayment.ts
'use server';

import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CLIENT_ID = process.env.DOKU_CLIENT_ID!;
const SECRET_KEY = process.env.DOKU_SECRET_KEY!;
const API_URL = process.env.DOKU_API_URL || 'https://api.doku.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://furmily.vercel.app';

function generateDigest(body: string): string {
  return crypto.createHash('sha256').update(body).digest('base64');
}

function generateSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  requestTarget: string,
  digest: string,
  secretKey: string
): string {
  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digest}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  const signature = hmac.digest('base64');
  return `HMACSHA256=${signature}`;
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function createDokuPaymentOrder(orderId: string) {
  if (!CLIENT_ID || !SECRET_KEY) {
    throw new Error('Missing DOKU_CLIENT_ID or DOKU_SECRET_KEY');
  }

  // 1. Fetch order with customer and items
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Order fetch error:', error);
    throw new Error('Order not found');
  }

  const { order_number, total_amount, customer, items } = order;

  if (!items || items.length === 0) {
    throw new Error('Order has no items');
  }

  // ✅ Handle zero total (e.g., 100% discount)
  if (total_amount <= 0) {
    console.log(`🆓 Order ${order_number} is free. Confirming immediately.`);
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to confirm free order:', updateError);
      throw new Error('Failed to confirm free order');
    }

    // Redirect directly to invoice
    return {
      paymentUrl: `${APP_URL}/invoice/${orderId}`,
      orderNumber: order_number,
    };
  }

  // 2. Build DOKU payload
  const payload = {
    order: {
      invoice_number: order_number,
      amount: Math.round(Number(total_amount)),
      currency: 'IDR',
      callback_url: `${APP_URL}/payment/status?orderId=${orderId}`,
      auto_redirect: true,
      customer: {
        name: customer?.name || 'Customer',
        email: customer?.email || 'customer@example.com',
        phone: customer?.phone || '',
      },
      line_items: items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Math.round(Number(item.price)), // price from order_items (already discounted)
      })),
    },
    payment: {
      payment_due_date: 60,
    },
  };

  const bodyString = JSON.stringify(payload);

  // 3. Generate request headers
  const requestId = crypto.randomUUID();
  const timestamp = formatTimestamp(new Date());
  const requestTarget = '/checkout/v1/payment';
  const url = `${API_URL}${requestTarget}`;

  const digest = generateDigest(bodyString);
  const signature = generateSignature(
    CLIENT_ID,
    requestId,
    timestamp,
    requestTarget,
    digest,
    SECRET_KEY
  );

  console.log('📤 DOKU Request:');
  console.log('URL:', url);
  console.log('Timestamp:', timestamp);
  console.log('Digest:', digest);
  console.log('Signature:', signature);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  // 4. Send request
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': signature,
        'Digest': digest,
      },
      body: bodyString,
    });

    const data = await response.json();
    console.log('📥 DOKU Response:', data);

    if (!response.ok) {
      console.error('DOKU error response:', data);
      throw new Error(`DOKU API ${response.status}: ${JSON.stringify(data)}`);
    }

    const paymentUrl =
      data?.response?.payment?.url ||
      data?.payment?.url ||
      data?.payment_url ||
      data?.url;

    if (!paymentUrl) {
      throw new Error('No payment URL returned from DOKU');
    }

    if (data?.order?.id) {
      await supabaseAdmin
        .from('orders')
        .update({ payment_id: data.order.id })
        .eq('id', orderId);
    }

    return {
      paymentUrl,
      orderNumber: order_number,
    };
  } catch (fetchError: any) {
    console.error('❌ DOKU API call failed:', fetchError);
    throw new Error(`Failed to create payment: ${fetchError.message}`);
  }
}