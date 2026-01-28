export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Açık Siparişler</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Üretimde</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Teslimat Bekleniyor</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tamamlanan</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Son Siparişler
          </h3>
          <p className="text-gray-500">Henüz sipariş yok</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            İstatistikler
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam M3:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Ciro:</span>
              <span className="font-semibold">₺0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
