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

export default function AccountingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [warning, setWarning] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    contractId: '',
    m3Amount: '',
    unitPrice: '',
    deliveryDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, contractsRes] = await Promise.all([
        axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/contracts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      setOrders(ordersRes.data);
      setContracts(contractsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceForM3 = (contract: Contract, m3: number): number => {
    for (const range of contract.priceRanges) {
      if (m3 >= range.minM3 && m3 < range.maxM3) {
        return range.unitPrice;
      }
    }
    const lastRange = contract.priceRanges[contract.priceRanges.length - 1];
    if (m3 >= lastRange.minM3) {
      return lastRange.unitPrice;
    }
    return contract.priceRanges[0].unitPrice;
  };

  const handleContractChange = (contractId: string) => {
    setFormData({ ...formData, contractId });
    setWarning('');

    if (contractId) {
      const contract = contracts.find((c) => c.id === contractId);
      setSelectedContract(contract || null);
    } else {
      setSelectedContract(null);
    }
  };

  const handleM3Change = (m3Str: string) => {
    const m3 = parseFloat(m3Str);
    setFormData({ ...formData, m3Amount: m3Str });
    setWarning('');

    if (selectedContract && m3) {
      const totalM3 = selectedContract.currentM3Used + m3;
      if (totalM3 > selectedContract.m3Limit) {
        setWarning(
          `⚠️ UYARI: M3 sınırını aşacaksınız! Limit: ${selectedContract.m3Limit}m³, Toplam olacak: ${totalM3.toFixed(2)}m³`
        );
      }

      const calculatedPrice = getPriceForM3(selectedContract, m3);
      setFormData((prev) => ({ ...prev, unitPrice: calculatedPrice.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedContract) {
      const m3 = parseFloat(formData.m3Amount);
      const totalM3 = selectedContract.currentM3Used + m3;

      if (totalM3 > selectedContract.m3Limit) {
        alert(
          `M3 sınırını aşamazsınız!\nLimit: ${selectedContract.m3Limit}m³\nAl: ${m3}m³\nTopla: ${totalM3.toFixed(2)}m³`
        );
        return;
      }
    }

    try {
      const data = {
        contractId: formData.contractId,
        customerId: selectedContract?.customerId,
        m3Amount: parseFloat(formData.m3Amount),
        unitPrice: parseFloat(formData.unitPrice),
        deliveryDate: formData.deliveryDate || undefined,
      };

      const response = await axios.post('/api/orders', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setOrders([response.data, ...orders]);
      setFormData({
        contractId: '',
        m3Amount: '',
        unitPrice: '',
        deliveryDate: '',
      });
      setSelectedContract(null);
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
                  Sözleşme / Şantiye *
                </label>
                <select
                  value={formData.contractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.siteCode} - {contract.siteName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  M3 Miktarı *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.m3Amount}
                  onChange={(e) => handleM3Change(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-400 bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                  required
                  disabled={!selectedContract}
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
                  disabled={!selectedContract}
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

            {selectedContract && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Seçili Sözleşme:</span> {selectedContract.siteName}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">M3 Limiti:</span> {selectedContract.currentM3Used} / {selectedContract.m3Limit} m³
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              disabled={!selectedContract}
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
