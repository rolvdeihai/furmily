'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShopeeButton from '@/components/ShopeeButton';
import TokopediaButton from '@/components/TokopediaButton';
import { getPublicProducts } from '@/app/actions/frontend';
import ProductCard from '@/components/ProductCard';
import AnimatedSection from '@/components/AnimatedSection';
import { 
  FaCheckCircle, FaStar, FaShieldAlt, FaTruck, FaHeart, 
  FaLeaf, FaBolt, FaAward, FaUsers, FaComments 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const featuredProducts = products.slice(0, 4);

  const stats = {
    customers: '2,500+',
    reviews: '4.9/5',
    products: products.length,
    happyPets: '5,000+',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">🐾</div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden relative">
      {/* Floating Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-furmily-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-furmily-cream/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-furmily-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 animate-pulse delay-700"></div>
        </div>

        {/* Decorative Dog with Parallax */}
        <motion.div 
          className="absolute right-0 top-0 h-full w-1/2 opacity-10 flex items-center justify-end pointer-events-none"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <span className="text-[300px] md:text-[400px] lg:text-[500px] select-none">🐕</span>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="flex items-center gap-1 bg-white/20 px-4 py-1.5 rounded-full text-sm">
                  <FaStar className="text-yellow-300" /> <span>4.9/5 dari 500+ ulasan</span>
                </span>
                <span className="text-sm bg-white/20 px-4 py-1.5 rounded-full">
                  🐾 Premium Pet Nutrition
                </span>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <span className="text-furmily-cream">Rawat Si Kesayangan</span>
                <br />
                dengan Nutrisi <span className="text-furmily-cream">100% Alami</span>
              </motion.h1>

              <motion.p 
                className="mt-6 text-lg md:text-xl opacity-90 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <strong>Freeze‑dried treats, food toppers, dan omega‑3</strong> murni 
                untuk kulit sehat, bulu berkilau, dan pencernaan optimal. 
                <span className="block mt-2 text-furmily-cream font-semibold">
                  Karena mereka bukan sekadar hewan peliharaan — mereka keluarga.
                </span>
              </motion.p>

              <motion.div 
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Link
                  href="/products"
                  className="bg-white text-furmily-primary font-bold py-3.5 px-8 rounded-full hover:bg-furmily-cream transition text-base md:text-lg shadow-lg hover:shadow-xl"
                >
                  🛒 Beli Sekarang
                </Link>
                <WhatsAppButton
                  productName="produk Furmily"
                  className="bg-green-600 hover:bg-green-700 py-3.5 px-8 text-base md:text-lg shadow-lg hover:shadow-xl"
                >
                  💬 Konsultasi Gratis
                </WhatsAppButton>
              </motion.div>

              <motion.div 
                className="mt-8 flex items-center gap-6 text-sm opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <span className="flex items-center gap-1">✅ <strong>{stats.customers}</strong> pelanggan puas</span>
                <span className="flex items-center gap-1">⭐ <strong>{stats.reviews}</strong> rating</span>
                <span className="flex items-center gap-1">🐾 <strong>{stats.happyPets}</strong> hewan bahagia</span>
              </motion.div>
            </motion.div>

            {/* Right – Glassmorphism Card */}
            <motion.div 
              className="hidden md:flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="relative w-full max-w-md">
                <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur-sm p-8 flex items-center justify-center border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                  <div className="text-center">
                    <span className="text-8xl block mb-4 animate-bounce">🐶</span>
                    <p className="text-sm opacity-70">Bergabung dengan <strong>ribuan</strong> pemilik hewan<br />yang sudah merasakan manfaat Furmily</p>
                  </div>
                </div>
                <motion.div 
                  className="absolute -bottom-4 -right-4 bg-furmily-cream text-furmily-primary px-4 py-2 rounded-full shadow-lg text-sm font-bold"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  ⭐ Best Seller!
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center text-white/70 text-sm">
            <span>Scroll untuk cerita lengkap</span>
            <div className="mt-2 w-6 h-10 border-2 border-white/50 rounded-full flex items-center justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full animate-bounce"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          BRAND STORY
          ============================================================ */}
      <AnimatedSection direction="up" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-furmily-primary font-semibold text-sm tracking-wider uppercase">Tentang Furmily</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-furmily-primary">
            Setiap Tetes <span className="text-furmily-cream">Cinta</span> untuk Mereka
          </h2>
          <div className="w-20 h-1 bg-furmily-primary mx-auto mt-4 rounded-full"></div>
          <p className="mt-6 text-gray-600 leading-relaxed text-lg">
            Furmily lahir dari satu keyakinan sederhana: <strong>hewan peliharaan layak mendapatkan yang terbaik</strong>.
            Kami memilih bahan-bahan alami premium, memprosesnya dengan <strong>freeze‑drying</strong> untuk menjaga 
            nutrisi, dan meracik setiap produk dengan <strong>penuh perhatian</strong>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Bukan sekadar camilan — ini adalah <strong>wujud kasih sayang</strong> untuk si berbulu kesayangan.
          </p>
        </div>

        <motion.div 
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {[
            { icon: <FaLeaf className="text-3xl" />, label: '100% Alami', desc: 'Tanpa pengawet & pemanis buatan' },
            { icon: <FaBolt className="text-3xl" />, label: 'Nutrisi Terjaga', desc: 'Proses freeze‑drying terbaik' },
            { icon: <FaHeart className="text-3xl" />, label: 'Dibuat dengan Cinta', desc: 'Dari hati untuk mereka' },
            { icon: <FaAward className="text-3xl" />, label: 'Kualitas Premium', desc: 'Bahan pilihan terbaik' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition group hover:-translate-y-2 duration-300"
            >
              <div className="text-furmily-primary group-hover:scale-110 transition">{item.icon}</div>
              <p className="font-bold mt-2 text-furmily-primary">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ============================================================
          PROBLEM → SOLUTION
          ============================================================ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <AnimatedSection direction="up" className="text-center max-w-3xl mx-auto">
            <span className="text-furmily-primary font-semibold text-sm tracking-wider uppercase">Masalah & Solusi</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-furmily-primary">
              Kenapa <span className="text-furmily-cream">Ribuan</span> Pemilik Hewan Beralih ke Furmily?
            </h2>
          </AnimatedSection>

          <motion.div 
            className="mt-12 grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {/* Problem */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition">
              <div className="text-red-500 text-4xl mb-4">😔</div>
              <h3 className="text-xl font-bold text-gray-800">Masalah yang Sering Terjadi</h3>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start gap-3">❌ <span>Bulu kusam, rontok, dan tidak berkilau</span></li>
                <li className="flex items-start gap-3">❌ <span>Kulit kering, gatal, dan iritasi</span></li>
                <li className="flex items-start gap-3">❌ <span>Pencernaan sensitif & nafsu makan menurun</span></li>
                <li className="flex items-start gap-3">❌ <span>Camilan kemasan penuh bahan pengawet</span></li>
              </ul>
            </div>

            {/* Solution */}
            <motion.div 
              className="bg-furmily-primary p-8 rounded-2xl shadow-lg text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold">Solusi Furmily</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">✅ <span><strong>Omega‑3 murni</strong> untuk kulit & bulu sehat</span></li>
                <li className="flex items-start gap-3">✅ <span><strong>Freeze‑dried treats</strong> dengan nutrisi utuh</span></li>
                <li className="flex items-start gap-3">✅ <span><strong>Food toppers</strong> untuk pencernaan & imunitas</span></li>
                <li className="flex items-start gap-3">✅ <span><strong>100% alami</strong> tanpa bahan tambahan</span></li>
              </ul>
              <div className="mt-6 p-4 bg-white/10 rounded-xl">
                <p className="text-sm italic">"Sejak pakai Furmily, bulu kucing saya jadi lebih lebat dan berkilau!"</p>
                <p className="text-xs mt-1 opacity-70">— Sarah, pemilik 3 kucing</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PRODUCTS
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <AnimatedSection direction="up" className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-furmily-primary font-semibold text-sm tracking-wider uppercase">Koleksi Terbaik</span>
            <h2 className="text-3xl md:text-4xl font-bold text-furmily-primary mt-1">
              Produk <span className="text-furmily-cream">Paling Dicari</span>
            </h2>
          </div>
          <Link href="/products" className="text-furmily-primary hover:underline font-semibold flex items-center gap-1">
            Lihat Semua → 
          </Link>
        </AnimatedSection>

        <motion.div 
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <AnimatedSection direction="up" className="mt-12 bg-gray-50 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
          <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> 100% Alami</span>
          <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Tanpa Pengawet</span>
          <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Halal & Aman</span>
          <span className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Garansi Kepuasan</span>
        </AnimatedSection>
      </section>

      {/* ============================================================
          BENEFITS
          ============================================================ */}
      <section className="bg-furmily-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <AnimatedSection direction="up" className="text-center max-w-3xl mx-auto">
            <span className="text-furmily-primary font-semibold text-sm tracking-wider uppercase">Manfaat</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-furmily-primary">
              Apa yang <span className="text-furmily-cream">Berubah</span> Setelah Pakai Furmily?
            </h2>
          </AnimatedSection>

          <motion.div 
            className="mt-12 grid md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { emoji: '🦴', title: 'Bulu Lebih Sehat', desc: 'Kaya Omega‑3 untuk kulit dan bulu berkilau' },
              { emoji: '💪', title: 'Imunitas Meningkat', desc: 'Nutrisi lengkap untuk daya tahan tubuh optimal' },
              { emoji: '😊', title: 'Pencernaan Lancar', desc: 'Probiotik alami untuk sistem pencernaan sehat' },
              { emoji: '❤️', title: 'Lebih Aktif & Ceria', desc: 'Energi meningkat, hewan peliharaan lebih bahagia' },
              { emoji: '🛡️', title: 'Terhindar dari Alergi', desc: 'Bahan alami, aman untuk kulit sensitif' },
              { emoji: '⭐', title: 'Kualitas Hidup Lebih Baik', desc: 'Nutrisi premium untuk umur panjang & sehat' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition hover:-translate-y-2 duration-300"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-furmily-primary">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <AnimatedSection direction="up" className="text-center max-w-3xl mx-auto">
          <span className="text-furmily-primary font-semibold text-sm tracking-wider uppercase">Testimonial</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-furmily-primary">
            Apa Kata <span className="text-furmily-cream">Pelanggan</span> Kami?
          </h2>
        </AnimatedSection>

        <motion.div 
          className="mt-12 grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { name: 'Sarah, Jakarta', text: 'Kucing saya sangat suka Salmon Freeze Dried! Bulunya jadi lebih berkilau dan tidak rontok lagi.', rating: 5 },
            { name: 'Budi, Bandung', text: 'Produk Furmily berkualitas tinggi. Anjing saya lebih bersemangat makan dan bulunya lembut!', rating: 5 },
            { name: 'Maya, Surabaya', text: 'Food Topper Skin & Coat benar-benar ampuh! Bulu kucing saya lebat dan sehat.', rating: 5 },
            { name: 'Andi, Tangerang', text: 'Omega-3 Fish Oil bikin anjing saya aktif lagi. Sendi lebih kuat dan bulu berkilau!', rating: 5 },
            { name: 'Rina, Medan', text: 'Freeze Dried Treats jadi camilan favorit kucing saya. 100% alami, saya percaya!', rating: 5 },
            { name: 'Dewi, Yogyakarta', text: 'Sejak pakai Furmily, kucing saya tidak pernah sakit. Nutrisi lengkap!', rating: 5 },
          ].map((t, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition hover:-translate-y-2 duration-300"
            >
              <div className="flex items-center gap-1 text-yellow-400 text-sm mb-2">
                {'⭐'.repeat(t.rating)}
              </div>
              <p className="text-gray-600 italic text-sm">"{t.text}"</p>
              <p className="mt-3 font-semibold text-furmily-primary text-sm">— {t.name}</p>
            </motion.div>
          ))}
        </motion.div>

        <AnimatedSection direction="up" className="mt-8 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <FaUsers className="text-furmily-primary" /> Bergabung dengan <strong>{stats.customers}</strong> pemilik hewan peliharaan yang sudah merasakan manfaat Furmily
          </p>
        </AnimatedSection>
      </section>

      {/* ============================================================
          GUARANTEE + URGENCY
          ============================================================ */}
      <section className="bg-furmily-primary text-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div>
              <motion.div 
                className="text-5xl mb-4"
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🛡️
              </motion.div>
              <h2 className="text-3xl font-bold">Garansi 100% Kepuasan</h2>
              <p className="mt-4 opacity-90 leading-relaxed">
                Kami yakin produk Furmily akan membuat hewan peliharaan Anda lebih sehat dan bahagia.
                Jika tidak puas, <strong>kembalikan dalam 30 hari</strong> dan kami akan mengembalikan uang Anda
                — tanpa pertanyaan.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-white text-furmily-primary font-bold px-8 py-3 rounded-full hover:bg-furmily-cream transition shadow-lg"
                >
                  🛒 Beli dengan Tenang
                </Link>
                <WhatsAppButton
                  productName="produk Furmily"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 shadow-lg"
                >
                  💬 Tanya Kami
                </WhatsAppButton>
              </div>
            </div>
            <motion.div 
              className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 text-2xl font-bold">
                <motion.span
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🔥
                </motion.span>
                <span>Promo Terbatas!</span>
              </div>
              <p className="mt-2 opacity-90">
                Dapatkan <strong>diskon hingga 20%</strong> untuk pembelian pertama Anda.
                Penawaran berakhir dalam <span className="text-furmily-cream font-bold">3 hari</span>!
              </p>
              <motion.div 
                className="mt-4 grid grid-cols-4 gap-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {['12', '08', '45', '30'].map((num, i) => (
                  <div key={i} className="bg-white/20 rounded-lg p-3">
                    <motion.span 
                      className="text-2xl font-bold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {num}
                    </motion.span>
                    <span className="block text-xs opacity-70">{['Jam', 'Menit', 'Detik', ''][i]}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          CTA FINAL
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <motion.div 
          className="bg-gradient-to-r from-furmily-primary to-[#0A6B5C] rounded-3xl p-8 md:p-16 text-center text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Siap Memberikan yang <span className="text-furmily-cream">Terbaik</span> untuk Si Kesayangan?
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg md:text-xl opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Ribuan pemilik hewan telah beralih ke Furmily. Kini giliran Anda.
            <br />
            <strong>Nutrisi alami, cinta sejati.</strong>
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/products"
              className="bg-white text-furmily-primary font-bold px-8 py-4 rounded-full hover:bg-furmily-cream transition text-lg shadow-xl hover:shadow-2xl"
            >
              🛒 Beli Sekarang — Mulai dari Rp 99.000
            </Link>
            <WhatsAppButton
              productName="produk Furmily"
              className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg shadow-xl hover:shadow-2xl"
            >
              💬 Konsultasi Gratis
            </WhatsAppButton>
          </motion.div>
          <motion.p 
            className="mt-6 text-sm opacity-70 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <FaShieldAlt /> Pembayaran aman · Garansi 100% · Free shipping di atas Rp 500.000
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}