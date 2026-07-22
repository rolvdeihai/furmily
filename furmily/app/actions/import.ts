// app/actions/import.ts
'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { parse } from 'csv-parse/sync';

// ================================================================
// 1. PARSE ORDERS FROM TEXT (AI-POWERED) – untuk gambar / PDF / DOCX / TXT
// ================================================================
export async function parseOrdersFromText(rawText: string): Promise<any[]> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  const model = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    throw new Error('DeepSeek API key is required for AI extraction.');
  }

  // Potong teks jika terlalu panjang
  const truncatedText = rawText.slice(0, 4000);

  const prompt = `
Anda adalah asisten ekstraksi data pesanan. Berikut adalah teks yang diekstrak dari dokumen / gambar.

Teks:
"""
${truncatedText}
"""

Ekstrak semua pesanan yang terdapat dalam teks. Setiap pesanan harus memiliki field:
- order_number (string, jika tidak ada buat "ORD-...")
- customer_name (string, jika tidak ada kosongkan)
- customer_phone (string, opsional)
- customer_email (string, opsional)
- customer_address (string, opsional)
- total_amount (number, wajib, default 0)
- status (string: "pending", "confirmed", "delivered", dll. Gunakan "pending" jika tidak tahu)
- notes (string, opsional)
- payment_method (string, opsional)
- transaction_date (string, format tanggal, opsional – gunakan format YYYY-MM-DD jika ada)
- product_name (string, jika tidak ada gunakan "Item")
- quantity (number, default 1)
- price (number, jika tidak ada gunakan total_amount / quantity)

Kembalikan hanya JSON array dari objek-objek pesanan. Jangan tambahkan teks lain.
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
          { role: 'system', content: 'Anda adalah ekstraktor data yang presisi. Kembalikan hanya JSON array.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    // Bersihkan markdown
    let jsonText = content.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonText = jsonMatch[1];

    // === SANITASI JSON ===
    // Hapus karakter kontrol yang tidak terlihat
    jsonText = jsonText.replace(/[\x00-\x1F\x7F]/g, '');
    // Hapus komentar single-line (// ...)
    jsonText = jsonText.replace(/\/\/.*$/gm, '');
    // Hapus komentar multi-line (/* ... */)
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
    // Perbaiki properti tanpa tanda petik: { nama: "value" } -> { "nama": "value" }
    jsonText = jsonText.replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1 "$2":');
    // Hapus trailing comma sebelum } atau ]
    jsonText = jsonText.replace(/,\s*}/g, '}');
    jsonText = jsonText.replace(/,\s*\]/g, ']');

    let orders;
    try {
      orders = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('JSON parsing after sanitization failed, attempting fallback...', parseError);
      // Fallback: ambil hanya array dengan regex
      const arrayMatch = jsonText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        try {
          orders = JSON.parse(arrayMatch[0]);
        } catch (e2) {
          throw new Error('Tidak dapat mengekstrak array JSON dari respons AI.');
        }
      } else {
        throw new Error('Respons AI tidak mengandung array JSON yang valid.');
      }
    }

    if (!Array.isArray(orders)) {
      throw new Error('AI response is not an array');
    }

    return orders;
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error(`Gagal mengekstrak data: ${(error as Error).message}`);
  }
}

// ================================================================
// 2. IMPORT JETNOTE CSV (Hardcoded, tanpa AI)
// ================================================================
export async function importJetnoteCSV(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  let text = await file.text();
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n');

  // Parse dengan delimiter koma (hardcoded)
  let records: any[] = [];
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true,
      escape: '"',
      quote: '"',
      delimiter: ',',
    });
  } catch (commaError) {
    // Fallback ke semicolon jika comma gagal
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_error: true,
        escape: '"',
        quote: '"',
        delimiter: ';',
      });
    } catch (semicolonError) {
      // Fallback ke tab
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_error: true,
        escape: '"',
        quote: '"',
        delimiter: '\t',
      });
    }
  }

  if (records.length === 0) {
    throw new Error('CSV kosong atau tidak dapat diparse.');
  }

  // Mapping Jetnote
  const orders = records.map((record: any) => {
    // Total amount
    const totalAmountRaw = record['Jumlah'] || record['Total'] || '0';
    const totalAmount = parseFloat(String(totalAmountRaw).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    // Tanggal
    let transactionDate = '';
    const dateRaw = record['Tanggal'] || '';
    if (dateRaw) {
      try {
        const parts = dateRaw.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          const dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            transactionDate = dateObj.toISOString().split('T')[0];
          }
        } else {
          // Coba parse langsung
          const dateObj = new Date(dateRaw);
          if (!isNaN(dateObj.getTime())) {
            transactionDate = dateObj.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Status mapping
    const statusMap: Record<string, string> = {
      'selesai': 'delivered',
      'diproses': 'confirmed',
      'dibatalkan': 'cancelled',
      'menunggu': 'pending',
      'pending': 'pending',
      'confirmed': 'confirmed',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
    };
    const statusRaw = (record['Status'] || '').toLowerCase();
    const status = statusMap[statusRaw] || 'pending';

    return {
      order_number: record['No. Order'] || `ORD-${Date.now()}`,
      customer_name: (record['Customer'] || '').replace(/\s*-\s*\d+$/, '').trim(),
      customer_phone: extractPhone(record['Customer']),
      customer_email: '',
      customer_address: '',
      total_amount: totalAmount,
      status: status,
      notes: record['Catatan'] || '',
      payment_method: record['Metode Pembayaran'] || '',
      transaction_date: transactionDate,
      product_name: 'Import Jetnote',
      quantity: 1,
      price: totalAmount,
    };
  });

  // Simpan ke database
  const result = await saveOrders(orders);
  revalidatePath('/admin/orders');
  return result;
}

// ================================================================
// 3. IMPORT ORDERS DARI CSV (dengan AI fallback untuk format non-Jetnote)
// ================================================================
export async function importOrdersFromCSV(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  let text = await file.text();
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  text = text.replace(/\r\n/g, '\n');

  // Deteksi delimiter
  let records: any[] = [];
  const delimiters = [',', ';', '\t', '|'];
  let lastError: any = null;

  for (const delim of delimiters) {
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_error: true,
        escape: '"',
        quote: '"',
        delimiter: delim,
      });
      if (records.length > 0) break;
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  if (records.length === 0) {
    const firstLine = text.split('\n').find(line => line.trim()) || '';
    throw new Error(
      `CSV kosong atau delimiter tidak dikenali.\nBaris pertama: "${firstLine}"`
    );
  }

  // Deteksi apakah ini format Jetnote
  const headers = Object.keys(records[0]);
  const isJetnote = headers.some(h =>
    h.includes('No. Transaksi') ||
    h.includes('No. Order') ||
    h.includes('Customer')
  );

  // Jika Jetnote, panggil parser Jetnote langsung (hardcoded)
  if (isJetnote) {
    // Buat FormData baru dengan file yang sama
    const newFormData = new FormData();
    newFormData.append('file', file);
    return await importJetnoteCSV(newFormData);
  }

  // === Non-Jetnote: gunakan AI untuk mapping ===
  const mapping = await detectColumnsWithAI(headers, records);

  const parsedOrders = records.map((record) => {
    const order = {
      order_number: getValue(record, mapping, 'order_number') || `ORD-${Date.now()}`,
      customer_name: getValue(record, mapping, 'customer_name'),
      customer_phone: getValue(record, mapping, 'customer_phone'),
      customer_email: getValue(record, mapping, 'customer_email'),
      customer_address: getValue(record, mapping, 'customer_address'),
      total_amount: parseFloat(
        String(getValue(record, mapping, 'total_amount')).replace(/[^0-9.,]/g, '').replace(',', '.')
      ) || 0,
      status: mapStatus(getValue(record, mapping, 'status')),
      notes: getValue(record, mapping, 'notes'),
      payment_method: getValue(record, mapping, 'payment_method'),
      transaction_date: getValue(record, mapping, 'transaction_date'),
      product_name: getValue(record, mapping, 'product_name') || 'Import Item',
      quantity: parseInt(
        String(getValue(record, mapping, 'quantity')).replace(/[^0-9]/g, '')
      ) || 1,
      price: parseFloat(
        String(getValue(record, mapping, 'price')).replace(/[^0-9.,]/g, '').replace(',', '.')
      ) || 0,
    };
    if (order.total_amount === 0 && order.price > 0) {
      order.total_amount = order.price * order.quantity;
    }
    return order;
  });

  const result = await saveOrders(parsedOrders);
  revalidatePath('/admin/orders');
  return result;
}

// ================================================================
// 4. SAVE ORDERS TO DATABASE
// ================================================================
export async function saveOrders(orders: any[]) {
  let count = 0;
  const errors: string[] = [];

  for (const orderData of orders) {
    try {
      // Validasi minimal
      if (!orderData.customer_name && !orderData.customer_phone) {
        errors.push(`Order ${orderData.order_number || '?'}: Tidak ada nama atau telepon customer`);
        continue;
      }

      // 1. Cari atau buat customer
      let customerId: string;
      const phone = orderData.customer_phone || '';
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existing) {
        customerId = existing.id;
      } else {
        const customerPayload: any = {
          name: orderData.customer_name || `Customer ${Date.now()}`,
          phone: phone || `PHONE-${Date.now()}`,
        };
        if (orderData.customer_email) customerPayload.email = orderData.customer_email;
        if (orderData.customer_address) customerPayload.address = orderData.customer_address;

        const { data: newCustomer } = await supabaseAdmin
          .from('customers')
          .insert(customerPayload)
          .select()
          .single();
        if (!newCustomer) throw new Error('Gagal membuat pelanggan');
        customerId = newCustomer.id;
      }

      // 2. Buat order
      const orderNumber = orderData.order_number || `ORD-${Date.now()}-${count}`;

      // Validasi tanggal
      let createdDate = new Date();
      if (orderData.transaction_date) {
        const parsed = new Date(orderData.transaction_date);
        if (!isNaN(parsed.getTime())) {
          createdDate = parsed;
        }
      }

      const { data: order } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: customerId,
          order_number: orderNumber,
          total_amount: orderData.total_amount || 0,
          status: orderData.status || 'pending',
          notes: orderData.notes || '',
          payment_method: orderData.payment_method || '',
          created_at: createdDate.toISOString(),
        })
        .select()
        .single();

      if (!order) throw new Error('Gagal membuat pesanan');

      // 3. Insert order item
      const productName = orderData.product_name || 'Import Item';
      const quantity = orderData.quantity || 1;
      const price = orderData.price || (orderData.total_amount / quantity);
      await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_name: productName,
          variant: orderData.payment_method || '',
          quantity: quantity,
          price: price,
          subtotal: price * quantity,
        });

      count++;
    } catch (rowError: any) {
      errors.push(`Order ${orderData.order_number || count + 1}: ${rowError.message}`);
    }
  }

  return { count, errors };
}

// ================================================================
// 5. HELPER: AI Column Mapping
// ================================================================
async function detectColumnsWithAI(headers: string[], sampleRows: any[]): Promise<Record<string, string>> {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  const model = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  if (!apiKey) {
    console.warn('DeepSeek API key missing, using fallback mapping');
    return fallbackColumnMapping(headers);
  }

  const prompt = `
