'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Calculate total
  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Build deep link to order page with cart items as query params
  const handleCheckout = () => {
    setCheckoutLoading(true);
    // Convert cart items to a query string: items=productId:quantity,productId:quantity
    const itemsParam = state.items.map(item => `${item.id}:${item.quantity}`).join(',');
    const url = `/order?items=${encodeURIComponent(itemsParam)}`;
    window.location.href = url;
  };

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold text-furmily-primary mb-4">🛒 Keranjang Belanja</h1>
        <div className="bg-gray-50 rounded-xl p-12">
          <p className="text-gray-500 text-lg">Keranjang Anda kosong.</p>
          <Link href="/products" className="inline-block mt-4 bg-furmily-primary text-white px-6 py-3 rounded-full hover:bg-furmily-dark transition">
            Lihat Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-furmily-primary mb-6">🛒 Keranjang Belanja</h1>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {state.items.map((item) => (
            <li key={item.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[150px]">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="font-bold text-furmily-primary">Rp {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center">
          <div>
            <span className="font-bold text-lg">Total: </span>
            <span className="text-xl font-bold text-furmily-primary">Rp {total.toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm border border-red-300 px-4 py-2 rounded-full hover:bg-red-50 transition"
            >
              Kosongkan
            </button>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || state.items.length === 0}
              className="bg-furmily-primary text-white px-6 py-3 rounded-full hover:bg-furmily-dark transition disabled:opacity-50"
            >
              {checkoutLoading ? 'Memproses...' : 'Checkout →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}