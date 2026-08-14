'use client';

import { useState, useEffect } from 'react';
import { getAboutContent } from '@/app/actions/about';

export default function AboutPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAboutContent().then((data) => {
      setContent(data.content);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto text-center py-12">Memuat...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-furmily-primary">Tentang Furmily</h1>
      <div className="mt-6 prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {/* Tetap tampilkan icon cards - opsional, bisa juga dipindahkan ke dalam konten */}
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