Anda adalah ahli mapping data. Saya memiliki file CSV dengan header: ${JSON.stringify(headers)}.
Contoh data: ${JSON.stringify(sampleRows.slice(0, 2))}.

Peta kan kolom-kolom ini ke field yang dibutuhkan untuk import pesanan:

Field yang dibutuhkan:
- order_number: No. Order / Order ID
- customer_name: Nama Customer / Customer
- customer_phone: Telepon / Phone
- customer_email: Email (opsional)
- customer_address: Alamat / Address (opsional)
- total_amount: Jumlah / Total / Amount
- status: Status (map ke: Selesai=delivered, Diproses=confirmed, Dibatalkan=cancelled, Menunggu=pending)
- notes: Catatan / Notes (opsional)
- payment_method: Metode Pembayaran (opsional)
- transaction_date: Tanggal / Date (opsional)
- product_name: Nama Produk / Product (opsional)
- quantity: Quantity / Qty (opsional)
- price: Harga / Price (opsional)

Kembalikan hanya JSON object dengan format: { "column_name": "field_name" }
Contoh: { "No. Transaksi": "transaction_number", "Customer": "customer_name", ... }
Jika tidak ada mapping, berikan null.
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
          { role: 'system', content: 'Anda adalah ahli mapping data yang presisi. Kembalikan hanya JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.warn('AI API error, using fallback');
      return fallbackColumnMapping(headers);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    let jsonText = content.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonText = jsonMatch[1];

    const mapping = JSON.parse(jsonText);
    return mapping;
  } catch (error) {
    console.warn('AI mapping failed, using fallback:', error);
    return fallbackColumnMapping(headers);
  }
}

