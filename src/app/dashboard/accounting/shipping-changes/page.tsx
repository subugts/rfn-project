'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ActivityLog {
  id: string;
  orderId: string;
  action: 'DELIVERY_SCHEDULED' | 'DELIVERY_UPDATED' | 'DELIVERY_COMPLETED' | 'DELIVERY_DELAYED';
  description: string;
  changes: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

export default function ShippingChangesPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities?limit=50', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'DELIVERY_SCHEDULED':
        return 'Sevkiyat Planlandı';
      case 'DELIVERY_UPDATED':
        return 'Sevkiyat Güncellendi';
      case 'DELIVERY_COMPLETED':
        return 'Sevkiyat Tamamlandı';
      case 'DELIVERY_DELAYED':
        return 'Sevkiyat Geciktirildi';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DELIVERY_SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERY_UPDATED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERY_COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERY_DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconForAction = (action: string) => {
    switch (action) {
      case 'DELIVERY_SCHEDULED':
        return '📅';
      case 'DELIVERY_UPDATED':
        return '✏️';
      case 'DELIVERY_COMPLETED':
        return '✅';
      case 'DELIVERY_DELAYED':
        return '⚠️';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sevkiyatçı Değişiklikleri</h1>
        <p className="text-gray-600 mt-1">Sevkiyat ekibinin yaptığı tüm değişiklikleri görüntüleyin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Aktivite Listesi */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Yükleniyor...
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Aktivite bulunamadı
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedActivity(activity)}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition border-l-4 border-blue-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {getIconForAction(activity.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(
                            activity.action
                          )}`}
                        >
                          {getActionLabel(activity.action)}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Sevkiyatçı: {activity.createdBy}</span>
                        <span>
                          {new Date(activity.createdAt).toLocaleDateString('tr-TR')}{' '}
                          {new Date(activity.createdAt).toLocaleTimeString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Panel - Detaylar */}
        {selectedActivity && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Değişiklik Detayı</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">İşlem Türü</p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getActionColor(selectedActivity.action)}`}>
                  {getIconForAction(selectedActivity.action)} {getActionLabel(selectedActivity.action)}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Açıklama</p>
                <p className="text-base text-gray-900">{selectedActivity.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Sipariş ID</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200">
                  {selectedActivity.orderId}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Yapılan Değişiklikler</p>

                <div className="space-y-3">
                  {Object.entries(selectedActivity.changes).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase mb-1">{key}</p>
                      <p className="text-sm text-gray-900 font-mono">
                        {typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">Sevkiyatçı</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedActivity.createdBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase mb-1">Tarih & Saat</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedActivity.createdAt).toLocaleDateString('tr-TR')}
                      <br />
                      {new Date(selectedActivity.createdAt).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
