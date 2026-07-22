// app/admin/orders/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getOrders, updateOrderStatus, createOrder, updateOrder, updateFullOrder, deleteOrder } from '@/app/actions/orders';
import { getCustomers } from '@/app/actions/customers';
import { exportOrdersToCSV } from '@/app/actions/export';
import { parseOrdersFromText, saveOrders, importJetnoteCSV } from '@/app/actions/import';
import {
  FaEye, FaTimes, FaSearch, FaDownload, FaUpload, FaSpinner,
  FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import React from 'react';

// Set PDF.js worker (optional)
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  confirmed: 'bg-blue-200 text-blue-800',
  shipped: 'bg-purple-200 text-purple-800',
  delivered: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800',
};

type UnsavedOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  status: string;
  notes: string;
  payment_method: string;
  transaction_date: string;
  product_name: string;
  quantity: number;
  price: number;
};

// ============================
// BulkOrderModal – Stable Input Focus
// ============================
interface BulkOrderModalProps {
  unsavedOrders: UnsavedOrder[];
  activeOrderIndex: number;
  setActiveOrderIndex: (index: number) => void;
  setUnsavedOrders: (orders: UnsavedOrder[]) => void;
  setShowBulkModal: (show: boolean) => void;
  handleBulkSave: () => Promise<void>;
  savingBulk: boolean;
}

