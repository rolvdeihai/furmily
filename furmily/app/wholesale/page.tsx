import WhatsAppButton from '@/components/WhatsAppButton';
import { FaHandshake, FaBox, FaTruck, FaUsers, FaStar, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function WholesalePage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-8 md:p-12 mb-10 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-furmily-cream text-sm font-semibold uppercase tracking-wider mb-2">
              <FaHandshake /> Mitra Resmi
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Pemesanan Grosir<br />
              <span className="text-furmily-cream">Furmily</span>
            </h1>
            <p className="text-white/90 text-lg mb-6 max-w-lg">
              Bergabunglah sebagai mitra resmi dan dapatkan harga khusus untuk toko hewan peliharaan, klinik hewan, dan reseller.
            </p>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton 
                productName="kerjasama grosir Furmily" 
                className="bg-white text-furmily-primary hover:bg-furmily-cream px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Hubungi Sekarang <FaArrowRight />
              </WhatsAppButton>
            </div>
          </div>
          <div className="flex-shrink-0 text-8xl md:text-9xl opacity-80 select-none">
            🏪
          </div>
        </div>
      </div>

      {/* STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: '🏢', label: 'Mitra Aktif', value: '100+' },
          { icon: '🐾', label: 'Produk Premium', value: '25+' },
          { icon: '🌏', label: 'Kota Terjangkau', value: '50+' },
          { icon: '⭐', label: 'Kepuasan Mitra', value: '98%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="text-4xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-furmily-primary">{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* KEUNTUNGAN – Card Grid */}
      <h2 className="text-2xl md:text-3xl font-bold text-furmily-primary mb-6 flex items-center gap-3">
        <FaStar className="text-furmily-cream" /> Keuntungan Menjadi Mitra
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {[
          { icon: '💰', title: 'Harga Khusus Grosir', desc: 'Diskon menarik untuk pembelian dalam jumlah besar, semakin banyak semakin hemat.' },
          { icon: '🌟', title: 'Produk Premium', desc: 'Produk freeze-dried berkualitas tinggi yang akan meningkatkan kepercayaan pelanggan Anda.' },
          { icon: '📦', title: 'Dukungan Penuh', desc: 'Kami siap membantu dengan materi pemasaran, edukasi produk, dan konsultasi.' },
          { icon: '🚚', title: 'Pengiriman Terjamin', desc: 'Logistik handal ke seluruh Indonesia & Malaysia, tepat waktu dan aman.' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition flex items-start gap-4">
            <div className="text-5xl flex-shrink-0">{item.icon}</div>
            <div>
              <h3 className="font-bold text-furmily-primary text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PROSES KEMITRAAN */}
      <h2 className="text-2xl md:text-3xl font-bold text-furmily-primary mb-6 flex items-center gap-3">
        <FaCheckCircle className="text-furmily-cream" /> Proses Bergabung
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { step: '1', icon: '💬', title: 'Hubungi Kami', desc: 'Klik tombol WhatsApp di atas atau di bawah untuk memulai.' },
          { step: '2', icon: '📋', title: 'Diskusi Kebutuhan', desc: 'Kami akan mendiskusikan produk, harga, dan volume pesanan Anda.' },
          { step: '3', icon: '🤝', title: 'Jadi Mitra', desc: 'Setelah kesepakatan, Anda resmi menjadi mitra Furmily dan siap memesan.' },
        ].map((item, idx) => (
          <div key={idx} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition">
            <div className="absolute -top-3 -left-3 bg-furmily-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              {item.step}
            </div>
            <div className="text-5xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-furmily-primary text-lg">{item.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* TESTIMONI (fiktif) */}
      <div className="bg-furmily-cream/30 p-6 rounded-2xl mb-10 border border-furmily-cream">
        <h3 className="font-bold text-furmily-primary flex items-center gap-2 text-lg mb-4">
          <FaUsers /> Kata Mitra Kami
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🐕</span>
              <div>
                <p className="font-semibold text-sm">Pet Shop Jaya</p>
                <div className="text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">"Produk Furmily selalu laris manis di toko kami. Pelanggan sangat menyukai kualitasnya, dan proses grosirnya sangat mudah."</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🐈</span>
              <div>
                <p className="font-semibold text-sm">Klinik Sehat Hewan</p>
                <div className="text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">"Kami merekomendasikan Furmily untuk pasien kami. Kandungan nutrisinya sangat baik, dan mitra grosirnya sangat responsif."</p>
          </div>
        </div>
      </div>

      {/* CTA BOTTOM */}
      <div className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white rounded-2xl p-8 text-center shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap Menjadi Mitra?</h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Hubungi tim kami sekarang dan dapatkan penawaran grosir terbaik untuk bisnis Anda.
        </p>
        <WhatsAppButton 
          productName="kerjasama grosir Furmily" 
          className="bg-white text-furmily-primary hover:bg-furmily-cream px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          Hubungi via WhatsApp <FaArrowRight />
        </WhatsAppButton>
      </div>

      {/* ALAMAT KANTOR */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-furmily-primary flex items-center gap-2">
              <span>🇮🇩</span> Kantor Indonesia
            </p>
            <p>Crest Drive 1/7, Park Serpong, Cendana Crest, Kec. Legok, Kabupaten Tangerang, Banten 15820</p>
          </div>
          <div>
            <p className="font-semibold text-furmily-primary flex items-center gap-2">
              <span>🇲🇾</span> Kantor Malaysia
            </p>
            <p>24B, Jalan Anggerik Vanilla 31/93, Kota Kemuning, 40460 Shah Alam, Selangor</p>
          </div>
        </div>
      </div>
    </div>
  );
}