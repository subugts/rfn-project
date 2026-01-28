'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; code: string };
  m3Amount: number;
  totalPrice: number;
  status: string;
  deliveryDate: string;
}

interface DeliveryLog {
  id: string;
  orderId: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
  scheduledDate: string;
  actualDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DeliveryCalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDelivery, setOrderDelivery] = useState<DeliveryLog | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, deliveriesRes] = await Promise.all([
        axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        axios.get('/api/deliveries', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      setOrders(ordersRes.data);
      setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryForOrder = (orderId: string) => {
    return deliveries.find((d) => d.orderId === orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planlandı';
      case 'IN_TRANSIT':
        return 'Yolda';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'DELAYED':
        return 'Gecikmiş';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sevkiyat Takvimi</h1>
        <p className="text-gray-600 mt-1">Siparişlerin sevkiyat durumlarını takip edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Siparişler */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
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
                      Planlanan Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const delivery = getDeliveryForOrder(order.id);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderDelivery(delivery || null);
                        }}
                        className="hover:bg-blue-50 cursor-pointer transition"
                      >
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
                          {delivery?.scheduledDate
                            ? new Date(delivery.scheduledDate).toLocaleDateString('tr-TR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              delivery ? getStatusColor(delivery.status) : 'bg-gray-100'
                            }`}
                          >
                            {delivery ? getStatusLabel(delivery.status) : 'Beklemede'}
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

        {/* Sağ Panel - Seçili Siparişin Detayı */}
        {selectedOrder && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sipariş Detayı</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Sipariş No</p>
                <p className="text-lg font-semibold text-gray-900">{selectedOrder.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Müşteri</p>
                <p className="text-lg font-semibold text-gray-900">{selectedOrder.customer.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customer.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">M3 Miktarı</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.m3Amount} m³</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Fiyat</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₺{selectedOrder.totalPrice.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {orderDelivery ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Sevkiyat Bilgisi</h3>

                    <div>
                      <p className="text-sm text-gray-600">Durum</p>
                      <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(orderDelivery.status)} mt-1`}>
                        {getStatusLabel(orderDelivery.status)}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Planlanan Tarih</p>
                      <p className="text-base text-gray-900">
                        {new Date(orderDelivery.scheduledDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>

                    {orderDelivery.actualDate && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Gerçek Teslim Tarihi</p>
                        <p className="text-base text-gray-900">
                          {new Date(orderDelivery.actualDate).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}

                    {orderDelivery.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Notlar</p>
                        <p className="text-sm text-gray-900">{orderDelivery.notes}</p>
                      </div>
                    )}

                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        Son güncelleme: {new Date(orderDelivery.updatedAt).toLocaleDateString('tr-TR')} {new Date(orderDelivery.updatedAt).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Bu sipariş için henüz sevkiyat planlaması yapılmamış.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
