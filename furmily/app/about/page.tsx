export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-furmily-primary">Tentang Furmily</h1>
      <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
        <p>
          <strong>Furmily</strong> adalah brand premium yang berdedikasi untuk menyediakan 
          camilan sehat dan bergizi bagi kucing dan anjing kesayangan Anda. 
          Kami percaya bahwa hewan peliharaan layak mendapatkan yang terbaik — 
          dari bahan-bahan alami pilihan hingga proses produksi yang higienis.
        </p>
        <p>
          Semua produk Furmily diproses dengan metode <strong>freeze drying</strong>, 
          yang mempertahankan nutrisi, rasa, dan tekstur alami bahan makanan. 
          Tanpa pengawet, tanpa pemanis buatan, tanpa bahan tambahan berbahaya.
        </p>
        <p>
          Kami berkomitmen untuk mendukung kesehatan dan kebahagiaan hewan peliharaan 
          Anda melalui produk-produk berkualitas tinggi yang kami racik dengan cinta.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-furmily-cream p-4 rounded-xl text-center">
          <span className="text-3xl">🌿</span>
          <p className="font-semibold text-sm">Bahan Alami</p>
        </div>
        <div className="bg-furmily-cream p-4 rounded-xl text-center">
          <span className="text-3xl">🧊</span>
          <p className="font-semibold text-sm">Freeze Dried</p>
        </div>
        <div className="bg-furmily-cream p-4 rounded-xl text-center">
          <span className="text-3xl">❤️</span>
          <p className="font-semibold text-sm">Tanpa Pengawet</p>
        </div>
        <div className="bg-furmily-cream p-4 rounded-xl text-center">
          <span className="text-3xl">🏆</span>
          <p className="font-semibold text-sm">Premium Quality</p>
        </div>
      </div>
    </div>
  );
}