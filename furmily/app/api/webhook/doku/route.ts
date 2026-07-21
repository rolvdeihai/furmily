// app/api/webhook/doku/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CLIENT_ID = process.env.DOKU_CLIENT_ID!;
const SECRET_KEY = process.env.DOKU_SECRET_KEY!;

// --- Same signature generator as in createDokuPayment ---
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

export async function POST(request: Request) {
  try {
    const headers = Object.fromEntries(request.headers);
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    console.log('📩 DOKU Webhook received:', { headers, body });

    const signature = headers['signature'];
    const clientId = headers['client-id'];
    const requestId = headers['request-id'];
    const timestamp = headers['request-timestamp'];

    if (!signature || !clientId || !requestId || !timestamp) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    if (clientId !== CLIENT_ID) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 401 });
    }

    // Compute digest from raw body
    const digest = generateDigest(rawBody);
    // The request target for DOKU webhook is the full path they are sending to
    // Usually it's the URL path of your webhook endpoint
    const requestTarget = '/api/webhook/doku';

    const expectedSignature = generateSignature(
      clientId,
      requestId,
      timestamp,
      requestTarget,
      digest,
      SECRET_KEY
    );

    if (signature !== expectedSignature) {
      console.warn('❌ Invalid signature');
      console.warn('Expected:', expectedSignature);
      console.warn('Received:', signature);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('✅ Signature verified');

    // Extract order data (adjust based on DOKU's actual webhook payload structure)
    const invoiceNumber = body.order?.invoice_number || body.invoice_number;
    const transactionStatus = body.transaction?.status || body.status;
    const amount = body.order?.amount || body.amount;
    const paymentDate = body.transaction?.date || body.payment_date;

    if (!invoiceNumber) {
      return NextResponse.json({ error: 'Missing invoice number' }, { status: 400 });
    }

    console.log(`📦 Processing order: ${invoiceNumber}, status: ${transactionStatus}`);

    // Find the order
    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, status, total_amount')
      .eq('order_number', invoiceNumber)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found:', invoiceNumber);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (transactionStatus === 'SUCCESS' || transactionStatus === 'PAID' || transactionStatus === 'SETTLED') {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'confirmed',
          payment_id: body.order?.id || body.payment_id,
          payment_date: paymentDate || new Date().toISOString(),
          payment_amount: amount || order.total_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('❌ Failed to update order:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }

      console.log(`✅ Order ${invoiceNumber} updated to confirmed`);
      return NextResponse.json({ success: true });
    }

    if (['FAILED', 'EXPIRED', 'CANCELLED', 'PENDING'].includes(transactionStatus)) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order.id);
      console.log(`⚠️ Order ${invoiceNumber} status: ${transactionStatus}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}