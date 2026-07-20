// app/products/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getPublicProducts } from '@/app/actions/frontend';
import { getCategories } from '@/app/actions/products';
import { Product } from '@/app/actions/products';
import ProductCard from '@/components/ProductCard';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ✅ REMOVE the invalid line: const discountedPrice = ...

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getPublicProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(['All', ...categoriesData.filter(c => c !== 'All')]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">🛒 Semua Produk</h1>
        <p className="opacity-90 mt-2">
          Camilan sehat dan bergizi untuk kucing & anjing kesayangan Anda.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
          <span className="font-semibold">{products.length} produk tersedia</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                selectedCategory === cat
                  ? 'bg-furmily-primary text-white border-furmily-primary'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {cat === 'All' ? 'Semua' : cat}
            </button>
          ))}
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
            >
              <FaTimes size={12} /> Hapus filter
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Tidak ada produk yang cocok.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}