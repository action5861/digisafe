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

type ConditionType = 'none' | 'inactivity' | 'date';

export default function ContactConditionsPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [conditionType, setConditionType] = useState<ConditionType>('none');
  const [inactivityDays, setInactivityDays] = useState('30');
  const [specificDate, setSpecificDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      
      // 현재 조건 설정
      if (data.contact.conditions) {
        const conditions = data.contact.conditions;
        
        if (conditions.type === 'inactivity') {
          setConditionType('inactivity');
          setInactivityDays(conditions.days?.toString() || '30');
        } else if (conditions.type === 'date') {
          setConditionType('date');
          // ISO 날짜 문자열에서 YYYY-MM-DD 형식으로 변환
          const date = new Date(conditions.date || '');
          const formattedDate = date.toISOString().split('T')[0];
          setSpecificDate(formattedDate);
        } else {
          setConditionType('none');
        }
      } else {
        setConditionType('none');
      }
    } catch (err) {
      console.error('Error fetching contact:', err);
      setError(err instanceof Error ? err.message : '연락처 정보를 불러오는 중 오류가 발생했습니다.');
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

  // 특정 날짜의 최소값을 오늘로 설정
  useEffect(() => {
    if (conditionType === 'date' && !specificDate) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setSpecificDate(formattedDate);
    }
  }, [conditionType]);

  // 접근 조건 저장
  const saveConditions = async () => {
    try {
      setSaving(true);
      setError('');
      setSaveSuccess(false);
      
      let conditions = null;
      
      if (conditionType === 'inactivity') {
        const days = parseInt(inactivityDays);
        if (isNaN(days) || days < 1) {
          throw new Error('비활성 기간은 1일 이상이어야 합니다.');
        }
        conditions = { type: 'inactivity', days };
      } else if (conditionType === 'date') {
        if (!specificDate) {
          throw new Error('날짜를 선택해주세요.');
        }
        conditions = { type: 'date', date: specificDate };
      }
      
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conditions,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '접근 조건을 저장하는 중 오류가 발생했습니다.');
      }
      
      setSaveSuccess(true);
      setContact(data.contact);
      
      // 3초 후에 성공 메시지 숨기기
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving conditions:', err);
      setError(err instanceof Error ? err.message : '접근 조건을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-bold">접근 조건 관리</h1>
            <Link
              href={`/contacts/${contactId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              연락처 상세로 돌아가기
            </Link>
          </div>
          
          {contact && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800 mb-2">
                {contact.name}의 접근 조건
              </h2>
              <p className="text-blue-600">
                설정한 조건이 충족되면 이 연락처에서 선택된 파일에 접근할 수 있습니다.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {saveSuccess && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md">
              접근 조건이 성공적으로 저장되었습니다.
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                접근 조건 유형
              </label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as ConditionType)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="none">조건 없음</option>
                <option value="inactivity">비활성 기간 후 접근</option>
                <option value="date">특정 날짜에 접근</option>
              </select>
            </div>
            
            {conditionType === 'inactivity' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비활성 기간 (일)
                </label>
                <input
                  type="number"
                  min="1"
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-2 text-sm text-gray-500">
                  설정한 기간 동안 로그인하지 않으면 연락처에 접근 권한이 부여됩니다.
                </p>
              </div>
            )}
            
            {conditionType === 'date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특정 날짜
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-2 text-sm text-gray-500">
                  선택한 날짜가 되면 자동으로 접근 권한이 부여됩니다.
                </p>
              </div>
            )}
            
            {conditionType === 'none' && (
              <p className="text-sm text-gray-500 italic">
                접근 조건이 설정되지 않으면, 이 연락처에는 자동으로 접근 권한이 부여되지 않습니다.
                관리자가 수동으로 접근 권한을 부여해야 합니다.
              </p>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={saveConditions}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? '저장 중...' : '접근 조건 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 