import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Furmily - Premium Freeze Dried Treats for Pets',
  description: 'Premium freeze-dried treats, food toppers, and supplements for cats and dogs. 100% natural, healthy, and delicious.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8 min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}