import WhatsAppButton from '@/components/WhatsAppButton';

export default function WholesalePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-furmily-primary">Pemesanan Grosir</h1>
      <p className="mt-4 text-gray-700 text-lg">
        Tertarik menjadi mitra resmi Furmily? Kami menyediakan produk premium 
        untuk toko hewan peliharaan, klinik hewan, dan reseller.
      </p>

      <div className="mt-8 bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-6">
        <h2 className="text-2xl font-semibold text-furmily-primary">Keuntungan Menjadi Mitra</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="text-furmily-primary text-xl">✓</span>
            <span><strong>Harga Khusus Grosir</strong> — Diskon menarik untuk pembelian dalam jumlah besar.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-furmily-primary text-xl">✓</span>
            <span><strong>Produk Premium</strong> — Kualitas terbaik untuk pelanggan Anda.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-furmily-primary text-xl">✓</span>
            <span><strong>Dukungan Penuh</strong> — Kami siap membantu pemasaran dan edukasi produk.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-furmily-primary text-xl">✓</span>
            <span><strong>Pengiriman Terjamin</strong> — Logistik yang handal ke seluruh Indonesia & Malaysia.</span>
          </li>
        </ul>

        <div className="bg-furmily-cream p-6 rounded-xl">
          <h3 className="font-bold text-furmily-primary">Tertarik? Hubungi Kami Sekarang!</h3>
          <p className="text-sm text-gray-700 mt-1">
            Untuk informasi lebih lanjut tentang harga grosir dan kemitraan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <WhatsAppButton 
              productName="kerjasama grosir Furmily" 
              className="bg-green-600 hover:bg-green-700 px-6 py-3"
            >
              Hubungi via WhatsApp
            </WhatsAppButton>
          </div>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p><strong>📍 Kantor Indonesia:</strong> Crest Drive 1/7, Park Serpong, Cendana Crest, Kec. Legok, Kabupaten Tangerang, Banten 15820</p>
          <p className="mt-1"><strong>📍 Kantor Malaysia:</strong> 24B, Jalan Anggerik Vanilla 31/93, Kota Kemuning, 40460 Shah Alam, Selangor</p>
        </div>
      </div>
    </div>
  );
}