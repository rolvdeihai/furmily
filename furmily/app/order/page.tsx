'use client';

import { Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaTrash, FaTimes, FaTruck } from 'react-icons/fa';
import { submitOrder } from '@/app/actions/submitOrder';
import { getPublicProducts } from '@/app/actions/frontend';
import { Product } from '@/app/actions/products';
import { createDokuPaymentOrder } from '@/app/actions/createDokuPayment';
import { getShippingData } from '@/app/actions/shipping';
import { useState, useEffect, useMemo } from 'react';
import { cities, City } from '@/data/cities';

// --- Helpers ---
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

const CATEGORIES = ['All', 'Freeze Dried', 'Food Topper', 'Supplements'];

function OrderForm() {
  const { state, clearCart } = useCart();
  const searchParams = useSearchParams();

  const initialItems = useMemo(() => {
    const itemsParam = searchParams.get('items');
    if (!itemsParam) return {};
    const pairs = itemsParam.split(',');
    const map: Record<string, number> = {};
    pairs.forEach((pair: string) => {
      const [id, qty] = pair.split(':');
      if (id && qty) map[id] = parseInt(qty, 10) || 1;
    });
    return map;
  }, [searchParams]);

  // --- State ---
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerCity: '',      // ✅ pilihan kota
    notes: '',
    items: {} as Record<string, number>,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  // Shipping states
  const [shippingServices, setShippingServices] = useState<any[]>([]);
  const [storeCoords, setStoreCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingEstimation, setShippingEstimation] = useState('');
  const [distance, setDistance] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Filter cities for autocomplete
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase().trim();
    return cities.filter((city: City) =>
      city.name.toLowerCase().includes(q) ||
      city.province.toLowerCase().includes(q)
    );
  }, [citySearch]);

  // Fetch products & shipping data
  useEffect(() => {
    const loadData = async () => {
      const [productsData, shippingData] = await Promise.all([
        getPublicProducts(),
        getShippingData(),
      ]);
      setProducts(productsData);
      setShippingServices(shippingData.services || []);
      if (shippingData.store?.latitude && shippingData.store?.longitude) {
        setStoreCoords({
          lat: shippingData.store.latitude,
          lon: shippingData.store.longitude,
        });
      }
    };
    loadData();
  }, []);

  // Pre-fill items from URL
  useEffect(() => {
    if (Object.keys(initialItems).length > 0) {
      setForm(prev => ({ ...prev, items: initialItems }));
    }
  }, [initialItems]);

  // Calculate total weight and shipping when items change
  useEffect(() => {
    let weight = 0;
    Object.entries(form.items).forEach(([id, qty]) => {
      const product = products.find((p: Product) => p.id === id);
      if (product && qty > 0) {
        weight += (product.weight || 0) * qty;
      }
    });
    setTotalWeight(weight);
    if (selectedService && distance > 0 && customerCoords) {
      calculateShipping(weight, distance, selectedService);
    }
  }, [form.items, products]);

  // --- Handle city selection ---
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setForm(prev => ({ ...prev, customerCity: city.name }));
    setCustomerCoords({ lat: city.lat, lon: city.lon });
    setCitySearch('');

    if (storeCoords) {
      const dist = haversine(storeCoords.lat, storeCoords.lon, city.lat, city.lon);
      setDistance(dist);
      if (shippingServices.length > 0) {
        setSelectedService(shippingServices[0].id);
        calculateShipping(totalWeight, dist, shippingServices[0].id);
      }
    }
  };

  // --- Geocode customer address (optional fallback) ---
  const handleAddressBlur = async () => {
    if (!form.customerAddress) return;
    // Jika sudah ada kota yang dipilih, jangan override
    if (selectedCity) return;
    setGeocoding(true);
    const coords = await geocodeAddress(form.customerAddress);
    setGeocoding(false);
    if (coords) {
      setCustomerCoords(coords);
      if (storeCoords) {
        const dist = haversine(storeCoords.lat, storeCoords.lon, coords.lat, coords.lon);
        setDistance(dist);
        if (!selectedService && shippingServices.length > 0) {
          setSelectedService(shippingServices[0].id);
          calculateShipping(totalWeight, dist, shippingServices[0].id);
        }
      }
    }
  };

  // --- Calculate shipping cost ---
  const calculateShipping = (weight: number, dist: number, serviceId: string) => {
    const service = shippingServices.find((s: any) => s.id === serviceId);
    if (!service) return;
    const volumeWeight = 0;
    let chargeableWeight = Math.max(weight, volumeWeight);
    if (chargeableWeight < service.minimum_weight) {
      chargeableWeight = service.minimum_weight;
    }
    const total = service.base_fare
      + (chargeableWeight * service.price_per_kg)
      + (dist * service.price_per_km);
    setShippingCost(Math.round(total));
    setShippingEstimation(`${service.courier_name} ${service.service_name} - estimasi 2-5 hari kerja`);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    calculateShipping(totalWeight, distance, serviceId);
  };

  // --- Filter products ---
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p: Product) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p: Product) => p.category === selectedCategory);
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
    setSelectedService('');
    setShippingCost(0);
    setCustomerCoords(null);
    setDistance(0);
    setSelectedCity(null);
    setCitySearch('');
  };

  const selectedItems = useMemo(() => {
    return Object.entries(form.items)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = products.find((p: Product) => p.id === productId);
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

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [selectedItems]);

  const totalPrice = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      setError('Silakan pilih kurir pengiriman terlebih dahulu.');
      return;
    }
    if (!form.customerCity) {
      setError('Silakan pilih kota Anda terlebih dahulu.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await submitOrder({
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          email: form.customerEmail,
          address: form.customerAddress || form.customerCity,
        },
        items: Object.entries(form.items)
          .filter(([_, qty]) => qty > 0)
          .map(([productId, qty]) => ({
            product_id: productId,
            quantity: qty,
          })),
        notes: form.notes,
        shipping_service_id: selectedService,
        shipping_cost: shippingCost,
        total_weight: totalWeight,
        distance_km: distance,
        shipping_estimation: shippingEstimation,
      });

      const { paymentUrl } = await createDokuPaymentOrder(result.orderId);
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">📦 Buat Pesanan</h1>
        <p className="opacity-90 mt-2">Isi detail pesanan dan pilih produk yang diinginkan.</p>
        {selectedItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm bg-white/10 rounded-xl p-3">
            <span className="font-semibold">🛒 {selectedItems.reduce((sum, i) => sum + i.quantity, 0)} produk</span>
            <span className="font-bold">Subtotal: Rp {subtotal.toLocaleString()}</span>
            {shippingCost > 0 && (
              <span className="font-bold">+ Ongkir: Rp {shippingCost.toLocaleString()}</span>
            )}
            <span className="font-bold text-furmily-cream">Total: Rp {totalPrice.toLocaleString()}</span>
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
              <label className="block font-semibold text-sm">Kota Anda *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onFocus={() => setCitySearch('')}
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                  placeholder="Cari kota Anda..."
                />
                {filteredCities.length > 0 && citySearch && !selectedCity && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredCities.map((city: City) => (
                      <div
                        key={`${city.name}-${city.province}`}
                        onClick={() => handleCitySelect(city)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {city.name}, {city.province}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCity && (
                <p className="text-xs text-green-600 mt-1">✅ {selectedCity.name}, {selectedCity.province}</p>
              )}
            </div>
            <div>
              <label className="block font-semibold text-sm">Alamat Lengkap (opsional)</label>
              <input
                type="text"
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                onBlur={handleAddressBlur}
                className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none transition"
                placeholder="Jalan, RT/RW, No. Rumah"
              />
              {geocoding && <p className="text-xs text-gray-500 mt-1">⏳ Mendeteksi lokasi...</p>}
            </div>
          </div>
          {customerCoords && distance > 0 && (
            <p className="text-xs text-green-600 mt-2">📏 Jarak dari toko: {distance.toFixed(1)} km</p>
          )}
        </div>

        {/* Shipping Selection */}
        {shippingServices.length > 0 && customerCoords ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-furmily-primary mb-4 flex items-center gap-2">
              <FaTruck /> Pilih Kurir
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shippingServices.map((svc: any) => {
                const volWeight = 0;
                let chargeable = Math.max(totalWeight, volWeight);
                if (chargeable < svc.minimum_weight) chargeable = svc.minimum_weight;
                const cost = svc.base_fare
                  + (chargeable * svc.price_per_kg)
                  + (distance * svc.price_per_km);
                const isSelected = selectedService === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-furmily-primary bg-furmily-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-furmily-primary">{svc.courier_name}</p>
                        <p className="text-sm text-gray-500">{svc.service_name}</p>
                        <p className="text-sm text-gray-500">Min: {svc.minimum_weight} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-furmily-primary">Rp {Math.round(cost).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">estimasi 2-5 hari</p>
                      </div>
                    </div>
                    {isSelected && (
                      <p className="text-xs text-green-600 mt-2">✅ Dipilih</p>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedService && shippingCost > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                Ongkos kirim: <span className="font-bold">Rp {shippingCost.toLocaleString()}</span>
                {shippingEstimation && ` — ${shippingEstimation}`}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-furmily-primary mb-4 flex items-center gap-2">
              <FaTruck /> Pilih Kurir
            </h2>
            {!selectedCity ? (
              <p className="text-gray-500">Silakan pilih kota Anda terlebih dahulu.</p>
            ) : shippingServices.length === 0 ? (
              <p className="text-gray-500">Belum ada layanan pengiriman yang tersedia.</p>
            ) : null}
          </div>
        )}

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
              {filteredProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className="border rounded-xl p-4 flex flex-col hover:shadow-md transition bg-gray-50/50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-furmily-primary">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                      <p className="text-sm font-bold text-furmily-primary mt-1">Rp {product.price.toLocaleString()}</p>
                      {product.weight && (
                        <p className="text-xs text-gray-400">{product.weight} kg</p>
                      )}
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
          disabled={loading || !selectedService}
          className="w-full bg-furmily-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-furmily-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Memproses...' : 'Kirim Pesanan'}
          {!loading && <FaShoppingCart />}
        </button>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-8 text-center">Loading...</div>}>
      <OrderForm />
    </Suspense>
  );
}