'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserAsync } from '@/lib/auth';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Mevcut kullanıcıyı al ve URL'de user ID ile redirect et
    getCurrentUserAsync().then((user) => {
      if (user && user.id) {
        router.replace(`/dashboard/${user.id}`);
      } else {
        // Kullanıcı yoksa login'e yönlendir
        router.replace('/login');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Yönlendiriliyor...</p>
    </div>
  );
}
