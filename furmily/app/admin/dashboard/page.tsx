'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/app/actions/dashboard';
import { FaBox, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;

  const cards = [
    { title: 'Total Pesanan', value: stats.totalOrders, icon: FaShoppingCart, color: 'bg-blue-500' },
    { title: 'Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString()}`, icon: FaDollarSign, color: 'bg-green-500' },
    { title: 'Produk', value: stats.totalProducts, icon: FaBox, color: 'bg-purple-500' },
    { title: 'Pelanggan', value: stats.totalCustomers, icon: FaUsers, color: 'bg-orange-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-furmily-primary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-full text-white`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pesanan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">No. Order</th>
                <th className="p-2 text-left">Pelanggan</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b">
                  <td className="p-2">{order.order_number}</td>
                  <td className="p-2">{order.customer?.name}</td>
                  <td className="p-2">Rp {order.total_amount.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'pending' ? 'bg-yellow-200' :
                      order.status === 'confirmed' ? 'bg-blue-200' :
                      order.status === 'shipped' ? 'bg-purple-200' :
                      order.status === 'delivered' ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}