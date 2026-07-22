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
import { parseProductsFromText, saveProducts } from '@/app/actions/product-import';
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
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Get unique categories from products (client-side)
const getCategories = (products: Product[]) => {
  const cats = new Set(products.map(p => p.category));
  return ['All', ...Array.from(cats)];
};

// Temporary product type for bulk import
type UnsavedProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  discount_percent: number;
  weight: number;      // ✅
  image_url: string;
  badge: string;
};

export default function AdminProducts() {
  // --- Existing state ---
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

  // --- Bulk import states ---
  const [unsavedProducts, setUnsavedProducts] = useState<UnsavedProduct[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [processingFile, setProcessingFile] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [importInfo, setImportInfo] = useState<string | null>(null);

  // --- Existing fetch & handlers ---
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

  // --- AI Import Functions (copied and adapted from orders page) ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const mimeType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      const { data: { text } } = await Tesseract.recognize(
        Buffer.from(buffer),
        'eng+ind',
        { logger: m => console.log(m) }
      );
      return text;
    }

    if (mimeType === 'application/pdf' || extension === 'pdf') {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return result.value;
    }

    return new TextDecoder().decode(buffer);
  };

  const handleFileSelection = async (file: File) => {
    setProcessingFile(true);
    setImportInfo(null);
    try {
      const rawText = await extractTextFromFile(file);
      if (!rawText.trim()) throw new Error('Tidak ada teks yang dapat diekstrak dari file.');

      const parsedProducts = await parseProductsFromText(rawText);
      if (parsedProducts.length === 0) throw new Error('Tidak ada produk yang ditemukan dalam file.');

      const unsaved: UnsavedProduct[] = parsedProducts.map((p: any, idx: number) => ({
        id: `temp-${Date.now()}-${idx}`,
        name: p.name || '',
        category: p.category || '',
        description: p.description || '',
        price: p.price || 0,
        stock: p.stock || 0,
        discount_percent: p.discount_percent || 0,
        weight: p.weight ?? 0,   // ✅ tambahkan
        image_url: p.image_url || '',
        badge: p.badge || '',
      }));

      setUnsavedProducts(unsaved);
      setActiveProductIndex(0);
      setShowBulkModal(true);
      setImportInfo(`✅ ${unsaved.length} produk berhasil diekstrak.`);
      setTimeout(() => setImportInfo(null), 5000);
    } catch (error: any) {
      alert('Gagal memproses file: ' + error.message);
    } finally {
      setProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBulkSave = async () => {
    setSavingBulk(true);
    try {
      const result = await saveProducts(unsavedProducts);
      if (result.errors && result.errors.length > 0) {
        alert(`Berhasil ${result.count} produk, gagal ${result.errors.length}. Detail: ${result.errors.join('; ')}`);
      } else {
        alert(`✅ Berhasil mengimpor ${result.count} produk ke database!`);
      }
      setShowBulkModal(false);
      setUnsavedProducts([]);
      fetchProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
    } catch (error: any) {
      alert('Gagal menyimpan produk: ' + error.message);
    } finally {
      setSavingBulk(false);
    }
  };

  // ---- Bulk Product Modal Component ----
  const BulkProductModal = () => {
    if (unsavedProducts.length === 0) return null;
    const current = unsavedProducts[activeProductIndex];
    if (!current) return null;

    const updateCurrent = (updates: Partial<UnsavedProduct>) => {
      const newProducts = [...unsavedProducts];
      newProducts[activeProductIndex] = { ...newProducts[activeProductIndex], ...updates };
      setUnsavedProducts(newProducts);
    };

    const addNew = () => {
      const newProduct: UnsavedProduct = {
        id: `temp-${Date.now()}-${Math.random()}`,
        name: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        discount_percent: 0,
        weight: 0,   // ✅
        image_url: '',
        badge: '',
      };
      setUnsavedProducts([...unsavedProducts, newProduct]);
      setActiveProductIndex(unsavedProducts.length);
    };

    const removeCurrent = () => {
      if (unsavedProducts.length === 1) {
        alert('Setidaknya harus ada satu produk.');
        return;
      }
      const newProducts = unsavedProducts.filter((_, i) => i !== activeProductIndex);
      setUnsavedProducts(newProducts);
      setActiveProductIndex(Math.min(activeProductIndex, newProducts.length - 1));
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-0 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-2xl font-bold">📋 Review & Edit Produk</h2>
            <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <FaTimes />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <button
              onClick={() => setActiveProductIndex(Math.max(0, activeProductIndex - 1))}
              disabled={activeProductIndex === 0}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-full"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Produk {activeProductIndex + 1} dari {unsavedProducts.length}
            </span>
            <button
              onClick={() => setActiveProductIndex(Math.min(unsavedProducts.length - 1, activeProductIndex + 1))}
              disabled={activeProductIndex === unsavedProducts.length - 1}
              className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-full"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={current.name}
                  onChange={(e) => updateCurrent({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  value={current.category}
                  onChange={(e) => updateCurrent({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih kategori</option>
                  <option value="Freeze Dried">Freeze Dried</option>
                  <option value="Food Topper">Food Topper</option>
                  <option value="Supplements">Supplements</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  value={current.description}
                  onChange={(e) => updateCurrent({ description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                <input
                  type="number"
                  step="1000"
                  value={current.price}
                  onChange={(e) => updateCurrent({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stok</label>
                <input
                  type="number"
                  value={current.stock}
                  onChange={(e) => updateCurrent({ stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diskon (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={current.discount_percent}
                  onChange={(e) => updateCurrent({ discount_percent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Berat (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={current.weight ?? 0}
                  onChange={(e) => updateCurrent({ weight: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Untuk perhitungan ongkir</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Badge</label>
                <input
                  type="text"
                  value={current.badge}
                  onChange={(e) => updateCurrent({ badge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Best Seller, Premium, dll."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions (sticky) */}
          <div className="border-t border-gray-100 p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={removeCurrent}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Hapus Ini
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addNew}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                + Tambah Manual
              </button>
              <button
                onClick={() => {
                  if (confirm('Batalkan import? Data akan hilang.')) {
                    setShowBulkModal(false);
                    setUnsavedProducts([]);
                  }
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleBulkSave}
                disabled={savingBulk}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                {savingBulk ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                {savingBulk ? 'Menyimpan...' : '📤 Simpan Semua ke Database'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---- Main Render ----
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
          {importInfo && (
            <span className="bg-green-500/30 px-3 py-1 rounded-full text-xs">{importInfo}</span>
          )}
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
            <input
              type="file"
              accept=".csv,.png,.jpg,.jpeg,.pdf,.docx,.txt"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelection(file);
              }}
              className="hidden"
              id="import-product-file"
            />
            <button
              onClick={() => document.getElementById('import-product-file')?.click()}
              disabled={processingFile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {processingFile ? <FaSpinner className="animate-spin" /> : <FaUpload />}
              {processingFile ? 'Memproses...' : 'Import AI'}
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
                <th className="p-3 text-left text-sm font-semibold">Berat (kg)</th>  {/* ✅ */}
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
                    <td className="p-3">{p.weight ?? 0}</td>  {/* ✅ */}
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

      {/* Bulk Product Modal */}
      {showBulkModal && <BulkProductModal />}
    </div>
  );
}