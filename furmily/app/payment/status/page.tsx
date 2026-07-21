// app/payment/status/page.tsx
'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { checkPaymentStatus } from '@/app/actions/checkPaymentStatus';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'not_found'>('pending');
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setLoading(false);
      setError('No order ID provided');
      return;
    }

    const checkOrder = async () => {
      try {
        // 1. Fetch order from database (include total_amount)
        const { data: order, error } = await supabase
          .from('orders')
          .select('order_number, status, id, total_amount')
          .eq('id', orderId)
          .single();

        if (error || !order) {
          setStatus('not_found');
          setLoading(false);
          setError('Order not found');
          return;
        }

        setOrderNumber(order.order_number);

        // 2. If order already confirmed, show success
        if (order.status === 'confirmed' || order.status === 'delivered') {
          setStatus('success');
          setLoading(false);
          return;
        }

        // 3. Call DOKU to check payment status
        const paymentResult = await checkPaymentStatus(order.order_number);

        if (paymentResult.status === 'SUCCESS' || paymentResult.status === 'PAID' || paymentResult.status === 'SETTLED') {
          // Update order status in database
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_id: paymentResult.paymentId,
              payment_date: paymentResult.paymentDate || new Date().toISOString(),
              payment_amount: paymentResult.amount || order.total_amount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          if (updateError) {
            console.error('Failed to update order:', updateError);
            setError('Failed to update order status, but payment appears successful.');
            setStatus('failed');
          } else {
            setStatus('success');
          }
        } else if (paymentResult.status === 'PENDING') {
          setStatus('pending');
        } else if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(paymentResult.status)) {
          setStatus('failed');
          setError(`Payment ${paymentResult.status.toLowerCase()}`);
        } else {
          // Unknown status – maybe still processing
          setStatus('pending');
          setError('Payment is still being processed. Please check back later.');
        }
      } catch (err: any) {
        console.error('Error checking payment:', err);
        setStatus('failed');
        setError(err.message || 'Failed to check payment status');
      } finally {
        setLoading(false);
      }
    };

    checkOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-20 p-8 text-center">
        <div className="animate-spin text-4xl mb-4">🔄</div>
        <p className="text-gray-500">Memproses pembayaran...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-20 p-8 bg-green-50 rounded-xl text-center">
        <h1 className="text-3xl font-bold text-green-600">✅ Pembayaran Berhasil!</h1>
        <p className="mt-4 text-gray-700">Pesanan Anda telah dikonfirmasi.</p>
        <p className="mt-2 text-sm text-gray-500">Kami akan segera memproses pesanan Anda.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href={`/invoice/${orderId}`} className="bg-furmily-primary text-white px-6 py-3 rounded-full hover:bg-furmily-dark transition">
            Lihat Invoice
          </Link>
          <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="max-w-lg mx-auto mt-20 p-8 bg-yellow-50 rounded-xl text-center">
        <h1 className="text-3xl font-bold text-yellow-600">⏳ Pembayaran Diproses</h1>
        <p className="mt-4 text-gray-700">Pembayaran Anda sedang diproses.</p>
        <p className="mt-2 text-sm text-gray-500">Jika sudah selesai, status akan otomatis berubah.</p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-furmily-primary text-white px-6 py-3 rounded-full hover:bg-furmily-dark transition"
          >
            Cek Status Ulang
          </button>
          <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Failed or not found
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-red-50 rounded-xl text-center">
      <h1 className="text-3xl font-bold text-red-600">❌ Pembayaran Gagal</h1>
      <p className="mt-4 text-gray-700">Terjadi masalah saat memproses pembayaran Anda.</p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/order" className="bg-furmily-primary text-white px-6 py-3 rounded-full hover:bg-furmily-dark transition">
          Coba Lagi
        </Link>
        <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}