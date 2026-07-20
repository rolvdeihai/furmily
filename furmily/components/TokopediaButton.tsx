'use client';

import { Store } from 'lucide-react';

interface TokopediaButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function TokopediaButton({
  className = '',
  children,
}: TokopediaButtonProps) {
  const url = 'https://tk.tokopedia.com/ZSCtyMGgF/';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group
        inline-flex items-center gap-3
        rounded-full
        bg-[#42B549]
        px-7 py-3.5
        font-semibold text-white
        shadow-lg shadow-green-500/30
        transition-all duration-300
        hover:-translate-y-1
        hover:scale-105
        hover:bg-[#369A3B]
        hover:shadow-xl hover:shadow-green-500/40
        ${className}
      `}
    >
      <Store
        size={24}
        className="transition-transform duration-300 group-hover:rotate-6"
      />

      <span>{children || 'Beli Sekarang di Tokopedia'}</span>
    </a>
  );
}