// data/cities.ts
export interface City {
  name: string;
  province: string;
  lat: number;
  lon: number;
}

export const cities: City[] = [
  // ===== BANTEN =====
  { name: 'Kota Tangerang', province: 'Banten', lat: -6.1783, lon: 106.6319 },
  { name: 'Kota Tangerang Selatan', province: 'Banten', lat: -6.2886, lon: 106.7175 },
  { name: 'Kota Serang', province: 'Banten', lat: -6.1200, lon: 106.1503 },
  { name: 'Kabupaten Tangerang', province: 'Banten', lat: -6.1764, lon: 106.4493 },
  { name: 'Kabupaten Lebak', province: 'Banten', lat: -6.5643, lon: 106.2524 },
  { name: 'Kabupaten Pandeglang', province: 'Banten', lat: -6.3136, lon: 106.1077 },
  { name: 'Kabupaten Serang', province: 'Banten', lat: -6.1137, lon: 106.1494 },

  // ===== DKI JAKARTA =====
  { name: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1868, lon: 106.8227 },
  { name: 'Jakarta Barat', province: 'DKI Jakarta', lat: -6.1588, lon: 106.7716 },
  { name: 'Jakarta Selatan', province: 'DKI Jakarta', lat: -6.2580, lon: 106.7917 },
  { name: 'Jakarta Timur', province: 'DKI Jakarta', lat: -6.2383, lon: 106.8636 },
  { name: 'Jakarta Utara', province: 'DKI Jakarta', lat: -6.1325, lon: 106.8687 },
  { name: 'Kepulauan Seribu', province: 'DKI Jakarta', lat: -5.8627, lon: 106.6234 },

  // ===== JAWA BARAT =====
  { name: 'Kota Bandung', province: 'Jawa Barat', lat: -6.9147, lon: 107.6098 },
  { name: 'Kota Bekasi', province: 'Jawa Barat', lat: -6.2383, lon: 106.9835 },
  { name: 'Kota Bogor', province: 'Jawa Barat', lat: -6.5892, lon: 106.7928 },
  { name: 'Kota Depok', province: 'Jawa Barat', lat: -6.3940, lon: 106.8226 },
  { name: 'Kota Cimahi', province: 'Jawa Barat', lat: -6.8808, lon: 107.5422 },
  { name: 'Kota Sukabumi', province: 'Jawa Barat', lat: -6.9223, lon: 106.9272 },
  { name: 'Kabupaten Bandung', province: 'Jawa Barat', lat: -7.1087, lon: 107.6410 },
  { name: 'Kabupaten Bogor', province: 'Jawa Barat', lat: -6.5765, lon: 106.7364 },
  { name: 'Kabupaten Bekasi', province: 'Jawa Barat', lat: -6.3627, lon: 107.2197 },
  { name: 'Kabupaten Cianjur', province: 'Jawa Barat', lat: -6.8204, lon: 107.1393 },
  { name: 'Kabupaten Sukabumi', province: 'Jawa Barat', lat: -6.8824, lon: 106.7994 },
  { name: 'Kabupaten Karawang', province: 'Jawa Barat', lat: -6.3030, lon: 107.2920 },
  { name: 'Kabupaten Subang', province: 'Jawa Barat', lat: -6.5743, lon: 107.7399 },
  { name: 'Kabupaten Purwakarta', province: 'Jawa Barat', lat: -6.5558, lon: 107.4469 },

  // ===== JAWA TENGAH =====
  { name: 'Kota Semarang', province: 'Jawa Tengah', lat: -6.9667, lon: 110.4167 },
  { name: 'Kota Surakarta', province: 'Jawa Tengah', lat: -7.5755, lon: 110.8258 },
  { name: 'Kota Yogyakarta', province: 'DI Yogyakarta', lat: -7.7971, lon: 110.3688 },
  { name: 'Kabupaten Bantul', province: 'DI Yogyakarta', lat: -7.8885, lon: 110.3280 },
  { name: 'Kabupaten Sleman', province: 'DI Yogyakarta', lat: -7.7158, lon: 110.3543 },

  // ===== JAWA TIMUR =====
  { name: 'Kota Surabaya', province: 'Jawa Timur', lat: -7.2504, lon: 112.7688 },
  { name: 'Kota Malang', province: 'Jawa Timur', lat: -7.9819, lon: 112.6211 },
  { name: 'Kota Kediri', province: 'Jawa Timur', lat: -7.8167, lon: 112.0167 },
  { name: 'Kota Madiun', province: 'Jawa Timur', lat: -7.6296, lon: 111.5239 },
  { name: 'Kota Blitar', province: 'Jawa Timur', lat: -8.0984, lon: 112.1611 },
  { name: 'Kota Probolinggo', province: 'Jawa Timur', lat: -7.7546, lon: 113.2160 },

  // ===== SUMATERA =====
  { name: 'Kota Medan', province: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
  { name: 'Kota Batam', province: 'Kepulauan Riau', lat: 1.0456, lon: 104.0305 },
  { name: 'Kota Pekanbaru', province: 'Riau', lat: 0.5333, lon: 101.4500 },
  { name: 'Kota Padang', province: 'Sumatera Barat', lat: -0.9492, lon: 100.3543 },
  { name: 'Kota Palembang', province: 'Sumatera Selatan', lat: -2.9761, lon: 104.7754 },
  { name: 'Kota Bandar Lampung', province: 'Lampung', lat: -5.3971, lon: 105.2668 },
  { name: 'Kota Jambi', province: 'Jambi', lat: -1.6101, lon: 103.6132 },
  { name: 'Kota Bengkulu', province: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
  { name: 'Kota Pangkal Pinang', province: 'Kepulauan Bangka Belitung', lat: -2.1299, lon: 106.1134 },

  // ===== KALIMANTAN =====
  { name: 'Kota Pontianak', province: 'Kalimantan Barat', lat: -0.0263, lon: 109.3425 },
  { name: 'Kota Balikpapan', province: 'Kalimantan Timur', lat: -1.2375, lon: 116.8515 },
  { name: 'Kota Samarinda', province: 'Kalimantan Timur', lat: -0.4972, lon: 117.1536 },
  { name: 'Kota Banjarmasin', province: 'Kalimantan Selatan', lat: -3.3186, lon: 114.5944 },
  { name: 'Kota Palangkaraya', province: 'Kalimantan Tengah', lat: -2.2083, lon: 113.9167 },

  // ===== SULAWESI =====
  { name: 'Kota Makassar', province: 'Sulawesi Selatan', lat: -5.1333, lon: 119.4167 },
  { name: 'Kota Manado', province: 'Sulawesi Utara', lat: 1.4931, lon: 124.8413 },
  { name: 'Kota Palu', province: 'Sulawesi Tengah', lat: -0.8917, lon: 119.8707 },
  { name: 'Kota Kendari', province: 'Sulawesi Tenggara', lat: -3.9985, lon: 122.5129 },

  // ===== NUSA TENGGARA =====
  { name: 'Kota Denpasar', province: 'Bali', lat: -8.6500, lon: 115.2167 },
  { name: 'Kota Mataram', province: 'Nusa Tenggara Barat', lat: -8.5833, lon: 116.1167 },
  { name: 'Kota Kupang', province: 'Nusa Tenggara Timur', lat: -10.1772, lon: 123.6070 },

  // ===== PAPUA =====
  { name: 'Kota Jayapura', province: 'Papua', lat: -2.5333, lon: 140.7000 },
  { name: 'Kota Sorong', province: 'Papua Barat', lat: -0.8622, lon: 131.2622 },
];