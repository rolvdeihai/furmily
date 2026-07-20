import Link from 'next/link';
import { FaTiktok, FaShoppingBag, FaWhatsapp, FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiShopee } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-furmily-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold">🐾 Furmily</h3>
            <p className="text-sm opacity-80 mt-3 leading-relaxed">
              Premium freeze-dried treats & supplements for your beloved pets. 
              100% natural, healthy, and delicious.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.tiktok.com/@furmily" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition" aria-label="TikTok"><FaTiktok size={20} /></a>
              <a href="https://id.shp.ee/yAAD6YvK" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition" aria-label="Shopee"><SiShopee size={20} /></a>
              <a href="https://tk.tokopedia.com/ZSCtyMGgF/" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition" aria-label="Tokopedia"><FaShoppingBag size={20} /></a>
              <a href="https://wa.me/6282172111660" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition" aria-label="WhatsApp"><FaWhatsapp size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/" className="hover:opacity-100 transition">Home</Link></li>
              <li><Link href="/products" className="hover:opacity-100 transition">Products</Link></li>
              <li><Link href="/about" className="hover:opacity-100 transition">About</Link></li>
              <li><Link href="/wholesale" className="hover:opacity-100 transition">Wholesale</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Support</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/order" className="hover:opacity-100 transition">Buat Pesanan</Link></li>
              <li><Link href="/cart" className="hover:opacity-100 transition">Keranjang</Link></li>
              <li><Link href="/faq" className="hover:opacity-100 transition">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:opacity-100 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Indonesia: Crest Drive 1/7, Park Serpong</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Malaysia: 24B, Jalan Anggerik Vanilla 31/93</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <a href="https://wa.me/6282172111660" className="hover:underline">+62 821-7211-1660</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:info@furmily.com" className="hover:underline">info@furmily.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} Furmily. All rights reserved. Made with ❤️ for your pets.</p>
        </div>
      </div>
    </footer>
  );
}