// ================================================================
// 6. HELPER: Fallback Column Mapping
// ================================================================
function fallbackColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  const patterns: Record<string, string[]> = {
    order_number: [
      'no.order', 'no_transaksi', 'order_id', 'order_number',
      'transaction_id', 'no transaksi', 'no order', 'No. Order'
    ],
    customer_name: [
      'customer', 'customer_name', 'nama_customer', 'name',
      'pelanggan', 'customer name', 'Customer'
    ],
    customer_phone: [
      'phone', 'telepon', 'no_telepon', 'hp', 'contact', 'customer_phone'
    ],
    customer_email: [
      'email', 'customer_email', 'email_customer'
    ],
    customer_address: [
      'address', 'alamat', 'customer_address', 'address_customer'
    ],
    total_amount: [
      'jumlah', 'total', 'amount', 'total_amount', 'grand_total', 'total price', 'Jumlah'
    ],
    status: [
      'status', 'order_status', 'status_order', 'Status'
    ],
    notes: [
      'notes', 'catatan', 'keterangan', 'remark', 'Catatan'
    ],
    payment_method: [
      'payment', 'metode_pembayaran', 'payment_method', 'payment_type', 'Metode Pembayaran'
    ],
    transaction_date: [
      'tanggal', 'date', 'created_at', 'order_date', 'transaction_date', 'Tanggal'
    ],
    product_name: [
      'product', 'product_name', 'nama_produk', 'item', 'Product'
    ],
    quantity: [
      'quantity', 'qty', 'jumlah_item', 'kuantitas', 'Qty'
    ],
    price: [
      'price', 'harga', 'unit_price', 'harga_satuan', 'Price'
    ],
  };

  for (const [field, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      const found = headers.find(h => h.toLowerCase().includes(keyword.toLowerCase()));
      if (found) {
        mapping[found] = field;
        break;
      }
    }
  }

  return mapping;
}

