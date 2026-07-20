'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  const exportOrders = async () => {
    setLoading(true);
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `);

    if (error) {
      alert('Gagal mengambil data');
      setLoading(false);
      return;
    }

    // Flatten data for CSV
    const rows = orders.flatMap(order => 
      order.items.map((item: any) => ({
        'Order Number': order.order_number,
        'Customer Name': order.customer?.name,
        'Phone': order.customer?.phone,
        'Address': order.customer?.address,
        'Product': item.product_name,
        'Variant': item.variant || '',
        'Quantity': item.quantity,
        'Price': item.price,
        'Subtotal': item.subtotal,
        'Total Order': order.total_amount,
        'Status': order.status,
        'Order Date': new Date(order.created_at).toLocaleDateString(),
        'Notes': order.notes || '',
      }))
    );

    // Generate CSV
    const headers = Object.keys(rows[0] || {});
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Export Data</h1>
      <button
        onClick={exportOrders}
        disabled={loading}
        className="mt-4 bg-furmily-primary text-white px-6 py-2 rounded"
      >
        {loading ? 'Memproses...' : 'Export Semua Pesanan ke CSV'}
      </button>
      <p className="mt-2 text-sm text-gray-600">Format CSV kompatibel dengan Jetnote.</p>
    </div>
  );
}