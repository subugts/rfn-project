'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string };
  m3Amount: number;
  status: string;
  deliveryDate: string;
}

export default function OperatorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PRODUCTION');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders', {
          params: { status: filter },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const statusColors: Record<string, string> = {
    PRODUCTION: 'bg-orange-100 text-orange-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Siparişler</h1>
        <p className="text-gray-600 mt-1">Üretim durumunu kontrol edin</p>
      </div>

      <div className="flex gap-2">
        {['PRODUCTION', 'SHIPPED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status === 'PRODUCTION' ? 'Üretimde' : status === 'SHIPPED' ? 'Sevk Edildi' : 'Tamamlanan'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {filter === 'PRODUCTION'
              ? 'Üretim Aşamasındaki Siparişler'
              : filter === 'SHIPPED'
              ? 'Sevk Edilen Siparişler'
              : 'Tamamlanan Siparişler'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Sipariş bulunamadı</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Cari
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    M3 Miktarı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Teslimat Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.m3Amount} m³
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[order.status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`/dashboard/operator/production`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Görüntüle
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
