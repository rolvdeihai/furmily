// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const { state } = useCart();

  // Check admin status from cookie
  const checkAdminStatus = () => {
    const hasSession = document.cookie.includes('admin_session=true');
    setIsAdmin(hasSession);
  };

  useEffect(() => {
    // Initial check
    checkAdminStatus();

    // Listen for login event (dispatched after admin login)
    window.addEventListener('adminLogin', checkAdminStatus);

    // Cleanup
    return () => {
      window.removeEventListener('adminLogin', checkAdminStatus);
    };
  }, []);

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsAdmin(false);
    setAdminDropdownOpen(false);
    window.location.href = '/';
  };

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bg-furmily-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-wide hover:text-furmily-cream transition">
            🐾 Furmily
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-8">
            <li><Link href="/" className="hover:text-furmily-cream transition text-sm font-medium">Home</Link></li>
            <li><Link href="/products" className="hover:text-furmily-cream transition text-sm font-medium">Products</Link></li>
            <li><Link href="/order" className="hover:text-furmily-cream transition text-sm font-medium text-furmily-cream font-semibold">📦 Pesan</Link></li>
            <li><Link href="/about" className="hover:text-furmily-cream transition text-sm font-medium">About</Link></li>
            <li><Link href="/wholesale" className="hover:text-furmily-cream transition text-sm font-medium">Wholesale</Link></li>
            <li><Link href="/contact" className="hover:text-furmily-cream transition text-sm font-medium">Contact</Link></li>

            {/* Cart */}
            <li>
              <Link href="/cart" className="relative hover:text-furmily-cream transition">
                <FaShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Admin Dropdown */}
            {isAdmin ? (
              <li className="relative">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center gap-1 bg-furmily-cream text-furmily-primary px-4 py-2 rounded-full font-semibold hover:bg-white transition text-sm"
                >
                  📊 Dashboard <FaChevronDown size={12} />
                </button>
                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 text-gray-800 z-50">
                    <Link
                      href="/admin/dashboard"
                      className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      href="/admin/products"
                      className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      🛒 Products
                    </Link>
                    <Link
                      href="/admin/customers"
                      className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      👥 Customers
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      📦 Orders
                    </Link>
                    <Link
                      href="/admin/export"
                      className="block px-4 py-2 hover:bg-gray-100 transition text-sm"
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      📤 Export Data
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition text-sm"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link
                  href="/admin/login"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition text-sm"
                >
                  🔐 Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-2xl hover:text-furmily-cream transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-furmily-primary/95 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            <Link href="/" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/products" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>Products</Link>
            <Link href="/order" className="block hover:text-furmily-cream transition font-semibold" onClick={() => setIsOpen(false)}>📦 Pesan</Link>
            <Link href="/about" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/wholesale" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>Wholesale</Link>
            <Link href="/contact" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>Contact</Link>
            <Link href="/cart" className="block hover:text-furmily-cream transition" onClick={() => setIsOpen(false)}>
              🛒 Keranjang {itemCount > 0 && `(${itemCount})`}
            </Link>

            {isAdmin ? (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center justify-between w-full bg-furmily-cream text-furmily-primary px-4 py-2 rounded-full font-semibold"
                >
                  📊 Admin <FaChevronDown size={12} />
                </button>
                {adminDropdownOpen && (
                  <div className="mt-2 bg-white/10 rounded-xl p-2 space-y-1">
                    <Link href="/admin/dashboard" className="block px-3 py-1.5 rounded hover:bg-white/20 transition" onClick={() => { setIsOpen(false); setAdminDropdownOpen(false); }}>📊 Dashboard</Link>
                    <Link href="/admin/products" className="block px-3 py-1.5 rounded hover:bg-white/20 transition" onClick={() => { setIsOpen(false); setAdminDropdownOpen(false); }}>🛒 Products</Link>
                    <Link href="/admin/customers" className="block px-3 py-1.5 rounded hover:bg-white/20 transition" onClick={() => { setIsOpen(false); setAdminDropdownOpen(false); }}>👥 Customers</Link>
                    <Link href="/admin/orders" className="block px-3 py-1.5 rounded hover:bg-white/20 transition" onClick={() => { setIsOpen(false); setAdminDropdownOpen(false); }}>📦 Orders</Link>
                    <Link href="/admin/export" className="block px-3 py-1.5 rounded hover:bg-white/20 transition" onClick={() => { setIsOpen(false); setAdminDropdownOpen(false); }}>📤 Export Data</Link>
                    <button onClick={() => { handleLogout(); setIsOpen(false); setAdminDropdownOpen(false); }} className="block w-full text-left px-3 py-1.5 rounded hover:bg-white/20 transition text-red-300">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2 border-t border-white/10">
                <Link href="/admin/login" className="block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-center" onClick={() => setIsOpen(false)}>🔐 Admin</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}