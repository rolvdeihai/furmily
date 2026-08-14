'use client';

import { useState, useEffect } from 'react';
import { getWhyUsContent, updateWhyUsContent } from '@/app/actions/landing';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function AdminLandingPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getWhyUsContent().then((data) => {
      setContent(data.content);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateWhyUsContent(content);
      setMessage('✅ Konten berhasil diperbarui!');
      router.refresh();
    } catch (err: any) {
      setMessage('❌ Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Memuat...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-furmily-primary mb-6">Edit Landing Page</h1>
      <p className="text-gray-600 mb-4">Edit bagian <strong>"Why Us?"</strong> yang muncul setelah banner slider.</p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Konten (HTML)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-furmily-primary focus:border-transparent outline-none"
            placeholder="Tulis konten HTML di sini..."
          />
        </div>

        {/* ============ PANDUAN HTML ============ */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition text-left"
          >
            <span className="font-semibold text-furmily-primary">📖 Panduan HTML Dasar</span>
            {showGuide ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showGuide && (
            <div className="p-4 bg-white text-sm space-y-3">
              <p className="text-gray-600">
                Gunakan tag HTML berikut untuk memformat teks. Gunakan kelas Tailwind untuk styling.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Tag HTML</th>
                      <th className="border p-2 text-left">Fungsi</th>
                      <th className="border p-2 text-left">Hasil</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;div&gt;...&lt;/div&gt;</code></td>
                      <td className="border p-2">Container / pembungkus</td>
                      <td className="border p-2">—</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;h2&gt;...&lt;/h2&gt;</code></td>
                      <td className="border p-2">Judul</td>
                      <td className="border p-2"><span className="text-xl font-bold">Judul</span></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;h3&gt;...&lt;/h3&gt;</code></td>
                      <td className="border p-2">Sub-judul</td>
                      <td className="border p-2"><span className="text-lg font-bold">Sub-judul</span></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;p&gt;...&lt;/p&gt;</code></td>
                      <td className="border p-2">Paragraf</td>
                      <td className="border p-2">Ini paragraf.</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;strong&gt;...&lt;/strong&gt;</code></td>
                      <td className="border p-2">Teks <strong>tebal</strong></td>
                      <td className="border p-2"><strong>Tebal</strong></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;em&gt;...&lt;/em&gt;</code></td>
                      <td className="border p-2">Teks <em>miring</em></td>
                      <td className="border p-2"><em>Miring</em></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;br /&gt;</code></td>
                      <td className="border p-2">Ganti baris</td>
                      <td className="border p-2">Baris 1<br />Baris 2</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;img src="..." /&gt;</code></td>
                      <td className="border p-2">Menampilkan gambar</td>
                      <td className="border p-2">🖼️ Gambar muncul</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Contoh struktur Why Us */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-800">💡 Struktur Standar "Why Us?" (3 kolom)</h4>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto mt-2">
{`<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div class="text-center">
    <div class="text-5xl mb-4">🌿</div>
    <h3 class="text-xl font-bold text-furmily-primary">Judul 1</h3>
    <p class="text-gray-600 mt-2">Deskripsi 1</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">🧊</div>
    <h3 class="text-xl font-bold text-furmily-primary">Judul 2</h3>
    <p class="text-gray-600 mt-2">Deskripsi 2</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">❤️</div>
    <h3 class="text-xl font-bold text-furmily-primary">Judul 3</h3>
    <p class="text-gray-600 mt-2">Deskripsi 3</p>
  </div>
</div>`}
                </pre>
                <button
                  type="button"
                  onClick={() => setContent(`<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div class="text-center">
    <div class="text-5xl mb-4">🌿</div>
    <h3 class="text-xl font-bold text-furmily-primary">100% Bahan Alami</h3>
    <p class="text-gray-600 mt-2">Tanpa pengawet, pewarna buatan, atau bahan tambahan berbahaya.</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">🧊</div>
    <h3 class="text-xl font-bold text-furmily-primary">Teknologi Freeze Dried</h3>
    <p class="text-gray-600 mt-2">Mempertahankan nutrisi, rasa, dan tekstur alami bahan makanan.</p>
  </div>
  <div class="text-center">
    <div class="text-5xl mb-4">❤️</div>
    <h3 class="text-xl font-bold text-furmily-primary">Dibuat dengan Cinta</h3>
    <p class="text-gray-600 mt-2">Setiap produk kami racik khusus untuk kesehatan hewan kesayangan Anda.</p>
  </div>
</div>`)}
                  className="mt-2 text-xs bg-furmily-primary/10 text-furmily-primary px-3 py-1 rounded hover:bg-furmily-primary/20 transition"
                >
                  📋 Gunakan contoh default
                </button>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                ⚠️ <strong>Peringatan:</strong> Jangan gunakan tag &lt;script&gt;, &lt;iframe&gt;, atau tag berbahaya lainnya.
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-furmily-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-furmily-dark transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          {message && <span className="text-sm">{message}</span>}
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Preview</h2>
        <div className="bg-gray-50 p-4 rounded-lg border min-h-[100px] prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}