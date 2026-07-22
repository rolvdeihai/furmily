// app/admin/shipping/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  getShippingServices,
  createShippingService,
  updateShippingService,
  deleteShippingService,
  toggleShippingService,
  getStoreSettings,
  updateStoreSettings,
} from '@/app/actions/shipping';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaStore } from 'react-icons/fa';

type ShippingService = {
  id: string;
  courier_name: string;
  service_name: string;
  base_fare: number;
  price_per_kg: number;
  price_per_km: number;
  minimum_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ✅ Extended StoreSettings with latitude & longitude
type StoreSettings = {
  id: string;
  store_name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
};

export default function ShippingPage() {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ShippingService | null>(null);
  const [formData, setFormData] = useState({
    courier_name: '',
    service_name: '',
    base_fare: 0,
    price_per_kg: 0,
    price_per_km: 0,
    minimum_weight: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Store form with latitude/longitude as strings (for input)
  const [storeForm, setStoreForm] = useState({
    store_name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Indonesia',
    phone: '',
    latitude: '',
    longitude: '',
  });
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, settingsData] = await Promise.all([
        getShippingServices(),
        getStoreSettings(),
      ]);
      setServices(servicesData || []);
      if (settingsData) {
        setStoreSettings(settingsData as StoreSettings);
        setStoreForm({
          store_name: settingsData.store_name || '',
          address: settingsData.address || '',
          city: settingsData.city || '',
          province: settingsData.province || '',
          postal_code: settingsData.postal_code || '',
          country: settingsData.country || 'Indonesia',
          phone: settingsData.phone || '',
          latitude: settingsData.latitude?.toString() ?? '',
          longitude: settingsData.longitude?.toString() ?? '',
        });
      }
    } catch (err) {
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (service?: ShippingService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        courier_name: service.courier_name,
        service_name: service.service_name,
        base_fare: service.base_fare,
        price_per_kg: service.price_per_kg,
        price_per_km: service.price_per_km,
        minimum_weight: service.minimum_weight,
      });
    } else {
      setEditingService(null);
      setFormData({
        courier_name: '',
        service_name: '',
        base_fare: 0,
        price_per_kg: 0,
        price_per_km: 0,
        minimum_weight: 1,
      });
    }
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingService) {
        await updateShippingService(editingService.id, formData);
        alert('Layanan berhasil diperbarui');
      } else {
        await createShippingService(formData);
        alert('Layanan berhasil ditambahkan');
      }
      setShowServiceModal(false);
      fetchData();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    try {
      await deleteShippingService(id);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleShippingService(id, !current);
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status');
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSubmitting(true);
    try {
      // ✅ Convert latitude & longitude to numbers (or undefined if empty)
      const payload = {
        store_name: storeForm.store_name,
        address: storeForm.address,
        city: storeForm.city,
        province: storeForm.province,
        postal_code: storeForm.postal_code,
        country: storeForm.country,
        phone: storeForm.phone,
        latitude: storeForm.latitude ? parseFloat(storeForm.latitude) : undefined,
        longitude: storeForm.longitude ? parseFloat(storeForm.longitude) : undefined,
      };
      await updateStoreSettings(payload);
      alert('Alamat toko berhasil diperbarui');
      fetchData();
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setStoreSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">🚚 Pengaturan Pengiriman</h1>
        <p className="opacity-90 mt-2">Kelola layanan kurir, tarif, dan alamat toko.</p>
      </div>

      {/* ============================================================
          STORE ADDRESS SECTION
          ============================================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-furmily-primary flex items-center gap-2">
          <FaStore /> Alamat Toko
        </h2>
        <p className="text-sm text-gray-500 mb-4">Alamat ini akan digunakan sebagai titik asal pengiriman.</p>
        <form onSubmit={handleStoreSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Nama Toko</label>
            <input
              type="text"
              value={storeForm.store_name}
              onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Telepon Toko</label>
            <input
              type="text"
              value={storeForm.phone}
              onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold">Alamat Lengkap</label>
            <input
              type="text"
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Kota</label>
            <input
              type="text"
              value={storeForm.city}
              onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Provinsi</label>
            <input
              type="text"
              value={storeForm.province}
              onChange={(e) => setStoreForm({ ...storeForm, province: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Kode Pos</label>
            <input
              type="text"
              value={storeForm.postal_code}
              onChange={(e) => setStoreForm({ ...storeForm, postal_code: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Negara</label>
            <input
              type="text"
              value={storeForm.country}
              onChange={(e) => setStoreForm({ ...storeForm, country: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Latitude</label>
            <input
              type="number"
              step="any"
              value={storeForm.latitude}
              onChange={(e) => setStoreForm({ ...storeForm, latitude: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
              placeholder="-6.2088"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Longitude</label>
            <input
              type="number"
              step="any"
              value={storeForm.longitude}
              onChange={(e) => setStoreForm({ ...storeForm, longitude: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
              placeholder="106.8456"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={storeSubmitting}
              className="bg-furmily-primary text-white px-6 py-2 rounded-full hover:bg-furmily-dark transition disabled:opacity-50"
            >
              {storeSubmitting ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
          </div>
        </form>
      </div>

      {/* ============================================================
          SHIPPING SERVICES SECTION
          ============================================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-furmily-primary">Layanan Pengiriman</h2>
          <button
            onClick={() => openModal()}
            className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark transition flex items-center gap-2"
          >
            <FaPlus /> Tambah Layanan
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada layanan pengiriman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Kurir</th>
                  <th className="p-3 text-left">Layanan</th>
                  <th className="p-3 text-right">Biaya Tetap</th>
                  <th className="p-3 text-right">Per Kg</th>
                  <th className="p-3 text-right">Per Km</th>
                  <th className="p-3 text-right">Min. Berat</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{svc.courier_name}</td>
                    <td className="p-3">{svc.service_name}</td>
                    <td className="p-3 text-right">Rp {svc.base_fare.toLocaleString()}</td>
                    <td className="p-3 text-right">Rp {svc.price_per_kg.toLocaleString()}</td>
                    <td className="p-3 text-right">Rp {svc.price_per_km.toLocaleString()}</td>
                    <td className="p-3 text-right">{svc.minimum_weight} kg</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggle(svc.id, svc.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          svc.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {svc.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(svc)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(svc.id)}
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
      </div>

      {/* ============================================================
          MODAL TAMBAH / EDIT LAYANAN
          ============================================================ */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-furmily-primary">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Kurir *</label>
                <input
                  type="text"
                  required
                  value={formData.courier_name}
                  onChange={(e) => setFormData({ ...formData, courier_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  placeholder="Contoh: JNE, J&T, SiCepat"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Nama Layanan *</label>
                <input
                  type="text"
                  required
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                  placeholder="Contoh: Reguler, Ekonomis, Cargo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Biaya Tetap (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.base_fare}
                  onChange={(e) => setFormData({ ...formData, base_fare: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Tarif per Kg (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price_per_kg}
                  onChange={(e) => setFormData({ ...formData, price_per_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Tarif per Km (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price_per_km}
                  onChange={(e) => setFormData({ ...formData, price_per_km: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Berat Minimum (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.minimum_weight}
                  onChange={(e) => setFormData({ ...formData, minimum_weight: parseFloat(e.target.value) || 1 })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-furmily-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 border rounded-full hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-furmily-primary text-white px-4 py-2 rounded-full hover:bg-furmily-dark disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}