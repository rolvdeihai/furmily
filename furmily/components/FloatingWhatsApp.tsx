'use client';

import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWhatsApp() {
  const phoneNumber = '6282172111660';
  const message = 'Halo, saya tertarik dengan produk Furmily. Apakah tersedia?';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 flex items-center justify-center"
      aria-label="Chat via WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}