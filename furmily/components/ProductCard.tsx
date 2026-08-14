'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import { SiShopee } from 'react-icons/si';
import { Store } from 'lucide-react';
import { Product } from '@/app/actions/products';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert('Stok produk ini habis.');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1,
    });
  };

  const discountPercent = product.discount_percent ?? 0;
  const discountedPrice = discountPercent > 0
    ? product.price * (1 - discountPercent / 100)
    : product.price;

  // Dynamic Shopee & Tokopedia deeplinks based on product name
  const shopeeLink = `https://shopee.co.id/search?keyword=${encodeURIComponent(product.name)}&shop=1809648728`;
  const tokopediaLink = `https://www.tokopedia.com/furmily-pet?q=${encodeURIComponent(product.name)}&navsource=shop&srp_component_id=02.01.00.00&srp_page_title=Furmily%20Pet`;

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-furmily-primary/20 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative overflow-hidden bg-[#FDF8F5] aspect-square">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
            🐾
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-furmily-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow">
              {product.badge}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow">
              Stok Terbatas
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full rotate-12 shadow-lg">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-1 sm:gap-2">
          <h3 className="text-sm sm:text-lg font-bold text-furmily-primary line-clamp-2">
            {product.name}
          </h3>
          <span className="text-[10px] sm:text-xs bg-furmily-cream text-furmily-primary px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">
            {product.category}
          </span>
        </div>

        <p className="text-gray-600 text-[11px] sm:text-sm mt-0.5 sm:mt-1 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="mt-1 sm:mt-3">
          {discountPercent > 0 ? (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-sm line-through text-gray-400">
                Rp {product.price.toLocaleString()}
              </span>
              <span className="text-sm sm:text-xl font-bold text-red-600">
                Rp {discountedPrice.toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-xs bg-red-100 text-red-700 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full font-semibold">
                -{discountPercent}%
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-xl font-bold text-furmily-primary">
              Rp {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Buttons – vertical stack */}
        <div className="mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">
          {/* Add to Cart – full width */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-furmily-primary text-white font-semibold py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl hover:bg-furmily-dark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-xs sm:text-base"
          >
            <FaShoppingCart size={14} className="sm:w-4 sm:h-4" />
            {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </button>

          {/* Shopee & Tokopedia – 2 columns on desktop, but we stack them vertically on mobile? The user said "stack 3 tombol aja vertikal" meaning vertically stacked. So we'll make them full width as well. */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <a
              href={shopeeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 sm:gap-2 bg-[#EE4D2D] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl hover:bg-[#D43A1A] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-[10px] sm:text-sm"
            >
              <SiShopee size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Shopee</span>
            </a>
            <a
              href={tokopediaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 sm:gap-2 bg-[#42B549] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl hover:bg-[#369A3B] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-[10px] sm:text-sm"
            >
              <Store size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Tokopedia</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}