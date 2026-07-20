'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaTrash, FaTimes } from 'react-icons/fa';
import { submitOrder } from '@/app/actions/submitOrder';
import { getPublicProducts } from '@/app/actions/frontend';
import { Product } from '@/app/actions/products';

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

const CATEGORIES = ['All', 'Freeze Dried', 'Food Topper', 'Supplements'];

export default function OrderPage() {
  const { state, clearCart } = useCart();
  const searchParams = useSearchParams();

  const initialItems = useMemo(() => {
    const itemsParam = searchParams.get('items');
    if (!itemsParam) return {};
    const pairs = itemsParam.split(',');
    const map: Record<string, number> = {};
    pairs.forEach(pair => {
      const [id, qty] = pair.split(':');
      if (id && qty) map[id] = parseInt(qty, 10) || 1;
    });
    return map;
  }, [searchParams]);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    notes: '',
    items: {} as Record<string, number>,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getPublicProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (Object.keys(initialItems).length > 0) {
      setForm(prev => ({ ...prev, items: initialItems }));
    }
  }, [initialItems]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered;
  }, [searchQuery, selectedCategory, products]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setForm(prev => ({
      ...prev,
      items: { ...prev.items, [productId]: Math.max(0, quantity) },
    }));
  };

  const clearAllQuantities = () => {
    setForm(prev => ({ ...prev, items: {} }));
  };

  const selectedItems = useMemo(() => {
    return Object.entries(form.items)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        const price = product?.price ?? 0;
        return {
          product_name: product?.name || 'Unknown',
          category: product?.category || '',
          quantity: qty,
          price,
          subtotal: qty * price,
        };
      });
  }, [form.items, products]);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [selectedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await submitOrder({
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          email: form.customerEmail,
          address: form.customerAddress,
        },
        items: Object.entries(form.items)
          .filter(([_, qty]) => qty > 0)
          .map(([productId, qty]) => ({
            product_id: productId,
            quantity: qty,
          })),
        notes: form.notes,
      });

      // ✅ Redirect to invoice page
      window.location.href = `/invoice/${result.orderId}`;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">📦 Buat Pesanan</h1>
        <p className="opacity-90 mt-2">Isi detail pesanan dan pilih produk yang diinginkan.</p>
        {selectedItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
            <span className="font-semibold">🛒 {selectedItems.reduce((sum, i) => sum + i.quantity, 0)} produk</span>
            <span className="font-bold">Total: Rp {totalPrice.toLocaleString()}</span>
            <button
              onClick={clearAllQuantities}
              className="bg-red-500/20 hover:bg-red-500/40 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 transition"
            >
              <FaTrash size={12} /> Kosongkan
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-furmily-primary mb-4">Informasi Pemesan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm">Nomor WhatsApp *</label>
              <input
                type="tel"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm">Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm">Alamat Pengiriman</label>
              <input
                type="text"
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                placeholder="Jl. Contoh No. 123, Kota"
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-furmily-primary">Pilih Produk</h2>
            <div className="relative flex-1 max-w-sm">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                  selectedCategory === cat
                    ? 'bg-furmily-primary text-white border-furmily-primary'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <FaTimes size={12} /> Hapus filter
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Tidak ada produk yang ditemukan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-xl p-4 flex flex-col hover:shadow-md transition bg-gray-50/50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-furmily-primary">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <p className="text-sm font-bold text-furmily-primary mt-1">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={form.items[product.id] || 0}
                      onChange={(e) =>
                        handleQuantityChange(product.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 border rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{product.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block font-semibold text-furmily-primary">Catatan (opsional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded-lg px-4 py-2.5 mt-1 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
            rows={3}
            placeholder="Instruksi khusus atau permintaan tambahan..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-furmily-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-furmily-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Memproses...' : 'Kirim Pesanan'}
          {!loading && <FaShoppingCart />}
        </button>
      </form>
    </div>
  );
}