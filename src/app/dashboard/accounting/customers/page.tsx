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
  active: boolean;
  priceRanges: PriceRange[];
}

const createCustomerSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  m3Limit: z.number().positive(),
});

export default function AccountingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    m3Limit: '',
  });
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([
    { minM3: 0, maxM3: 100, unitPrice: 1000 },
  ]);

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

  const handleAddPriceRange = () => {
    const lastRange = priceRanges[priceRanges.length - 1];
    setPriceRanges([
      ...priceRanges,
      { minM3: lastRange.maxM3, maxM3: lastRange.maxM3 + 100, unitPrice: 1000 },
    ]);
  };

  const handleRemovePriceRange = (index: number) => {
    if (priceRanges.length > 1) {
      setPriceRanges(priceRanges.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePriceRange = (index: number, field: string, value: any) => {
    const updated = [...priceRanges];
    const numValue = field === 'unitPrice' ? parseFloat(value) : parseFloat(value);
    updated[index] = { ...updated[index], [field]: numValue };
    setPriceRanges(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        code: formData.code,
        name: formData.name,
        m3Limit: parseFloat(formData.m3Limit),
        priceRanges,
      };

      createCustomerSchema.parse(data);

      await axios.post('/api/customers', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setFormData({ code: '', name: '', m3Limit: '' });
      setPriceRanges([{ minM3: 0, maxM3: 100, unitPrice: 1000 }]);
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Cari oluşturma başarısız oldu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cariler</h1>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Cari</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Cari Kodu
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Cari Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  M3 Sınırı
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.m3Limit}
                  onChange={(e) =>
                    setFormData({ ...formData, m3Limit: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-900">
                  Fiyat Seviyeleri (M3 Aralıkları)
                </h3>
                <button
                  type="button"
                  onClick={handleAddPriceRange}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                >
                  + Seviye Ekle
                </button>
              </div>

              <div className="space-y-3">
                {priceRanges.map((range, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        M3 Başlangıç
                      </label>
                      <input
                        type="number"
                        value={range.minM3 || 0}
                        onChange={(e) =>
                          handleUpdatePriceRange(
                            index,
                            'minM3',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-400 bg-gray-50 rounded-md text-gray-900 font-medium"
                        disabled
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        M3 Bitiş
                      </label>
                      <input
                        type="number"
                        value={range.maxM3 || 0}
                        onChange={(e) =>
                          handleUpdatePriceRange(
                            index,
                            'maxM3',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-400 bg-gray-50 rounded-md text-gray-900 font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Birim Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={range.unitPrice || 0}
                        onChange={(e) =>
                          handleUpdatePriceRange(
                            index,
                            'unitPrice',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-400 bg-gray-50 rounded-md text-gray-900 font-medium"
                      />
                    </div>
                    {priceRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePriceRange(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Cari Aç
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cariler Listesi</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
          ) : customers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Cari bulunamadı</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Adı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fiyat Seviyeleri
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    M3 Kullanımı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {customer.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        {customer.priceRanges.map((range, idx) => (
                          <div key={idx} className="text-xs">
                            {range.minM3}-{range.maxM3}m³: ₺{range.unitPrice}
                          </div>
                        ))}
                      </div>
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