const BulkOrderModal = React.memo<BulkOrderModalProps>(({
  unsavedOrders,
  activeOrderIndex,
  setActiveOrderIndex,
  setUnsavedOrders,
  setShowBulkModal,
  handleBulkSave,
  savingBulk,
}) => {
  if (unsavedOrders.length === 0) return null;
  const current = unsavedOrders[activeOrderIndex];
  if (!current) return null;

  const updateCurrent = React.useCallback((updates: Partial<UnsavedOrder>) => {
    const newOrders = [...unsavedOrders];
    newOrders[activeOrderIndex] = { ...newOrders[activeOrderIndex], ...updates };
    setUnsavedOrders(newOrders);
  }, [unsavedOrders, activeOrderIndex, setUnsavedOrders]);

  const addNew = React.useCallback(() => {
    const newOrder: UnsavedOrder = {
      id: `temp-${Date.now()}-${Math.random()}`,
      order_number: `ORD-${Date.now()}`,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
      total_amount: 0,
      status: 'pending',
      notes: '',
      payment_method: '',
      transaction_date: '',
      product_name: 'Import Item',
      quantity: 1,
      price: 0,
    };
    setUnsavedOrders([...unsavedOrders, newOrder]);
    setActiveOrderIndex(unsavedOrders.length);
  }, [unsavedOrders, setUnsavedOrders, setActiveOrderIndex]);

  const removeCurrent = React.useCallback(() => {
    if (unsavedOrders.length === 1) {
      alert('Setidaknya harus ada satu pesanan.');
      return;
    }
    const newOrders = unsavedOrders.filter((_, i) => i !== activeOrderIndex);
    setUnsavedOrders(newOrders);
    setActiveOrderIndex(Math.min(activeOrderIndex, newOrders.length - 1));
  }, [unsavedOrders, activeOrderIndex, setUnsavedOrders, setActiveOrderIndex]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-2xl font-bold">📋 Review & Edit Pesanan</h2>
          <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={() => setActiveOrderIndex(Math.max(0, activeOrderIndex - 1))}
            disabled={activeOrderIndex === 0}
            className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-full"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            Pesanan {activeOrderIndex + 1} dari {unsavedOrders.length}
          </span>
          <button
            onClick={() => setActiveOrderIndex(Math.min(unsavedOrders.length - 1, activeOrderIndex + 1))}
            disabled={activeOrderIndex === unsavedOrders.length - 1}
            className="p-2 disabled:opacity-50 hover:bg-gray-100 rounded-full"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* ============================================ */}
            {/* INPUT DENGAN KEY UNIK & STABIL */}
            {/* ============================================ */}
            <div key={`${current.id}-order_number`}>
              <label className="block text-sm font-medium text-gray-700">No. Order</label>
              <input
                type="text"
                value={current.order_number}
                onChange={(e) => updateCurrent({ order_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-customer_name`}>
              <label className="block text-sm font-medium text-gray-700">Nama Customer</label>
              <input
                type="text"
                value={current.customer_name}
                onChange={(e) => updateCurrent({ customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-customer_phone`}>
              <label className="block text-sm font-medium text-gray-700">Telepon Customer</label>
              <input
                type="text"
                value={current.customer_phone}
                onChange={(e) => updateCurrent({ customer_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-total_amount`}>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input
                type="number"
                step="100"
                value={current.total_amount}
                onChange={(e) => updateCurrent({ total_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-status`}>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={current.status}
                onChange={(e) => updateCurrent({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div key={`${current.id}-product_name`}>
              <label className="block text-sm font-medium text-gray-700">Produk</label>
              <input
                type="text"
                value={current.product_name}
                onChange={(e) => updateCurrent({ product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-quantity`}>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={current.quantity}
                onChange={(e) => updateCurrent({ quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div key={`${current.id}-notes`}>
              <label className="block text-sm font-medium text-gray-700">Catatan</label>
              <textarea
                value={current.notes}
                onChange={(e) => updateCurrent({ notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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
                  setUnsavedOrders([]);
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
});

BulkOrderModal.displayName = 'BulkOrderModal';

export default function AdminOrders() {
  // ---- State ----
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [exporting, setExporting] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [importInfo, setImportInfo] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'jetnote' | 'ai'>('jetnote');

  // Modal create/edit
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    items: [{ product_name: '', variant: '', quantity: 1, price: 0, subtotal: 0 }],
    notes: '',
    delivery_estimate: '',
    status: 'pending',
  });
  const [orderFormLoading, setOrderFormLoading] = useState(false);

  // Bulk import states
  const [unsavedOrders, setUnsavedOrders] = useState<UnsavedOrder[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeOrderIndex, setActiveOrderIndex] = useState(0);
  const [savingBulk, setSavingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Existing functions (fetch, CRUD) ----
  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const data = await getOrders(status ? { status } : undefined);
      setOrders(data);
    } catch (err) {
      alert('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Gagal mengambil customer:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders(statusFilter !== 'all' ? statusFilter : undefined);
    } catch (err) {
      alert('Gagal mengupdate status');
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchOrders(status !== 'all' ? status : undefined);
  };

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(order =>
        order.order_number.toLowerCase().includes(q) ||
        order.customer?.name?.toLowerCase().includes(q) ||
        order.customer?.phone?.includes(q)
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(order => new Date(order.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(order => new Date(order.created_at) <= end);
    }
    return result;
  }, [orders, searchQuery, startDate, endDate]);

  // ---- CRUD handlers ----
  const handleCreateOrder = () => {
    setEditingOrder(null);
    setOrderForm({
      customer_id: '',
      items: [{ product_name: '', variant: '', quantity: 1, price: 0, subtotal: 0 }],
      notes: '',
      delivery_estimate: '',
      status: 'pending',
    });
    setShowOrderModal(true);
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    const items = order.items?.map((item: any) => ({
      product_name: item.product_name || '',
      variant: item.variant || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      subtotal: item.subtotal || 0,
    })) || [{ product_name: '', variant: '', quantity: 1, price: 0, subtotal: 0 }];

    setOrderForm({
      customer_id: order.customer_id,
      items: items,
      notes: order.notes || '',
      delivery_estimate: order.delivery_estimate || '',
      status: order.status || 'pending',
    });
    setShowOrderModal(true);
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Yakin ingin menghapus pesanan ${orderNumber}?`)) return;
    try {
      await deleteOrder(orderId);
      fetchOrders(statusFilter !== 'all' ? statusFilter : undefined);
    } catch (err) {
      alert('Gagal menghapus pesanan');
    }
  };

  const handleOrderFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderFormLoading(true);
    try {
      const total = orderForm.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      if (editingOrder) {
        await updateFullOrder(editingOrder.id, {
          status: orderForm.status,
          notes: orderForm.notes,
          delivery_estimate: orderForm.delivery_estimate,
          items: orderForm.items,
        });
      } else {
        await createOrder({
          customerId: orderForm.customer_id,
          items: orderForm.items,
          totalAmount: total,
          notes: orderForm.notes,
          deliveryEstimate: orderForm.delivery_estimate,
        });
      }
      setShowOrderModal(false);
      fetchOrders(statusFilter !== 'all' ? statusFilter : undefined);
    } catch (err: any) {
      alert('Gagal menyimpan pesanan: ' + err.message);
    } finally {
      setOrderFormLoading(false);
    }
  };

  const addOrderItem = () => {
    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { product_name: '', variant: '', quantity: 1, price: 0, subtotal: 0 }],
    }));
  };

  const removeOrderItem = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    setOrderForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'quantity' || field === 'price') {
        const qty = newItems[index].quantity || 0;
        const price = newItems[index].price || 0;
        newItems[index].subtotal = qty * price;
      }
      return { ...prev, items: newItems };
    });
  };

  const handleExport = async () => {
    if (filteredOrders.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const csv = await exportOrdersToCSV(filteredOrders);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal export data');
    } finally {
      setExporting(false);
    }
  };

  // ---- AI Import Functions ----
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

  const handleFileSelection = async (file: File, mode: 'jetnote' | 'ai') => {
    setProcessingFile(true);
    setImportInfo(null);
    try {
      if (mode === 'jetnote') {
        // Gunakan parser Jetnote hardcoded (CSV hanya)
        const formData = new FormData();
        formData.append('file', file);
        const result = await importJetnoteCSV(formData);
        if (result.errors?.length) {
          alert(`Berhasil ${result.count} pesanan, gagal ${result.errors.length}. Detail: ${result.errors.join('; ')}`);
        } else {
          alert(`✅ Berhasil mengimpor ${result.count} pesanan.`);
        }
        fetchOrders(statusFilter !== 'all' ? statusFilter : undefined);
      } else {
        // AI Universal
        const rawText = await extractTextFromFile(file);
        if (!rawText.trim()) throw new Error('Tidak ada teks yang dapat diekstrak.');
        const parsedOrders = await parseOrdersFromText(rawText);
        if (parsedOrders.length === 0) throw new Error('Tidak ada pesanan yang ditemukan.');
        // Convert ke UnsavedOrder
        const unsaved: UnsavedOrder[] = parsedOrders.map((order: any, idx: number) => ({
          id: `temp-${Date.now()}-${idx}`,
          order_number: order.order_number || `ORD-${Date.now()}-${idx}`,
          customer_name: order.customer_name || '',
          customer_phone: order.customer_phone || '',
          customer_email: order.customer_email || '',
          customer_address: order.customer_address || '',
          total_amount: order.total_amount || 0,
          status: order.status || 'pending',
          notes: order.notes || '',
          payment_method: order.payment_method || '',
          transaction_date: order.transaction_date || '',
          product_name: order.product_name || 'Import Item',
          quantity: order.quantity || 1,
          price: order.price || 0,
        }));
        setUnsavedOrders(unsaved);
        setActiveOrderIndex(0);
        setShowBulkModal(true);
        setImportInfo(`✅ ${unsaved.length} pesanan berhasil diekstrak.`);
        setTimeout(() => setImportInfo(null), 5000);
      }
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
      const result = await saveOrders(unsavedOrders);
      if (result.errors && result.errors.length > 0) {
        alert(`Berhasil ${result.count} pesanan, gagal ${result.errors.length}. Detail: ${result.errors.join('; ')}`);
      } else {
        alert(`✅ Berhasil mengimpor ${result.count} pesanan ke database!`);
      }
      setShowBulkModal(false);
      setUnsavedOrders([]);
      fetchOrders(statusFilter !== 'all' ? statusFilter : undefined);
    } catch (error: any) {
      alert('Gagal menyimpan pesanan: ' + error.message);
    } finally {
      setSavingBulk(false);
    }
  };

  // ---- Main Render ----
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">📦 Manajemen Pesanan</h1>
            <p className="opacity-90 mt-2">Kelola semua pesanan pelanggan dari satu tempat.</p>
          </div>
          <button
            onClick={handleCreateOrder}
            className="bg-white text-furmily-primary px-4 py-2 rounded-full font-semibold hover:bg-furmily-cream transition flex items-center gap-2"
          >
            <FaPlus /> Tambah Pesanan
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
          <span className="font-semibold">Total: {orders.length} pesanan</span>
          <span className="text-white/70">|</span>
          <span className="font-semibold">Tampil: {filteredOrders.length} pesanan</span>
          {importInfo && (
            <span className="bg-green-500/30 px-3 py-1 rounded-full text-xs">{importInfo}</span>
          )}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
                statusFilter === 'all' ? 'bg-furmily-primary text-white border-furmily-primary' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition border capitalize ${
                  statusFilter === status ? 'bg-furmily-primary text-white border-furmily-primary' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari no. order, nama, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || filteredOrders.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? <FaSpinner className="animate-spin" /> : <FaDownload />} Export CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FaUpload /> Import
            </button>
          </div>
        </div>
        {(searchQuery || startDate || endDate) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Filter aktif:</span>
            {searchQuery && <span className="bg-gray-100 px-2 py-1 rounded">Cari: {searchQuery}</span>}
            {startDate && <span className="bg-gray-100 px-2 py-1 rounded">Dari: {startDate}</span>}
            {endDate && <span className="bg-gray-100 px-2 py-1 rounded">Sampai: {endDate}</span>}
            <button
              onClick={() => { setSearchQuery(''); setStartDate(''); setEndDate(''); }}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes size={12} /> Hapus semua
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <p className="text-center py-12">Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Tidak ada pesanan sesuai filter.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">No. Order</th>
                <th className="p-3 text-left text-sm font-semibold">Pelanggan</th>
                <th className="p-3 text-left text-sm font-semibold">Total</th>
                <th className="p-3 text-left text-sm font-semibold">Status</th>
                <th className="p-3 text-left text-sm font-semibold">Tanggal</th>
                <th className="p-3 text-left text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{order.order_number}</td>
                  <td className="p-3">
                    {order.customer?.name}
                    <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                  </td>
                  <td className="p-3 font-bold">Rp {order.total_amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-200'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-furmily-primary outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id, order.order_number)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <FaTrash size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Detail"
                      >
                        <FaEye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-furmily-primary">
                Detail Pesanan #{selectedOrder.order_number}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-red-500">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">Pelanggan:</span> {selectedOrder.customer?.name}</div>
                <div><span className="font-semibold">Telepon:</span> {selectedOrder.customer?.phone}</div>
                <div className="col-span-2"><span className="font-semibold">Alamat:</span> {selectedOrder.customer?.address || '-'}</div>
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div><span className="font-semibold">Tanggal:</span> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</div>
                {selectedOrder.delivery_estimate && <div className="col-span-2"><span className="font-semibold">Estimasi Pengiriman:</span> {selectedOrder.delivery_estimate}</div>}
                {selectedOrder.notes && <div className="col-span-2"><span className="font-semibold">Catatan:</span> {selectedOrder.notes}</div>}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Item Pesanan</h3>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Produk</th>
                      <th className="p-2 text-left">Varian</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Harga</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.product_name}</td>
                        <td className="p-2">{item.variant || '-'}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">Rp {item.price.toLocaleString()}</td>
                        <td className="p-2 text-right font-medium">Rp {item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t font-bold">
                    <tr>
                      <td colSpan={4} className="p-2 text-right">Total</td>
                      <td className="p-2 text-right text-furmily-primary">
                        Rp {selectedOrder.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-furmily-primary">
                {editingOrder ? 'Edit Pesanan' : 'Tambah Pesanan'}
              </h2>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-red-500">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleOrderFormSubmit} className="space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-sm font-semibold">Pelanggan *</label>
                <select
                  required
                  value={orderForm.customer_id}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  disabled={!!editingOrder}
                >
                  <option value="">Pilih pelanggan</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-semibold">Item Pesanan</label>
                {orderForm.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap gap-2 items-end mt-2 border p-3 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        placeholder="Nama produk"
                        value={item.product_name}
                        onChange={(e) => updateOrderItem(idx, 'product_name', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        required
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="text"
                        placeholder="Varian"
                        value={item.variant || ''}
                        onChange={(e) => updateOrderItem(idx, 'variant', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="w-16">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        required
                        min="1"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Harga"
                        value={item.price}
                        onChange={(e) => updateOrderItem(idx, 'price', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-2 py-1 text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div className="w-24 text-sm font-medium">Subtotal: Rp {item.subtotal.toLocaleString()}</div>
                    <button
                      type="button"
                      onClick={() => removeOrderItem(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FaPlus /> Tambah Item
                </button>
              </div>

              {/* Status & Delivery Estimate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold">Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold">Estimasi Pengiriman</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 hari kerja"
                    value={orderForm.delivery_estimate}
                    onChange={(e) => setOrderForm({ ...orderForm, delivery_estimate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold">Catatan</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border rounded-full hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={orderFormLoading}
                  className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark disabled:opacity-50"
                >
                  {orderFormLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-furmily-primary">📤 Import Pesanan</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Pilihan Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode Import</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="jetnote"
                    checked={importMode === 'jetnote'}
                    onChange={() => setImportMode('jetnote')}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium">Jetnote (CSV)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="ai"
                    checked={importMode === 'ai'}
                    onChange={() => setImportMode('ai')}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium">AI Universal (CSV, Gambar, PDF, DOCX)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {importMode === 'jetnote'
                  ? 'Gunakan format Jetnote dengan delimiter koma, tanpa AI.'
                  : 'Gunakan AI untuk semua format, termasuk gambar, PDF, dll.'}
              </p>
            </div>

            {/* File Input */}
            <input
              type="file"
              accept={importMode === 'jetnote' ? '.csv' : '.csv,.png,.jpg,.jpeg,.pdf,.docx,.txt'}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setShowImportModal(false);
                  await handleFileSelection(file, importMode);
                }
              }}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border rounded-full hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Order Modal */}
      {/* Bulk Order Modal */}
      {showBulkModal && (
        <BulkOrderModal
          unsavedOrders={unsavedOrders}
          activeOrderIndex={activeOrderIndex}
          setActiveOrderIndex={setActiveOrderIndex}
          setUnsavedOrders={setUnsavedOrders}
          setShowBulkModal={setShowBulkModal}
          handleBulkSave={handleBulkSave}
          savingBulk={savingBulk}
        />
      )}

    </div>
  );
}