'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import { IconShield, IconFile, IconUsers } from '@tabler/icons-react';
import { formatFileSize } from '@/lib/utils';

interface SubscriptionData {
  id: string;
  plan: {
    id: string;
    name: string;
    storageLimit: number;
    contactLimit: number;
  };
  status: string;
  startDate: string;
  endDate: string;
  payments: Array<{
    id: string;
    amount: number;
    paidAt: string;
    receiptUrl: string | null;
  }>;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchSubscriptionData();
    }
  }, [status, router]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/subscription');
      
      if (!response.ok) {
        throw new Error('구독 정보를 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Subscription data error:', error);
      setError('구독 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!response.ok) {
        throw new Error('구독 취소에 실패했습니다');
      }

      setShowCancelModal(false);
      fetchSubscriptionData();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setError('구독 취소 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className="ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <span className="text-lg font-medium">{subscription?.plan.name} 플랜</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscription?.status === 'active' ? '활성' : '취소됨'}
                </span>
              </div>
              {subscription?.status === 'active' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  구독 취소
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">시작일</p>
                <p className="font-medium">{subscription && formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">다음 결제일</p>
                <p className="font-medium">{subscription && formatDate(subscription.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">상태</p>
                <p className="font-medium">
                  {subscription?.status === 'active' ? '자동 갱신 예정' : '갱신 예정 없음'}
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">DigiSafe 50% 환불 정책</h3>
              <p className="text-sm text-blue-700">
                제3자 접근이 발생하지 않은 경우, 남은 구독 기간에 대해 50%를 환불해 드립니다.
                이는 사용자가 위급 상황 없이 안전하게 지내시길 바라는 마음에서 시작된 정책입니다.
              </p>
            </div>
          </div>
          
          {/* 사용량 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">사용량</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">저장 공간</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-gray-500">4.5 GB / {subscription?.plan.storageLimit} GB</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">신뢰할 수 있는 연락처</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-xs text-gray-500">3 / {subscription?.plan.contactLimit} 연락처</p>
              </div>
            </div>
          </div>
          
          {/* 결제 내역 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">결제 내역</h2>
            
            {subscription?.payments.length === 0 ? (
              <p className="text-gray-500">결제 내역이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영수증</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscription?.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paidAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ₩{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            결제 완료
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {payment.receiptUrl ? (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              영수증 보기
                            </a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 구독 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">구독 취소</h3>
            <p className="text-gray-600 mb-4">
              정말로 구독을 취소하시겠습니까? DigiSafe의 환불 정책에 따라 제3자 접근이 없었던 경우
              남은 기간에 대해 50%를 환불해 드립니다.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                취소 사유 (선택사항)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="서비스를 취소하시는 이유를 알려주세요"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                구독 취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 