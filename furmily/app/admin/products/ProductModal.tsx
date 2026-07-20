// app/admin/products/ProductModal.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { createProduct, updateProduct, ProductFormData, Product } from '@/app/actions/products';
import { uploadProductImage } from '@/app/actions/upload';
import { FaUpload, FaTimes, FaSpinner } from 'react-icons/fa';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [form, setForm] = useState<Partial<ProductFormData>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    badge: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      const { id, created_at, updated_at, ...formData } = product;
      setForm(formData);
      setPreviewUrl(formData.image_url || null);
    } else {
      setForm({ name: '', category: '', description: '', price: 0, stock: 0, image_url: '', badge: '' });
      setPreviewUrl(null);
    }
  }, [product]);

  // Auto‑upload when file is selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadProductImage(formData);
      setForm(prev => ({ ...prev, image_url: url }));
      setPreviewUrl(url); // Use the actual URL for final preview
      // Clear file input so the same file can be re‑selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert('Gagal upload gambar: ' + err.message);
      // Revert preview to previous image
      setPreviewUrl(form.image_url || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!form.name || !form.category || form.price === undefined || form.stock === undefined) {
        alert('Nama, kategori, harga, dan stok wajib diisi.');
        setLoading(false);
        return;
      }
      const data = form as ProductFormData;
      if (product?.id) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert('Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-furmily-primary mb-4">
          {product ? 'Edit Produk' : 'Tambah Produk'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold">Nama *</label>
            <input
              type="text"
              required
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold">Kategori *</label>
            <select
              required
              value={form.category || ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Pilih kategori</option>
              <option value="Freeze Dried">Freeze Dried</option>
              <option value="Food Topper">Food Topper</option>
              <option value="Supplements">Supplements</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold">Deskripsi</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Harga (Rp) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={form.price || 0}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Stok *</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock || 0}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Diskon (%)</label>
              <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount_percent || 0}
                  onChange={(e) => setForm({ ...form, discount_percent: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold">Gambar Produk</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
              >
                <FaUpload size={14} /> Pilih Gambar
              </label>
              {uploading && <FaSpinner className="animate-spin text-furmily-primary" size={20} />}
              {(form.image_url || previewUrl) && !uploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <FaTimes size={14} /> Hapus
                </button>
              )}
            </div>

            {/* Preview */}
            {(previewUrl || form.image_url) && (
              <div className="mt-2 relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={previewUrl || form.image_url || ''}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {form.image_url && !previewUrl && (
              <div className="mt-1 text-xs text-gray-500 truncate">
                {form.image_url}
              </div>
            )}
          </div>

          {/* Badge */}
          <div>
            <label className="block text-sm font-semibold">Badge (opsional)</label>
            <input
              type="text"
              value={form.badge || ''}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Best Seller, Premium, dll."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-full hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}