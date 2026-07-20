'use client';

import { SiShopee } from 'react-icons/si';

interface ShopeeButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function ShopeeButton({
  className = '',
  children,
}: ShopeeButtonProps) {
  const url = 'https://id.shp.ee/yAAD6YvK';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group
        inline-flex items-center gap-3
        rounded-full
        bg-[#EE4D2D]
        px-7 py-3.5
        font-semibold text-white
        shadow-lg shadow-orange-500/30
        transition-all duration-300
        hover:-translate-y-1
        hover:scale-105
        hover:bg-[#D73211]
        hover:shadow-xl hover:shadow-orange-500/40
        ${className}
      `}
    >
      <SiShopee
        size={24}
        className="transition-transform duration-300 group-hover:rotate-6"
      />

      <span>{children || 'Beli Sekarang di Shopee'}</span>
    </a>
  );
}