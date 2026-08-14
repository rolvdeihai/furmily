'use client';

import { useState, useEffect } from 'react';
import { getAboutContent, updateAboutContent } from '@/app/actions/about';
import { useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function AdminAboutPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAboutContent().then((data) => {
      setContent(data.content);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateAboutContent(content);
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
      <h1 className="text-3xl font-bold text-furmily-primary mb-6">Edit Halaman About</h1>

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
                Gunakan tag HTML berikut untuk memformat teks. <strong>Klik contoh</strong> untuk melihat hasilnya.
              </p>

              {/* Tabel Panduan */}
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
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;p&gt;...&lt;/p&gt;</code></td>
                      <td className="border p-2">Paragraf (baris baru dengan spasi)</td>
                      <td className="border p-2">Ini adalah paragraf.</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;strong&gt;...&lt;/strong&gt;</code></td>
                      <td className="border p-2">Teks <strong>tebal</strong></td>
                      <td className="border p-2"><strong>Teks Tebal</strong></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;em&gt;...&lt;/em&gt;</code></td>
                      <td className="border p-2">Teks <em>miring</em></td>
                      <td className="border p-2"><em>Teks Miring</em></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;u&gt;...&lt;/u&gt;</code></td>
                      <td className="border p-2">Teks <u>garis bawah</u></td>
                      <td className="border p-2"><u>Teks Garis Bawah</u></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;br /&gt;</code></td>
                      <td className="border p-2">Ganti baris (enter)</td>
                      <td className="border p-2">Baris 1<br />Baris 2</td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;h1&gt;...&lt;/h1&gt;</code></td>
                      <td className="border p-2">Heading ukuran 1 (paling besar)</td>
                      <td className="border p-2"><span className="text-xl font-bold">Judul Besar</span></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;h2&gt;...&lt;/h2&gt;</code></td>
                      <td className="border p-2">Heading ukuran 2</td>
                      <td className="border p-2"><span className="text-lg font-bold">Judul Sedang</span></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;h3&gt;...&lt;/h3&gt;</code></td>
                      <td className="border p-2">Heading ukuran 3</td>
                      <td className="border p-2"><span className="text-base font-bold">Judul Kecil</span></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</code></td>
                      <td className="border p-2">Daftar bullet (poin-poin)</td>
                      <td className="border p-2">
                        <ul className="list-disc pl-4">
                          <li>Poin 1</li>
                          <li>Poin 2</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;ol&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ol&gt;</code></td>
                      <td className="border p-2">Daftar bernomor</td>
                      <td className="border p-2">
                        <ol className="list-decimal pl-4">
                          <li>Item 1</li>
                          <li>Item 2</li>
                        </ol>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;a href="URL"&gt;...&lt;/a&gt;</code></td>
                      <td className="border p-2">Link/tautan</td>
                      <td className="border p-2"><a href="#" className="text-blue-600 underline">Klik di sini</a></td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;img src="URL" alt="..." /&gt;</code></td>
                      <td className="border p-2">Menampilkan gambar</td>
                      <td className="border p-2">
                        🖼️ Gambar akan muncul
                        <p className="text-xs text-gray-400 mt-1">
                          Contoh Google Drive:<br />
                          <code className="text-[10px] bg-gray-100 px-1 rounded">https://drive.google.com/uc?export=view&id=FILE_ID</code>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border p-2"><code className="bg-gray-100 px-1 rounded">&lt;blockquote&gt;...&lt;/blockquote&gt;</code></td>
                      <td className="border p-2">Kutipan (menggeser ke kanan)</td>
                      <td className="border p-2 pl-4 border-l-4 border-gray-300">Ini adalah kutipan.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ===== CARA LINK GOOGLE DRIVE ===== */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                  📸 Menampilkan Gambar dari Google Drive
                </h3>
                <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1 mt-1">
                  <li>
                    Buka file gambar di <strong>Google Drive</strong>, klik tombol <strong>"Bagikan"</strong>.
                  </li>
                  <li>
                    Ubah akses menjadi <strong>"Siapa pun dengan tautan dapat melihat"</strong>.
                  </li>
                  <li>
                    Salin tautan yang diberikan, misalnya:
                    <br />
                    <code className="bg-white px-2 py-0.5 rounded text-xs block mt-1">
                      https://drive.google.com/file/d/abc123xyz/view?usp=sharing
                    </code>
                  </li>
                  <li>
                    Ganti format tautan menjadi:
                    <br />
                    <code className="bg-white px-2 py-0.5 rounded text-xs block mt-1">
                      https://drive.google.com/uc?export=view&id=abc123xyz
                    </code>
                    <span className="text-xs">(ambil ID dari tautan asli, yaitu <kbd>abc123xyz</kbd>)</span>
                  </li>
                  <li>
                    Masukkan URL tersebut ke tag <code>&lt;img src="..." /&gt;</code>, misalnya:
                    <br />
                    <code className="bg-white px-2 py-0.5 rounded text-xs block mt-1">
                      &lt;img src="https://drive.google.com/uc?export=view&id=abc123xyz" alt="Deskripsi" /&gt;
                    </code>
                  </li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Pastikan file gambar sudah di-<em>share</em> secara publik agar bisa diakses.
                </p>
              </div>

              {/* Contoh HTML siap pakai */}
              <div className="mt-4">
                <p className="font-semibold">💡 Contoh konten siap pakai:</p>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
{`<p><strong>Furmily</strong> adalah brand premium yang berdedikasi untuk menyediakan camilan sehat dan bergizi bagi kucing dan anjing kesayangan Anda.</p>

<p>Kami percaya bahwa hewan peliharaan layak mendapatkan yang terbaik — dari bahan-bahan alami pilihan hingga proses produksi yang higienis.</p>

<h2>Kenapa Memilih Furmily?</h2>
<ul>
  <li>🌿 <strong>Bahan Alami</strong> - Tanpa pengawet dan pewarna buatan</li>
  <li>🧊 <strong>Freeze Dried</strong> - Nutrisi tetap terjaga</li>
  <li>❤️ <strong>Dengan Cinta</strong> - Dibuat khusus untuk hewan kesayangan</li>
</ul>

<!-- Contoh gambar dari Google Drive -->
<img src="https://drive.google.com/uc?export=view&id=FILE_ID" alt="Gambar produk" style="max-width:100%; border-radius:12px; margin: 16px 0;" />

<p>Kami berkomitmen untuk mendukung kesehatan dan kebahagiaan hewan peliharaan Anda melalui produk-produk berkualitas tinggi yang kami racik dengan cinta.</p>`}
                </pre>
                <button
                  type="button"
                  onClick={() => setContent(`<p><strong>Furmily</strong> adalah brand premium yang berdedikasi untuk menyediakan camilan sehat dan bergizi bagi kucing dan anjing kesayangan Anda.</p>\n\n<p>Kami percaya bahwa hewan peliharaan layak mendapatkan yang terbaik — dari bahan-bahan alami pilihan hingga proses produksi yang higienis.</p>\n\n<h2>Kenapa Memilih Furmily?</h2>\n<ul>\n  <li>🌿 <strong>Bahan Alami</strong> - Tanpa pengawet dan pewarna buatan</li>\n  <li>🧊 <strong>Freeze Dried</strong> - Nutrisi tetap terjaga</li>\n  <li>❤️ <strong>Dengan Cinta</strong> - Dibuat khusus untuk hewan kesayangan</li>\n</ul>\n\n<img src="https://drive.google.com/uc?export=view&id=FILE_ID" alt="Gambar produk" style="max-width:100%; border-radius:12px; margin: 16px 0;" />\n\n<p>Kami berkomitmen untuk mendukung kesehatan dan kebahagiaan hewan peliharaan Anda melalui produk-produk berkualitas tinggi yang kami racik dengan cinta.</p>`)}
                  className="mt-2 text-xs bg-furmily-primary/10 text-furmily-primary px-3 py-1 rounded hover:bg-furmily-primary/20 transition"
                >
                  📋 Gunakan contoh ini
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  ⚠️ Ganti <kbd>FILE_ID</kbd> dengan ID file Google Drive Anda.
                </p>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                ⚠️ <strong>Peringatan:</strong> Jangan gunakan tag &lt;script&gt;, &lt;iframe&gt;, atau tag berbahaya lainnya.
                Hanya gunakan tag HTML dasar untuk keamanan.
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