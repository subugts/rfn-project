'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string };
  m3Amount: number;
  totalPrice: number;
  status: string;
  deliveryDate: string;
}

export default function ShippingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Siparişler</h1>
        <p className="text-gray-600 mt-1">Tüm siparişleri takip edin</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Açık Siparişler</h2>
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
                    M3
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Teslimat Tarihi
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
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₺{order.totalPrice.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString('tr-TR')
                        : '-'}
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
