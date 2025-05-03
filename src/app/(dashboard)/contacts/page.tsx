'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/sidebar';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  relation: string | null;
  accessFiles: any | null;
  conditions: any | null;
  createdAt: string;
}

export default function ContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 폼 상태
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relation, setRelation] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 연락처 목록 가져오기
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        throw new Error('연락처 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : '연락처 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 연락처 목록 가져오기
  useEffect(() => {
    if (status === 'authenticated') {
      fetchContacts();
    }
  }, [status]);

  // 연락처 추가
  const handleAddContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!name || !email) {
      setFormError('이름과 이메일은 필수 항목입니다.');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError('');
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber: phoneNumber || null,
          relation: relation || null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '연락처 등록 중 오류가 발생했습니다.');
      }
      
      // 폼 초기화
      setName('');
      setEmail('');
      setPhoneNumber('');
      setRelation('');
      
      // 모달 닫기
      setShowAddModal(false);
      
      // 연락처 목록 새로고침
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      setFormError(error instanceof Error ? error.message : '연락처 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 연락처 삭제
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('정말로 이 연락처를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '연락처 삭제 중 오류가 발생했습니다.');
      }
      
      // 연락처 목록 새로고침
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert(error instanceof Error ? error.message : '연락처 삭제 중 오류가 발생했습니다.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${plusJakartaSans.className}`}>
      <Sidebar />
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-2xl font-bold text-gray-900 ${inter.className}`}>신뢰할 수 있는 연락처</h1>
                <p className="mt-1 text-sm text-gray-500">
                  위급 상황에 대비하여 신뢰할 수 있는 연락처를 관리하세요.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                연락처 추가
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  <button 
                    onClick={fetchContacts}
                    className="mt-1 text-sm text-red-700 hover:text-red-600 underline"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 연락처 목록 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className={`mt-2 text-sm font-medium text-gray-900 ${inter.className}`}>연락처가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">
                  신뢰할 수 있는 연락처를 추가하여 위급 상황에 대비하세요.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    연락처 추가
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${inter.className}`}>
                        이름
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${inter.className}`}>
                        이메일
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${inter.className}`}>
                        전화번호
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${inter.className}`}>
                        관계
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${inter.className}`}>
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className={`text-blue-600 font-medium ${inter.className}`}>
                                  {contact.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium text-gray-900 ${inter.className}`}>{contact.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{contact.phoneNumber || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 ${inter.className}`}>
                            {contact.relation || '미지정'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              상세보기
                            </Link>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* 연락처 추가 모달 */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold text-gray-900 ${inter.className}`}>연락처 추가</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleAddContact}>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${inter.className}`}>
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${inter.className}`}>
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${inter.className}`}>
                      전화번호
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${inter.className}`}>
                      관계
                    </label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="가족">가족</option>
                      <option value="친구">친구</option>
                      <option value="변호사">변호사</option>
                      <option value="의사">의사</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  
                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {formError}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {submitting ? '처리 중...' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 