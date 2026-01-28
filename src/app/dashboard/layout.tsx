'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const menuItems = {
    SHIPPING: [
      { label: 'Siparişler', href: '/dashboard/shipping/orders' },
      { label: 'Teslimatlar', href: '/dashboard/shipping/deliveries' },
      { label: 'Takvim', href: '/dashboard/shipping/calendar' },
      { label: 'Arvento Takip', href: '/dashboard/shipping/arvento' },
    ],
    ACCOUNTING: [
      { label: 'Siparişler', href: '/dashboard/accounting/orders' },
      { label: 'Cariler', href: '/dashboard/accounting/customers' },
      { label: 'Sözleşmeler', href: '/dashboard/accounting/contracts' },
      { label: 'Sevkiyat Takvimi', href: '/dashboard/accounting/deliveries' },
      { label: 'Sevkiyatçı Değişiklikleri', href: '/dashboard/accounting/shipping-changes' },
      { label: 'Fiyatlandırma', href: '/dashboard/accounting/pricing' },
    ],
    OPERATOR: [
      { label: 'Siparişler', href: '/dashboard/operator/orders' },
      { label: 'Üretim', href: '/dashboard/operator/production' },
      { label: 'Yorumlar', href: '/dashboard/operator/comments' },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Kullanıcılar', href: '/dashboard/admin/users' },
      { label: 'Queue Yönetimi', href: '/dashboard/admin/queue' },
      { label: 'Ayarlar', href: '/dashboard/admin/settings' },
    ],
  };

  const currentMenu = user ? menuItems[user.role as keyof typeof menuItems] || [] : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-xs'}`}>
            {sidebarOpen ? 'Morina' : 'M'}
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {currentMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded hover:bg-gray-800 transition duration-200 text-sm truncate"
            >
              {sidebarOpen ? item.label : item.label.charAt(0)}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-3 py-2 text-sm hover:bg-gray-800 rounded transition duration-200"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm hover:bg-red-600 rounded transition duration-200"
          >
            {sidebarOpen ? 'Çıkış' : 'X'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Morina Software
          </h2>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {user.role}
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
