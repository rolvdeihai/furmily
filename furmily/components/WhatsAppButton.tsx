'use client';

import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  productName?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function WhatsAppButton({
  productName = 'produk Furmily',
  className = '',
  children,
}: WhatsAppButtonProps) {
  const phoneNumber = '6282172111660';
  const message = `Halo, saya tertarik dengan ${productName}. Apakah tersedia?`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-2
        bg-[#25D366] hover:bg-[#1ebe5d]
        text-white font-semibold
        py-3 px-6 rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:scale-105
        ${className}
      `}
    >
      <FaWhatsapp size={24} />
      <span>{children || 'Chat via WhatsApp'}</span>
    </a>
  );
}