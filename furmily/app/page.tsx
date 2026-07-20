import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShopeeButton from '@/components/ShopeeButton';
import TokopediaButton from '@/components/TokopediaButton';
import { getPublicProducts } from '@/app/actions/frontend';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const products = await getPublicProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section – Full Viewport Height */}
      <section className="relative bg-gradient-to-r from-furmily-primary to-[#0A6B5C] text-white min-h-screen flex items-center overflow-hidden">
        {/* Decorative background element – will not overflow */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 flex items-center justify-end pointer-events-none">
          <span className="text-[300px] md:text-[400px] lg:text-[500px] select-none">🐕</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">🐾</span>
              <span className="text-sm bg-white/20 px-4 py-1 rounded-full">Premium Pet Nutrition</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Furmily<br />
              <span className="text-furmily-cream">100% Natural Freeze Dried</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl opacity-90">
              Camilan sehat & bergizi untuk kucing dan anjing kesayangan Anda. 
              Dibuat dari bahan alami pilihan dengan proses freeze drying untuk 
              menjaga nutrisi dan rasa.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-white text-furmily-primary font-bold py-3 px-8 rounded-full hover:bg-furmily-cream transition text-base md:text-lg"
              >
                Lihat Semua Produk
              </Link>
              <WhatsAppButton 
                productName="produk Furmily" 
                className="bg-green-600 hover:bg-green-700 py-3 px-8 text-base md:text-lg"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block z-20">
          <div className="flex flex-col items-center text-white/70 text-sm">
            Scroll
            <div className="mt-2 w-6 h-10 border-2 border-white/50 rounded-full flex items-center justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Freeze Dried? */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-bold text-furmily-primary">Mengapa Freeze Dried?</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Freeze drying (pembekuan kering) adalah metode pengawetan terbaik yang 
            mempertahankan nutrisi, rasa, dan tekstur alami bahan makanan. 
            Tanpa bahan pengawet, tanpa pemanis buatan — hanya kebaikan alami 
            untuk hewan peliharaan Anda.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">✅ <span>Mempertahankan nutrisi hingga 97%</span></li>
            <li className="flex items-center gap-2">✅ <span>Tahan lama tanpa bahan pengawet</span></li>
            <li className="flex items-center gap-2">✅ <span>Rasa alami yang disukai hewan</span></li>
            <li className="flex items-center gap-2">✅ <span>Mudah disimpan dan dibawa</span></li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-furmily-primary rounded-xl p-4 text-center text-white">
            <span className="text-3xl">🥩</span>
            <p className="font-bold text-sm">Protein Tinggi</p>
          </div>
          <div className="bg-furmily-cream rounded-xl p-4 text-center text-furmily-primary">
            <span className="text-3xl">🐟</span>
            <p className="font-bold text-sm">Omega-3 Kaya</p>
          </div>
          <div className="bg-furmily-gold rounded-xl p-4 text-center text-white">
            <span className="text-3xl">🌿</span>
            <p className="font-bold text-sm">100% Alami</p>
          </div>
          <div className="bg-green-600 rounded-xl p-4 text-center text-white">
            <span className="text-3xl">❤️</span>
            <p className="font-bold text-sm">Dibuat dengan Cinta</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-furmily-primary">Produk Pilihan</h2>
          <Link href="/products" className="text-furmily-primary hover:underline text-sm font-semibold">
            Lihat Semua →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-furmily-primary">Apa Kata Pelanggan?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-furmily-cream pl-4">
              <p className="italic">"Kucing saya sangat suka Salmon Freeze Dried! Bulunya jadi lebih berkilau."</p>
              <p className="mt-2 font-semibold text-furmily-primary">— Sarah, Jakarta</p>
            </div>
            <div className="border-l-4 border-furmily-cream pl-4">
              <p className="italic">"Produk Furmily berkualitas tinggi. Anjing saya lebih bersemangat makan."</p>
              <p className="mt-2 font-semibold text-furmily-primary">— Budi, Bandung</p>
            </div>
            <div className="border-l-4 border-furmily-cream pl-4">
              <p className="italic">"Food Topper Skin & Coat benar-benar ampuh! Bulu kucing saya lebat."</p>
              <p className="mt-2 font-semibold text-furmily-primary">— Maya, Surabaya</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        <div className="bg-furmily-primary text-white p-8 md:p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-bold">Siap Memberikan yang Terbaik untuk Hewan Peliharaan Anda?</h2>
          <p className="mt-2 text-lg opacity-90">
            Pesan sekarang dan rasakan manfaat nutrisi alami Furmily.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <ShopeeButton className="bg-[#EE4D2D] hover:bg-[#D43A1A] px-6 py-3" />
            <TokopediaButton className="bg-[#42B549] hover:bg-[#369A3B] px-6 py-3" />
            <WhatsAppButton productName="produk Furmily" className="bg-green-600 hover:bg-green-700 px-6 py-3" />
          </div>
        </div>
      </section>
    </div>
  );
}