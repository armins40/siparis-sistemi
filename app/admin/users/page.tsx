'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin';
import { SECTORS, getSectorLabel, getSectorIcon } from '@/lib/sectors';
import type { User, Sector } from '@/lib/types';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    plan: 'free' as User['plan'],
    isActive: true,
    sector: '' as Sector | '',
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      console.warn('⚠️ Admin not authenticated');
      return;
    }
    loadUsers();
    
    // URL'de action=create varsa modal aç
    if (searchParams.get('action') === 'create') {
      setShowModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Loading users from API...');
      
      // Fetch users from database via API
      const response = await fetch('/api/admin/users');
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API responded with status ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('📦 API Result:', { 
        success: result.success, 
        userCount: result.users?.length || 0,
        hasUsers: !!result.users,
        isArray: Array.isArray(result.users),
        resultKeys: Object.keys(result)
      });
      
      if (result.success) {
        if (Array.isArray(result.users)) {
          console.log(`✅ Setting ${result.users.length} users to state`);
          console.log('📋 Users data sample:', result.users.slice(0, 2));
          console.log('📋 Full users array:', result.users);
          
          // Force state update with a new array reference
          const usersArray = [...result.users];
          setUsers(usersArray);
          
          // Verify state was set
          setTimeout(() => {
            console.log('🔍 State after update (check):', usersArray.length, 'users');
          }, 100);
          
          console.log(`✅ State updated with ${result.users.length} users`);
        } else if (result.users === undefined || result.users === null) {
          console.warn('⚠️ API returned success but users is undefined/null');
          setUsers([]);
        } else {
          console.error('❌ API returned users but it is not an array:', typeof result.users, result.users);
          setUsers([]);
        }
      } else {
        throw new Error(result.error || 'Users could not be loaded');
      }
    } catch (error: any) {
      console.error('❌ Error loading users from API:', error);
      const errorMessage = error?.message || 'Kullanıcılar yüklenirken bir hata oluştu';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email veya telefon zorunlu
    if (!formData.email && !formData.phone) {
      setError('E-posta veya telefon numarası girilmesi zorunludur');
      return;
    }

    // Email kontrolü - database'den kontrol et
    if (formData.email) {
      const existingUser = users.find(u => 
        u.email?.toLowerCase() === formData.email.toLowerCase() && 
        (!editingUser || u.id !== editingUser.id)
      );
      if (existingUser) {
        setError('Bu e-posta adresi zaten kullanılıyor');
        return;
      }
    }

    // Telefon kontrolü - database'den kontrol et
    if (formData.phone) {
      const existingUser = users.find(u => 
        u.phone === formData.phone && 
        (!editingUser || u.id !== editingUser.id)
      );
      if (existingUser) {
        setError('Bu telefon numarası zaten kullanılıyor');
        return;
      }
    }

    try {
      if (editingUser) {
        // Güncelleme - sadece database'e kaydet
        const updates = {
          ...formData,
          sector: formData.sector || undefined, // Empty string -> undefined
        };
        
        const response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: editingUser.id,
            updates: updates,
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          setError(result.error || 'Kullanıcı güncellenirken bir hata oluştu');
          return;
        }
      } else {
        // Yeni kullanıcı - önce ID oluştur
        const now = new Date();
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() + 7);
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          ...formData,
          sector: formData.sector || undefined,
          createdAt: now.toISOString(),
          emailVerified: false,
          phoneVerified: false,
          expiresAt: formData.plan === 'trial' ? trialEnd.toISOString() : undefined,
        };
        
        // Database'e kaydet
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: newUser,
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          setError(result.error || 'Kullanıcı oluşturulurken bir hata oluştu');
          return;
        }
      }
      
      await loadUsers();
      handleCloseModal();
      setError('');
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err?.message || 'Bir hata oluştu');
    }
  };

  const [editLoading, setEditLoading] = useState(false);

  const handleEdit = async (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      phone: user.phone || '',
      name: user.name || '',
      plan: user.plan,
      isActive: user.isActive,
      sector: user.sector || '',
    });
    setShowModal(true);
    setError('');
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user as User;
        setFormData({
          email: u.email || '',
          phone: u.phone || '',
          name: u.name || '',
          plan: u.plan,
          isActive: u.isActive,
          sector: (u.sector as Sector) || '',
        });
        setEditingUser(u);
      }
    } catch {
      // API hatasında listedeki veri zaten formda
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || user?.email || user?.storeSlug || userId;
    
    if (!confirm(`⚠️ DİKKAT: "${userName}" kullanıcısını ve TÜM VERİLERİNİ (ürünler, mağaza, siparişler) tamamen silmek istediğinize emin misiniz?\n\nBu işlem GERİ ALINAMAZ ve kullanıcının tüm verileri kalıcı olarak silinecektir!`)) {
      return;
    }
    
    // İkinci onay
    if (!confirm('Son bir kez daha onaylıyor musunuz? Bu işlem geri alınamaz!')) {
      return;
    }
    
    try {
      // Delete from database (CASCADE will delete related data)
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Kullanıcı silinirken bir hata oluştu'}`);
        return;
      }
      
      alert(`✅ "${userName}" kullanıcısı ve tüm verileri başarıyla silindi.`);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Kullanıcı silinirken bir hata oluştu.');
    }
  };

  const handleToggleBlacklist = async (user: User) => {
    const action = user.isActive ? 'kara listeye almak' : 'kara listeden çıkarmak';
    const userName = user.name || user.email || user.storeSlug || user.id;
    
    if (!confirm(`"${userName}" kullanıcısını ${action} istediğinize emin misiniz?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          updates: {
            isActive: !user.isActive,
          },
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`❌ Hata: ${result.error || 'Kullanıcı durumu güncellenemedi'}`);
        return;
      }
      
      alert(`✅ Kullanıcı ${user.isActive ? 'kara listeye alındı' : 'kara listeden çıkarıldı'}.`);
      await loadUsers();
    } catch (error) {
      console.error('Error toggling blacklist:', error);
      alert('❌ Kullanıcı durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setEditLoading(false);
    setFormData({
      email: '',
      phone: '',
      name: '',
      plan: 'free',
      isActive: true,
      sector: '',
    });
    setError('');
  };

  const filteredUsers = React.useMemo(() => {
    console.log('🔄 Computing filteredUsers, users.length:', users.length, 'searchQuery:', searchQuery);
    const filtered = users.filter(user => {
      if (!user || !user.id) {
        console.warn('⚠️ Invalid user in array:', user);
        return false;
      }
      const query = searchQuery.toLowerCase();
      if (!query) return true; // If no search query, show all users
      return (
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.storeSlug?.toLowerCase().includes(query) ||
        user.id?.toLowerCase().includes(query)
      );
    });
    console.log('✅ Filtered users result:', filtered.length, filtered);
    return filtered;
  }, [users, searchQuery]);

  // Debug: Log users and filteredUsers
  useEffect(() => {
    console.log('👥 Users state changed:', users.length, 'users');
    console.log('📋 Users array:', users);
    console.log('🔍 Filtered users:', filteredUsers.length, filteredUsers);
    console.log('🔎 Search query:', searchQuery);
  }, [users, filteredUsers, searchQuery]);

  const getPlanLabel = (plan: User['plan']) => {
    const labels: Record<User['plan'], string> = {
      free: 'Ücretsiz',
      trial: '7 Günlük Deneme',
      monthly: '1 Aylık',
      '6month': '6 Aylık',
      yearly: 'Yıllık',
    };
    return labels[plan];
  };

  const isTrialExpired = (user: User): boolean => {
    if (user.plan !== 'trial') return false;
    if (!user.expiresAt) return true; // expiresAt yoksa deneme bitmiş say
    return new Date(user.expiresAt) <= new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600 mt-1">Kullanıcıları görüntüleyin, ekleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          ➕ Yeni Kullanıcı Ekle
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <label htmlFor="admin-user-search" className="sr-only">
          Kullanıcı ara
        </label>
        <input
          type="text"
          id="admin-user-search"
          name="admin-user-search"
          placeholder="E-posta, telefon veya isim ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">❌ {error}</p>
              <button
                onClick={loadUsers}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Yeniden Dene
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz kullanıcı yok'}
                    </td>
                  </tr>
                ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.email || user.storeSlug || user.id || 'İsimsiz'}
                      </div>
                      {user.storeSlug && (
                        <div className="text-xs text-gray-500 mt-1">
                          Slug: {user.storeSlug}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.email || user.phone ? (
                        <>
                          <div className="text-sm text-gray-900">
                            E-posta: {user.email || '—'}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            Tel: {user.phone || '—'}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-amber-600">
                          İletişim bilgisi yok — Düzenle&apos;den ekleyebilirsiniz.
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.plan === 'free' 
                          ? 'bg-gray-100 text-gray-800'
                          : user.plan === 'trial'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getPlanLabel(user.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isTrialExpired(user) ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          Deneme Bitti
                        </span>
                      ) : !user.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Kara Liste
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                            title="Kullanıcıyı düzenle"
                          >
                            ✏️ Düzenle
                          </button>
                          <button
                            onClick={() => handleToggleBlacklist(user)}
                            className={`px-3 py-1 rounded transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Kara listeye al' : 'Kara listeden çıkar'}
                          >
                            {user.isActive ? '🚫 Kara Liste' : '✅ Aktif Et'}
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors w-full text-left"
                          title="Kullanıcıyı ve tüm verilerini tamamen sil"
                        >
                          🗑️ Tamamen Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {editLoading && editingUser && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                Kullanıcı bilgileri yükleniyor…
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-user-name" className="block text-sm font-medium text-gray-700 mb-2">
                  İsim (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="admin-user-name"
                  name="admin-user-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={editLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="admin-user-email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="admin-user-email"
                  name="admin-user-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={editLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:bg-gray-50"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="admin-user-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  id="admin-user-phone"
                  name="admin-user-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={editLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:bg-gray-50"
                  placeholder="05XX XXX XX XX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * En az birisi (e-posta veya telefon) girilmelidir
                </p>
              </div>

              <div>
                <label htmlFor="admin-user-plan" className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  id="admin-user-plan"
                  name="admin-user-plan"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as User['plan'] })}
                  disabled={editLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:bg-gray-50"
                >
                  <option value="free">Ücretsiz</option>
                  <option value="trial">7 Günlük Deneme</option>
                  <option value="monthly">1 Aylık</option>
                  <option value="6month">6 Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>

              <div>
                <label htmlFor="admin-user-sector" className="block text-sm font-medium text-gray-700 mb-2">
                  Sektör
                </label>
                <select
                  id="admin-user-sector"
                  name="admin-user-sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                  disabled={editLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:bg-gray-50"
                >
                  <option value="">Sektör Seçin</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.icon} {sector.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Kullanıcının sektörünü değiştirebilirsiniz. Bu, kullanıcının göreceği admin ürünlerini etkiler.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="admin-user-isActive"
                  name="admin-user-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={editLoading}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-60"
                />
                <label htmlFor="admin-user-isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Yükleniyor…' : editingUser ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
