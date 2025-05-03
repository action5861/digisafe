'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  relation: string | null;
  accessFiles: Record<string, string> | null;
  conditions: {
    type: 'inactivity' | 'date' | 'none';
    days?: number;
    date?: string;
  } | null;
  createdAt: string;
}

export default function ContactDetailPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  
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

  // 연락처 정보 가져오기
  const fetchContact = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/contacts/${contactId}`);
      
      if (!response.ok) {
        throw new Error('연락처 정보를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setContact(data.contact);
      
      // 폼 초기화
      setName(data.contact.name);
      setEmail(data.contact.email);
      setPhoneNumber(data.contact.phoneNumber || '');
      setRelation(data.contact.relation || '');
    } catch (error) {
      console.error('Error fetching contact:', error);
      setError(error instanceof Error ? error.message : '연락처 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 연락처 정보 가져오기
  useEffect(() => {
    if (status === 'authenticated' && contactId) {
      fetchContact();
    }
  }, [status, contactId]);

  // 연락처 수정
  const handleUpdateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!name || !email) {
      setFormError('이름과 이메일은 필수 항목입니다.');
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError('');
      
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
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
        throw new Error(data.error || '연락처 수정 중 오류가 발생했습니다.');
      }
      
      // 연락처 정보 갱신
      setContact(data.contact);
      
      // 편집 모드 종료
      setEditing(false);
    } catch (error) {
      console.error('Error updating contact:', error);
      setFormError(error instanceof Error ? error.message : '연락처 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">연락처 상세</h1>
            <div>
              <Link
                href="/contacts"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2"
              >
                목록으로
              </Link>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  수정
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md">
              {error}
              <button 
                onClick={fetchContact}
                className="ml-2 underline"
              >
                다시 시도
              </button>
            </div>
          )}
          
          {contact && !editing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">이름</h3>
                  <p className="text-lg font-medium">{contact.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">이메일</h3>
                  <p className="text-lg">{contact.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">전화번호</h3>
                  <p className="text-lg">{contact.phoneNumber || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">관계</h3>
                  <p className="text-lg">{contact.relation || '-'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">접근 권한 설정</h3>
                
                {contact.accessFiles && Object.keys(contact.accessFiles).length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">접근 가능한 파일</h4>
                    <ul className="list-disc pl-5 text-gray-700">
                      {Object.entries(contact.accessFiles).map(([fileId, fileName]) => (
                        <li key={fileId}>{fileName}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">아직 접근 권한이 설정된 파일이 없습니다.</p>
                )}
                
                <Link 
                  href={`/contacts/${contactId}/access`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  접근 권한 관리
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">접근 조건 설정</h3>
                
                {contact.conditions ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">접근 조건</h4>
                      <p className="text-gray-700">
                        {contact.conditions.type === 'inactivity' 
                          ? `${contact.conditions.days}일 동안 로그인하지 않은 경우` 
                          : contact.conditions.type === 'date' && contact.conditions.date
                            ? `${new Date(contact.conditions.date).toLocaleDateString()}에 자동으로 접근 권한 부여`
                            : '조건 없음'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">아직 접근 조건이 설정되지 않았습니다.</p>
                )}
                
                <Link 
                  href={`/contacts/${contactId}/conditions`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  접근 조건 관리
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateContact}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관계
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">선택하세요</option>
                    <option value="가족">가족</option>
                    <option value="친구">친구</option>
                    <option value="변호사">변호사</option>
                    <option value="의사">의사</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
              
              {formError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 