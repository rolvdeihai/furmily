import WhatsAppButton from '@/components/WhatsAppButton';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-furmily-primary">Hubungi Kami</h1>
      <p className="mt-4 text-gray-700">
        Ada pertanyaan tentang produk, pemesanan, atau kemitraan? Jangan ragu 
        untuk menghubungi kami.
      </p>

      <div className="mt-8 bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h2 className="text-xl font-semibold text-furmily-primary">Kontak</h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-center gap-3">
            <span className="text-furmily-primary text-xl">📱</span>
            <div>
              <strong>WhatsApp:</strong> +62 821-7211-1660
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-furmily-primary text-xl">📧</span>
            <div>
              <strong>Email:</strong> info@furmily.com
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-furmily-primary text-xl">📍</span>
            <div>
              <strong>Indonesia:</strong> Crest Drive 1/7, Park Serpong, Cendana Crest, Kec. Legok, Kabupaten Tangerang, Banten 15820
            </div>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-furmily-primary text-xl">📍</span>
            <div>
              <strong>Malaysia:</strong> 24B, Jalan Anggerik Vanilla 31/93, Kota Kemuning, 40460 Shah Alam, Selangor
            </div>
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <WhatsAppButton 
            productName="informasi produk Furmily" 
            className="px-6 py-3"
          >
            Chat via WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
}