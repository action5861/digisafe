import { useState } from 'react';
import {
  IconX,
  IconEdit,
  IconTrash,
  IconUser,
  IconMail,
  IconCalendar,
  IconShield,
  IconSubscript,
} from '@tabler/icons-react';

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

interface Props {
  user: User | null;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onDelete: (userId: string) => void;
}

export default function UserDetailModal({ user, onClose, onRoleChange, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState(user?.role || 'user');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleRoleChange = async () => {
    await onRoleChange(user.id, newRole);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      await onDelete(user.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">사용자 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <IconUser className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center">
              <IconMail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <IconCalendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">가입일</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <IconShield className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">역할</p>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="user">일반 사용자</option>
                      <option value="admin">관리자</option>
                    </select>
                    <button
                      onClick={handleRoleChange}
                      className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2 py-1 border text-sm rounded hover:bg-gray-50"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? '관리자' : '일반 사용자'}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <IconSubscript className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">구독 상태</p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.subscription?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.subscription?.status === 'active'
                    ? `${user.subscription.plan.name} (활성)`
                    : '구독 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 작업 버튼 */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-800"
            >
              <IconTrash className="w-5 h-5 mr-1" />
              사용자 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 