'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, use a proper auth system
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      document.cookie = 'admin_session=true; path=/'; // simple cookie
      router.push('/admin/dashboard');
    } else {
      alert('Password salah');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-furmily-primary">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="bg-furmily-primary text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}