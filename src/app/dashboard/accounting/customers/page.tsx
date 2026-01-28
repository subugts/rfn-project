'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson?: string | null;
  billingAddress?: string | null;
  officeAddress?: string | null;
  active: boolean;
}

export default function AccountingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    billingAddress: '',
    officeAddress: '',
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
        contactPerson: formData.contactPerson || undefined,
        billingAddress: formData.billingAddress || undefined,
        officeAddress: formData.officeAddress || undefined,
      };

      await axios.post('/api/customers', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setFormData({ code: '', name: '', contactPerson: '', billingAddress: '', officeAddress: '' });
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Cari Kodu *
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
                  Cari Adı *
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
                  Yetkili Adı Soyadı
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Fatura Adresi
                </label>
                <input
                  type="text"
                  value={formData.billingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, billingAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Ofis / İş Merkezi Adresi
                </label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, officeAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                />
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
                    Yetkili
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fatura Adresi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ofis Adresi
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
                      {customer.contactPerson || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.billingAddress ? (
                        <div className="max-w-xs truncate" title={customer.billingAddress}>
                          {customer.billingAddress}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.officeAddress ? (
                        <div className="max-w-xs truncate" title={customer.officeAddress}>
                          {customer.officeAddress}
                        </div>
                      ) : (
                        '-'
                      )}
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
