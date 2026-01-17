'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByPhone,
  isAdminAuthenticated,
} from '@/lib/admin';
import type { User } from '@/lib/types';

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
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) return;
    loadUsers();
    
    // URL'de action=create varsa modal aç
    if (searchParams.get('action') === 'create') {
      setShowModal(true);
    }
  }, [searchParams]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email veya telefon zorunlu
    if (!formData.email && !formData.phone) {
      setError('E-posta veya telefon numarası girilmesi zorunludur');
      return;
    }

    // Email kontrolü
    if (formData.email) {
      const existingUser = getUserByEmail(formData.email);
      if (existingUser && (!editingUser || existingUser.id !== editingUser.id)) {
        setError('Bu e-posta adresi zaten kullanılıyor');
        return;
      }
    }

    // Telefon kontrolü
    if (formData.phone) {
      const existingUser = getUserByPhone(formData.phone);
      if (existingUser && (!editingUser || existingUser.id !== editingUser.id)) {
        setError('Bu telefon numarası zaten kullanılıyor');
        return;
      }
    }

    try {
      if (editingUser) {
        // Güncelleme
        updateUser(editingUser.id, formData);
      } else {
        // Yeni kullanıcı
        createUser(formData);
      }
      
      loadUsers();
      handleCloseModal();
      setError('');
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      phone: user.phone || '',
      name: user.name || '',
      plan: user.plan,
      isActive: user.isActive,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      deleteUser(userId);
      loadUsers();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: '',
      phone: '',
      name: '',
      plan: 'free',
      isActive: true,
    });
    setError('');
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query)
    );
  });

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
                        {user.name || 'İsimsiz'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || '-'}</div>
                      <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getPlanLabel(user.plan)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        ✏️ Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="free">Ücretsiz</option>
                  <option value="trial">7 Günlük Deneme</option>
                  <option value="monthly">1 Aylık</option>
                  <option value="6month">6 Aylık</option>
                  <option value="yearly">Yıllık</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="admin-user-isActive"
                  name="admin-user-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="admin-user-isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {editingUser ? 'Güncelle' : 'Ekle'}
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
