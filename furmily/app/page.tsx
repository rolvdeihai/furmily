'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getPublicProducts } from '@/app/actions/frontend';
import { getWhyUsContent } from '@/app/actions/landing';
import ProductCard from '@/components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== MARQUEE ====================
const Marquee = ({ messages }: { messages: string[] }) => {
  const [isPaused, setIsPaused] = useState(false);
  const allMessages = [...messages, ...messages, ...messages];

  return (
    <div
      className="relative overflow-hidden bg-red-600 text-white py-2.5 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${messages.length * 8}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {allMessages.map((msg, idx) => (
          <span key={idx} className="mx-6 sm:mx-12 text-xs sm:text-sm font-medium tracking-wide">
            {msg}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// ==================== BANNER SLIDER (Full Width) ====================
const BannerSlider = () => {
  const banners = [
    { src: '/banner/banner-furmily-1.png', alt: 'Banner 1' },
    { src: '/banner/banner-furmily-2.png', alt: 'Banner 2' },
    { src: '/banner/banner-furmily-3.png', alt: 'Banner 3' },
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goTo = (index: number) => setCurrent(index);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  const next = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={banners[current].src}
            alt={banners[current].alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/fallback-banner.jpg';
            }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition"
      >
        <FaChevronLeft size={16} className="sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition"
      >
        <FaChevronRight size={16} className="sm:w-5 sm:h-5" />
      </button>
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
              idx === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN ====================
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [whyUsContent, setWhyUsContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, whyUsData] = await Promise.all([
          getPublicProducts(),
          getWhyUsContent(),
        ]);
        setProducts(productsData || []);
        setWhyUsContent(whyUsData.content);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ================== DATA PREPARATION ==================
  const categoriesMap: Record<string, any[]> = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(p);
  });
  const categoryKeys = Object.keys(categoriesMap);

  const topProducts = products.slice(0, 6);
  const highlightProducts = products.slice(6, 9);
  const displayCategories = categoryKeys.slice(0, 4);

  const promoMessages = [
    '🎁 Free Gift With Over Rp. 1.000.000 Purchase',
    '🔥 Limited time offer – don\'t miss out!',
    'Use Code FURMILY10 for 10% OFF',
    '⭐ Join our loyalty program & earn rewards',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🐾</div>
      </div>
    );
  }

  return (
    <div>
      {/* MARQUEE – FULL WIDTH */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 px-0 overflow-hidden">
        <Marquee messages={promoMessages} />
      </div>

      {/* HERO – BANNER SLIDER FULL WIDTH */}
      <section className="relative bg-gradient-to-r from-furmily-primary to-[#0A6B5C] py-4 sm:py-8 w-screen relative left-1/2 -translate-x-1/2 px-0 overflow-hidden">
        <BannerSlider />
      </section>

      {/* ==================== WHY US? ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <span className="uppercase text-furmily-primary tracking-widest text-xs sm:text-sm font-semibold">WHY US?</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-furmily-primary mt-1">Kenapa Memilih Furmily?</h2>
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: whyUsContent }} />
        </div>
      </section>

      {/* ==================== TOP PRODUCTS (6, mobile 2 kolom) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div>
            <span className="uppercase text-furmily-primary tracking-widest text-xs sm:text-sm font-semibold">TOP PRODUCTS</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-furmily-primary mt-1">Produk Paling Dicari</h2>
          </div>
          <Link href="/products" className="text-furmily-primary hover:underline font-medium flex items-center gap-1 text-sm sm:text-base">
            Lihat Semua <FaArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {topProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== PRODUCT HIGHLIGHTS (FULL WIDTH BACKGROUND) ==================== */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-800 py-12 sm:py-16 w-screen relative left-1/2 -translate-x-1/2 px-0 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-white/70 tracking-widest text-xs sm:text-sm font-semibold uppercase">Pilihan Terbaik</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mt-1">Rekomendasi Spesial</h2>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            {highlightProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition flex items-center gap-4 sm:gap-8 w-full"
              >
                <div className="w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!product.image_url && (
                    <span className="text-3xl sm:text-4xl">🐾</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-furmily-primary truncate">{product.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-2 mt-0.5 sm:mt-1">{product.description}</p>
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="font-bold text-emerald-700 text-base sm:text-xl">Rp {product.price.toLocaleString()}</span>
                    <Link
                      href={`/products?category=${encodeURIComponent(product.category)}`}
                      className="text-xs sm:text-sm bg-emerald-600 text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-full hover:bg-emerald-700 transition"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SHOP ALL CATEGORIES (mobile 2 kolom) ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 sm:mb-14">
          <span className="uppercase text-furmily-primary tracking-widest text-xs sm:text-sm font-semibold">KATEGORI</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-furmily-primary mt-1">Belanja Berdasarkan Kategori</h2>
        </div>

        {displayCategories.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada kategori.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {displayCategories.map((cat, catIdx) => {
              const productsInCat = categoriesMap[cat];
              const previewProducts = productsInCat.slice(0, 4);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-100"
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="block p-3 sm:p-5"
                  >
                    <h3 className="text-sm sm:text-xl font-bold text-furmily-primary mb-2 sm:mb-3 flex items-center justify-between">
                      {cat}
                      <span className="text-[10px] sm:text-sm text-gray-400 font-normal">{productsInCat.length} produk</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {previewProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                        >
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {!prod.image_url && (
                            <span className="text-xl sm:text-3xl">🐾</span>
                          )}
                        </div>
                      ))}
                      {Array.from({ length: 4 - previewProducts.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
                          <span className="text-lg sm:text-2xl">+</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 sm:mt-4 text-furmily-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-xs sm:text-base">
                      Lihat Semua <FaArrowRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {categoryKeys.length > 4 && (
          <div className="text-center mt-8 sm:mt-10">
            <Link href="/products" className="text-furmily-primary font-semibold hover:underline inline-flex items-center gap-1 text-sm sm:text-base">
              Lihat Semua Kategori <FaArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* Floating WhatsApp Button */}
      {/* <WhatsAppButton /> */}
    </div>
  );
}