'use client';

import { useState, useEffect } from 'react';
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconFilter,
} from '@tabler/icons-react';
import UserDetailModal from '@/components/admin/UserDetailModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  subscription?: {
    status: string;
    plan: {
      name: string;
    };
  } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&role=${selectedRole}&search=${searchTerm}`
      );
      
      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Users fetch error:', error);
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('역할 변경에 실패했습니다');
      }

      // 사용자 목록 새로고침
      fetchUsers();
    } catch (error) {
      console.error('Role change error:', error);
      alert('역할 변경 중 오류가 발생했습니다.');
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('사용자 삭제에 실패했습니다');
      }

      // 사용자 목록 새로고침
      fetchUsers();
    } catch (error) {
      console.error('User delete error:', error);
      alert('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <div className="flex space-x-4">
          {/* 검색 */}
          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색"
              className="border-none focus:ring-0 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <IconSearch className="w-5 h-5" />
            </button>
          </div>

          {/* 필터 */}
          <select
            className="bg-white rounded-lg px-3 py-2 shadow-sm text-sm"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="all">모든 역할</option>
            <option value="user">일반 사용자</option>
            <option value="admin">관리자</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 사용자 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                역할
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                구독 상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? '관리자' : '사용자'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.subscription?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.subscription?.status === 'active' 
                      ? `${user.subscription.plan.name} (활성)` 
                      : '구독 없음'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUserDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 사용자 상세 정보 모달 */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleUserRoleChange}
          onDelete={handleUserDelete}
        />
      )}
    </div>
  );
} 