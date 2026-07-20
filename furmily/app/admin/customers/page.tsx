// app/admin/customers/page.tsx
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomersCSV,
  importCustomersCSV,
  Customer,
} from '@/app/actions/customers';
import { getCustomerOrders } from '@/app/actions/orders';
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaDownload,
  FaUpload,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaEye,
} from 'react-icons/fa';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orderDetailModal, setOrderDetailModal] = useState<{
    customer: Customer;
    orders: any[];
  } | null>(null);

  const fetchCustomers = async (filters?: { search?: string; startDate?: string; endDate?: string }) => {
    setLoading(true);
    try {
      const data = await getCustomers(filters);
      setCustomers(data);
    } catch (err) {
      alert('Gagal mengambil data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Client-side filtering for search & date (server-side also filters, but we apply again for immediate feedback)
  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      result = result.filter(c => new Date(c.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      result = result.filter(c => new Date(c.created_at) <= end);
    }
    return result;
  }, [customers, searchQuery, startDate, endDate]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Nama dan telepon wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      fetchCustomers({ search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pelanggan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return;
    try {
      await deleteCustomer(id);
      fetchCustomers({ search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pelanggan');
    }
  };

  const handleViewOrders = async (customer: Customer) => {
    try {
      const orders = await getCustomerOrders(customer.id);
      setOrderDetailModal({ customer, orders });
    } catch (err) {
      alert('Gagal mengambil pesanan');
    }
  };

  const handleExport = async () => {
    if (filteredCustomers.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const csv = await exportCustomersCSV(filteredCustomers);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_${new Date().toISOString().slice(0,10)}.csv`;
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
      const result = await importCustomersCSV(formData);
      alert(`Berhasil mengimpor ${result.count} pelanggan.`);
      setShowImportModal(false);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchCustomers({ search: searchQuery || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
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
        <h1 className="text-3xl md:text-4xl font-bold">👥 Daftar Pelanggan</h1>
        <p className="opacity-90 mt-2">Kelola semua data pelanggan dan riwayat pesanan mereka.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
          <span className="font-semibold">Total: {customers.length} pelanggan</span>
          <span className="text-white/70">|</span>
          <span className="font-semibold">Tampil: {filteredCustomers.length} pelanggan</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, telepon, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Date Range */}
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="bg-furmily-primary hover:bg-furmily-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <FaPlus /> Tambah
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || filteredCustomers.length === 0}
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

      {/* Customers Table */}
      {loading ? (
        <p className="text-center py-12">Loading...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Tidak ada pelanggan sesuai filter.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-sm font-semibold">Nama</th>
                <th className="p-3 text-left text-sm font-semibold">Telepon</th>
                <th className="p-3 text-left text-sm font-semibold">Email</th>
                <th className="p-3 text-left text-sm font-semibold">Alamat</th>
                <th className="p-3 text-left text-sm font-semibold">Pesanan</th>
                <th className="p-3 text-left text-sm font-semibold">Terdaftar</th>
                <th className="p-3 text-left text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{c.email || '-'}</td>
                  <td className="p-3">{c.address || '-'}</td>
                  <td className="p-3 text-center">
                    <span className="bg-furmily-cream text-furmily-primary px-2 py-0.5 rounded-full text-xs font-bold">
                      {c.order_count || 0}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(c.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewOrders(c)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Lihat Pesanan"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-furmily-primary">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Nama *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Telepon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-full hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-furmily-primary">
                Pesanan {orderDetailModal.customer.name}
              </h2>
              <button onClick={() => setOrderDetailModal(null)} className="text-gray-500 hover:text-red-500">
                Tutup
              </button>
            </div>
            {orderDetailModal.orders.length === 0 ? (
              <p>Tidak ada pesanan.</p>
            ) : (
              <ul className="space-y-3">
                {orderDetailModal.orders.map((order: any) => (
                  <li key={order.id} className="border p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-semibold">{order.order_number}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === 'pending' ? 'bg-yellow-200' :
                        order.status === 'confirmed' ? 'bg-blue-200' :
                        order.status === 'shipped' ? 'bg-purple-200' :
                        order.status === 'delivered' ? 'bg-green-200' : 'bg-red-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm">Total: Rp {order.total_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-furmily-primary">📤 Import Pelanggan</h2>
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
                name,phone,email,address
              </code>
              <br />
              <span className="text-xs">(pelanggan dengan telepon yang sama akan dilewati)</span>
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