'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';

interface PriceRange {
  minM3: number;
  maxM3: number;
  unitPrice: number;
}

interface Customer {
  id: string;
  code: string;
  name: string;
  m3Limit: number;
  currentM3Used: number;
  priceRanges: PriceRange[];
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [warning, setWarning] = useState('');
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

  const getPriceForM3 = (customer: Customer, m3: number): number => {
    for (const range of customer.priceRanges) {
      if (m3 >= range.minM3 && m3 < range.maxM3) {
        return range.unitPrice;
      }
    }
    // Son aralıktan fazlası için son fiyatı kullan
    const lastRange = customer.priceRanges[customer.priceRanges.length - 1];
    if (m3 >= lastRange.minM3) {
      return lastRange.unitPrice;
    }
    return customer.priceRanges[0].unitPrice;
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData({ ...formData, customerId });
    setWarning('');
  };

  const handleM3Change = (m3Str: string) => {
    const m3 = parseFloat(m3Str);
    setFormData({ ...formData, m3Amount: m3Str });
    setWarning('');

    if (formData.customerId && m3) {
      const customer = customers.find((c) => c.id === formData.customerId);
      if (customer) {
        const totalM3 = customer.currentM3Used + m3;
        if (totalM3 > customer.m3Limit) {
          setWarning(
            `⚠️ UYARI: M3 sınırını aşacaksınız! Limit: ${customer.m3Limit}m³, Toplam olacak: ${totalM3.toFixed(2)}m³`
          );
        }

        // Otomatik fiyat hesapla
        const calculatedPrice = getPriceForM3(customer, m3);
        setFormData((prev) => ({ ...prev, unitPrice: calculatedPrice.toString() }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const customer = customers.find((c) => c.id === formData.customerId);
    if (customer) {
      const m3 = parseFloat(formData.m3Amount);
      const totalM3 = customer.currentM3Used + m3;
      
      if (totalM3 > customer.m3Limit) {
        alert(
          `M3 sınırını aşamazsınız!\nLimit: ${customer.m3Limit}m³\nAl: ${m3}m³\nTopla: ${totalM3.toFixed(2)}m³`
        );
        return;
      }
    }

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
      setWarning('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Sipariş</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {warning && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-md">
                <p className="text-yellow-800 font-semibold">{warning}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Cari
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
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
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  M3 Miktarı
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.m3Amount}
                  onChange={(e) => handleM3Change(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Birim Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="10"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Teslimat Tarihi
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Sipariş Aç
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Açık Siparişler</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Sipariş bulunamadı</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Cari
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    M3
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Birim Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Toplam
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Durum
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
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₺{order.totalPrice.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {order.status}
                      </span>
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
