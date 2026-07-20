// app/admin/products/page.tsx

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  getProducts,
  deleteProduct,
  Product,
  ProductFormData,
} from '@/app/actions/products';
import { exportProductsCSV, importProductsCSV } from '@/app/actions/product-import-export';
import ProductModal from './ProductModal';
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaDownload,
  FaUpload,
  FaSpinner,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';

// Get unique categories from products (client-side)
const getCategories = (products: Product[]) => {
  const cats = new Set(products.map(p => p.category));
  return ['All', ...Array.from(cats)];
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async (filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setLoading(true);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      alert('Gagal mengambil produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Client‑side filtering for immediate UI update
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) result = result.filter(p => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) result = result.filter(p => p.price <= max);
    }
    return result;
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice]);

  const categories = useMemo(() => getCategories(products), [products]);

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct(id);
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
    } catch (err) {
      alert('Gagal menghapus produk');
    }
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setModalOpen(true);
  };

  const handleExport = async () => {
    if (filteredProducts.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const csv = await exportProductsCSV(filteredProducts);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      alert('Pilih file CSV terlebih dahulu.');
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const result = await importProductsCSV(formData);
      alert(`Berhasil mengimpor ${result.count} produk.`);
      setShowImportModal(false);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
    } catch (err: any) {
      alert('Gagal import: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">🛒 Manajemen Produk</h1>
        <p className="opacity-90 mt-2">Kelola semua produk, stok, harga, dan diskon.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
          <span className="font-semibold">Total: {products.length} produk</span>
          <span className="text-white/70">|</span>
          <span className="font-semibold">Tampil: {filteredProducts.length} produk</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => openModal()}
              className="bg-furmily-primary hover:bg-furmily-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FaPlus /> Tambah
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || filteredProducts.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              Export CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FaUpload /> Import
            </button>
          </div>
        </div>
        {(searchQuery || selectedCategory !== 'All' || minPrice || maxPrice) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Filter aktif:</span>
            {searchQuery && <span className="bg-gray-100 px-2 py-1 rounded">Cari: {searchQuery}</span>}
            {selectedCategory !== 'All' && <span className="bg-gray-100 px-2 py-1 rounded">Kategori: {selectedCategory}</span>}
            {minPrice && <span className="bg-gray-100 px-2 py-1 rounded">Min: Rp {Number(minPrice).toLocaleString()}</span>}
            {maxPrice && <span className="bg-gray-100 px-2 py-1 rounded">Max: Rp {Number(maxPrice).toLocaleString()}</span>}
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMinPrice(''); setMaxPrice(''); }}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes size={12} /> Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      {loading ? (
        <p className="text-center py-12">Loading...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Tidak ada produk sesuai filter.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Nama</th>
                <th className="p-3 text-left text-sm font-semibold">Kategori</th>
                <th className="p-3 text-left text-sm font-semibold">Harga</th>
                <th className="p-3 text-left text-sm font-semibold">Diskon</th>
                <th className="p-3 text-left text-sm font-semibold">Harga Diskon</th>
                <th className="p-3 text-left text-sm font-semibold">Stok</th>
                <th className="p-3 text-left text-sm font-semibold">Badge</th>
                <th className="p-3 text-left text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const discountedPrice = p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">Rp {p.price.toLocaleString()}</td>
                    <td className="p-3">
                      {p.discount_percent ? `${p.discount_percent}%` : '-'}
                    </td>
                    <td className="p-3 font-bold text-furmily-primary">
                      {p.discount_percent ? `Rp ${discountedPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.badge || '-'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(p)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchProducts({
            search: searchQuery || undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          });
        }}
        product={editingProduct}
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-furmily-primary">📤 Import Produk</h2>
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload file CSV dengan kolom: <br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                name,category,description,price,stock,discount_percent,image_url,badge
              </code>
              <br />
              <span className="text-xs">(produk dengan nama yang sama akan diupdate)</span>
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              ref={fileInputRef}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="px-4 py-2 border rounded-full hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={importing || !importFile}
                className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark disabled:opacity-50"
              >
                {importing ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}