// ================================================================
// 7. HELPER: Get Value dari Record
// ================================================================
function getValue(record: any, mapping: Record<string, string>, field: string): string {
  // Coba berdasarkan mapping
  for (const [column, mappedField] of Object.entries(mapping)) {
    if (mappedField === field) {
      const val = record[column];
      return val !== undefined && val !== null ? String(val).trim() : '';
    }
  }
  // Jika tidak ada di mapping, coba direct key
  const direct = record[field];
  return direct !== undefined && direct !== null ? String(direct).trim() : '';
}

// ================================================================
// 8. HELPER: Map Status
// ================================================================
function mapStatus(status: string): string {
  if (!status) return 'pending';
  const s = String(status).toLowerCase().trim();
  const statusMap: Record<string, string> = {
    'selesai': 'delivered',
    'diproses': 'confirmed',
    'dibatalkan': 'cancelled',
    'menunggu': 'pending',
    'pending': 'pending',
    'confirmed': 'confirmed',
    'shipped': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'completed': 'delivered',
    'processing': 'confirmed',
    'paid': 'confirmed',
    'success': 'delivered',
  };
  return statusMap[s] || 'pending';
}

// ================================================================
// 9. HELPER: Extract Phone Number
// ================================================================
function extractPhone(text: string): string {
  if (!text) return '';
  const match = text.match(/(\d{10,15})/);
  return match ? match[1] : '';
}