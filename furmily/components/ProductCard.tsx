'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
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
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-furmily-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {product.badge}
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              Stok Terbatas
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full rotate-12 shadow-lg">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-furmily-primary line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs bg-furmily-cream text-furmily-primary px-2 py-1 rounded-full whitespace-nowrap">
            {product.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-1 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="mt-3">
          {discountPercent > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm line-through text-gray-400">
                Rp {product.price.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-red-600">
                Rp {discountedPrice.toLocaleString()}
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                -{discountPercent}%
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-furmily-primary">
              Rp {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Buttons Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="col-span-2 flex items-center justify-center gap-2 bg-furmily-primary text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-furmily-dark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <FaShoppingCart size={16} />
            {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/6282172111660?text=Halo%2C%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.name)}.%20Apakah%20tersedia%3F`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-2 px-3 rounded-xl hover:bg-green-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
          >
            <FaWhatsapp size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Shopee */}
          <a
            href="https://id.shp.ee/yAAD6YvK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#EE4D2D] text-white font-medium py-2 px-3 rounded-xl hover:bg-[#D43A1A] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm"
          >
            <SiShopee size={16} />
            <span className="hidden sm:inline">Shopee</span>
          </a>

          {/* Tokopedia */}
          <a
            href="https://tk.tokopedia.com/ZSCtyMGgF/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#42B549] text-white font-medium py-2 px-3 rounded-xl hover:bg-[#369A3B] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-sm col-span-2 sm:col-span-1"
          >
            <Store size={16} />
            <span className="hidden sm:inline">Tokopedia</span>
          </a>
        </div>
      </div>
    </div>
  );
}