'use client';

import { useEffect, useState } from 'react';
import { getOrderById } from '@/app/actions/getOrder';

export default function InvoicePage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(params.orderId);
        setOrder(data);
      } catch (err) {
        setError('Invoice not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Invoice not found</p>
      </div>
    );
  }

  const { customer, items, order_number, created_at, total_amount, status, notes, delivery_estimate } = order;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Print Button (hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-4 no-print">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold text-furmily-primary">🧾 Invoice</h1>
          <button
            onClick={handlePrint}
            className="bg-furmily-primary text-white px-6 py-2 rounded-full hover:bg-furmily-dark transition"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-furmily-primary">🐾 Furmily</h1>
            <p className="text-sm text-gray-500">Premium Pet Nutrition</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-furmily-primary">INVOICE</p>
            <p className="text-sm text-gray-500">#{order_number}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><span className="font-semibold">Tanggal:</span> {new Date(created_at).toLocaleString('id-ID')}</p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100'}`}>
                {status}
              </span>
            </p>
            {delivery_estimate && (
              <p><span className="font-semibold">Estimasi Kirim:</span> {delivery_estimate}</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Informasi Pelanggan</p>
            <p>{customer?.name}</p>
            <p>{customer?.phone}</p>
            {customer?.email && <p>{customer.email}</p>}
            {customer?.address && <p>{customer.address}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3 font-semibold">Produk</th>
                <th className="text-left py-2 px-3 font-semibold">Varian</th>
                <th className="text-right py-2 px-3 font-semibold">Qty</th>
                <th className="text-right py-2 px-3 font-semibold">Harga</th>
                <th className="text-right py-2 px-3 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-3">{item.product_name}</td>
                  <td className="py-2 px-3">{item.variant || '-'}</td>
                  <td className="py-2 px-3 text-right">{item.quantity}</td>
                  <td className="py-2 px-3 text-right">Rp {item.price.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">Rp {item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right font-bold">Total</td>
                <td className="py-3 px-3 text-right font-bold text-furmily-primary">
                  Rp {total_amount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-6 text-sm">
            <p className="font-semibold">Catatan:</p>
            <p className="text-gray-600">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 text-center text-sm text-gray-500">
          <p>Terima kasih telah berbelanja di Furmily!</p>
          <p>📍 Indonesia: Crest Drive 1/7, Park Serpong | 📍 Malaysia: 24B, Jalan Anggerik Vanilla 31/93</p>
          <p>📱 WhatsApp: +62 821-7211-1660 | ✉️ info@furmily.com</p>
        </div>
      </div>
    </div>
  );
}