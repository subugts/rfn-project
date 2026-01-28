'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';

interface Customer {
  id: string;
  code: string;
  name: string;
  defaultUnitPrice: number;
  m3Limit: number;
  currentM3Used: number;
  active: boolean;
}

const createCustomerSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  defaultUnitPrice: z.number().positive(),
  m3Limit: z.number().positive(),
});

export default function AccountingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    defaultUnitPrice: '',
    m3Limit: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        code: formData.code,
        name: formData.name,
        defaultUnitPrice: parseFloat(formData.defaultUnitPrice),
        m3Limit: parseFloat(formData.m3Limit),
      };

      createCustomerSchema.parse(data);

      await axios.post('/api/customers', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setFormData({ code: '', name: '', defaultUnitPrice: '', m3Limit: '' });
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cariler</h1>
          <p className="text-gray-600 mt-1">Müşteri yönetimi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          {showForm ? 'İptal' : '+ Yeni Cari Aç'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Yeni Cari</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Kodu
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  value={formData.defaultUnitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultUnitPrice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M3 Sınırı
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.m3Limit}
                  onChange={(e) =>
                    setFormData({ ...formData, m3Limit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Cari Aç
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Cariler Listesi</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Cari bulunamadı</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Adı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Birim Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    M3 Kullanımı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {customer.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₺{customer.defaultUnitPrice}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.currentM3Used} / {customer.m3Limit} m³
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.active ? 'Aktif' : 'Pasif'}
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
