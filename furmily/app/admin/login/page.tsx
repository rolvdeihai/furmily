'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (data.success) {
      // ✅ Set cookie (the API does this, but for safety we also set it client-side)
      document.cookie = 'admin_session=true; path=/; max-age=86400';
      
      // ✅ Dispatch custom event to notify Navbar
      window.dispatchEvent(new Event('adminLogin'));
      
      router.push('/admin/dashboard');
    } else {
      setError('Password salah');
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
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-furmily-primary text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}