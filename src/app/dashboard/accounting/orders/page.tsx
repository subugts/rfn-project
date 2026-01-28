'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; code: string };
  m3Amount: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  deliveryDate: string;
  createdAt: string;
}

const createOrderSchema = z.object({
  customerId: z.string(),
  m3Amount: z.number().positive(),
  unitPrice: z.number().positive(),
  deliveryDate: z.string().optional(),
});

export default function AccountingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    m3Amount: '',
    unitPrice: '',
    deliveryDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          axios.get('/api/orders', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('/api/customers', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        setOrders(ordersRes.data);
        setCustomers(customersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        customerId: formData.customerId,
        m3Amount: parseFloat(formData.m3Amount),
        unitPrice: parseFloat(formData.unitPrice),
        deliveryDate: formData.deliveryDate || undefined,
      };

      createOrderSchema.parse(data);

      const response = await axios.post('/api/orders', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setOrders([response.data, ...orders]);
      setFormData({ customerId: '', m3Amount: '', unitPrice: '', deliveryDate: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Siparişler</h1>
          <p className="text-gray-600 mt-1">Sipariş yönetimi ve takibi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          {showForm ? 'İptal' : '+ Yeni Sipariş Aç'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Yeni Sipariş</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.code} - {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M3 Miktarı
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.m3Amount}
                  onChange={(e) =>
                    setFormData({ ...formData, m3Amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teslimat Tarihi
                </label>
                <input
                  type="datetime-local"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Sipariş Aç
            </button>
          </form>
        </div>
      )}

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
                    Birim Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Toplam
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Durum
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
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.m3Amount} m³
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₺{order.unitPrice}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      ₺{order.totalPrice.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        Düzenle
                      </button>
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
