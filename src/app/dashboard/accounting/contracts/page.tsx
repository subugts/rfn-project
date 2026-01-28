'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface PriceRange {
  minM3: number;
  maxM3: number;
  unitPrice: number;
}

interface Contract {
  id: string;
  customerId: string;
  siteCode: string;
  siteName: string;
  m3Limit: number;
  currentM3Used: number;
  priceRanges: PriceRange[];
  startDate: string;
  endDate: string | null;
  active: boolean;
  description?: string | null;
}

interface Customer {
  id: string;
  code: string;
  name: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    siteCode: '',
    siteName: '',
    m3Limit: '',
    endDate: '',
    description: '',
  });
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([
    { minM3: 0, maxM3: 100, unitPrice: 1000 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contractsRes, customersRes] = await Promise.all([
        axios.get('/api/contracts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/customers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      setContracts(contractsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
        customerId: formData.customerId,
        siteCode: formData.siteCode,
        siteName: formData.siteName,
        m3Limit: parseFloat(formData.m3Limit),
        priceRanges,
        endDate: formData.endDate || undefined,
        description: formData.description || undefined,
      };

      const response = await axios.post('/api/contracts', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setContracts([response.data, ...contracts]);
      setFormData({
        customerId: '',
        siteCode: '',
        siteName: '',
        m3Limit: '',
        endDate: '',
        description: '',
      });
      setPriceRanges([{ minM3: 0, maxM3: 100, unitPrice: 1000 }]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create contract:', error);
      alert('Sözleşme oluşturma başarısız oldu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sözleşmeler</h1>
          <p className="text-gray-600 mt-1">Şantiye ve fiyat yönetimi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
        >
          {showForm ? 'İptal' : '+ Yeni Sözleşme'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Sözleşme</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Cari *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
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
                  Şantiye Kodu *
                </label>
                <input
                  type="text"
                  value={formData.siteCode}
                  onChange={(e) =>
                    setFormData({ ...formData, siteCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Şantiye Adı *
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  M3 Sınırı *
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

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Sözleşme Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  rows={3}
                  placeholder="Sözleşmeye ilişkin açıklamalar, notlar, özel şartlar vb..."
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
                          handleUpdatePriceRange(index, 'minM3', e.target.value)
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
                          handleUpdatePriceRange(index, 'maxM3', e.target.value)
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
                          handleUpdatePriceRange(index, 'unitPrice', e.target.value)
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
              Sözleşme Oluştur
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sözleşme Listesi</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
          ) : contracts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Sözleşme bulunamadı</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Cari
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Şantiye Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Şantiye Adı
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    M3 Limiti
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fiyat Aralıkları
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map((contract) => {
                  const customer = customers.find(
                    (c) => c.id === contract.customerId
                  );
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {customer?.code} - {customer?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {contract.siteCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {contract.siteName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {contract.description ? (
                          <div className="max-w-xs truncate" title={contract.description}>
                            {contract.description}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {contract.currentM3Used} / {contract.m3Limit} m³
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="space-y-1">
                          {contract.priceRanges.map((range, idx) => (
                            <div key={idx} className="text-xs">
                              {range.minM3}-{range.maxM3}m³: ₺{range.unitPrice}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            contract.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {contract.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
