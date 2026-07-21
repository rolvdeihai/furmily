// app/actions/checkPaymentStatus.ts
// app/actions/checkPaymentStatus.ts
'use server';

import crypto from 'crypto';

const CLIENT_ID = process.env.DOKU_CLIENT_ID!;
const SECRET_KEY = process.env.DOKU_SECRET_KEY!;
const API_URL = process.env.DOKU_API_URL || 'https://api.doku.com';

function generateSignatureForGet(
  clientId: string,
  requestId: string,
  timestamp: string,
  requestTarget: string,
  secretKey: string
): string {
  const componentSignature =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${requestTarget}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(componentSignature);
  const signature = hmac.digest('base64');
  return `HMACSHA256=${signature}`;
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export async function checkPaymentStatus(invoiceNumber: string) {
  if (!CLIENT_ID || !SECRET_KEY) {
    throw new Error('Missing DOKU credentials');
  }

  const requestId = crypto.randomUUID();
  const timestamp = formatTimestamp(new Date());
  const requestTarget = `/orders/v1/status/${invoiceNumber}`;
  const url = `${API_URL}${requestTarget}`;

  const signature = generateSignatureForGet(
    CLIENT_ID,
    requestId,
    timestamp,
    requestTarget,
    SECRET_KEY
  );

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Client-Id': CLIENT_ID,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      'Signature': signature,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`DOKU API ${response.status}: ${JSON.stringify(data)}`);
  }

  // DOKU returns transaction status in different fields
  const status = data?.transaction?.status || data?.status || data?.order?.status;
  const paymentId = data?.order?.id || data?.payment_id;

  return {
    status,
    paymentId,
    amount: data?.order?.amount || data?.amount,
    paymentDate: data?.transaction?.date || data?.payment_date,
  };
}