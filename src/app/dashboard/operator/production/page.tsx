'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string };
  m3Amount: number;
  status: string;
  productionPlan?: {
    m3Completed: number;
  };
}

interface Comment {
  orderId: string;
  content: string;
  commentType: string;
}

export default function OperatorProductionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders?status=PRODUCTION', {
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder || !comment.trim()) return;

    try {
      await axios.post(
        `/api/orders/${selectedOrder.id}/comments`,
        {
          content: comment,
          commentType: 'NOTE',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setComment('');
      // Refresh orders
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Üretim Takibi</h1>
        <p className="text-gray-600 mt-1">Açık siparişleri görüntüleyin ve yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Üretimde Olan Siparişler</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Yükleniyor...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Sipariş bulunamadı</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="font-semibold text-gray-800">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">{order.customer.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.m3Amount} m³
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedOrder.customer.name}
                </p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Planlanan M3</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedOrder.m3Amount} m³
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Üretilen M3</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedOrder.productionPlan?.m3Completed || 0} m³
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">İlerleme</span>
                    <span className="font-semibold text-gray-800">
                      {Math.round(
                        ((selectedOrder.productionPlan?.m3Completed || 0) /
                          selectedOrder.m3Amount) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((selectedOrder.productionPlan?.m3Completed || 0) /
                            selectedOrder.m3Amount) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Notlar & Öneriler
                </h4>

                <form onSubmit={handleAddComment} className="space-y-3 mb-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Not veya öneri yazınız..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                  >
                    Notu Ekle
                  </button>
                </form>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Henüz not eklenmemiş
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Detayları görmek için bir sipariş seçin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
