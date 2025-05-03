'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  usedDays: number;
  totalDays: number;
}

export default function RefundRequestModal({
  isOpen,
  onClose,
  subscriptionId,
  subscriptionName,
  amount,
  usedDays,
  totalDays,
}: RefundRequestModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefund = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/subscriptions/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '환불 요청에 실패했습니다.');
      }

      // 성공 시 구독 관리 페이지로 이동
      router.push('/settings/subscription?refund=success');
    } catch (error) {
      console.error('Refund error:', error);
      setError(error instanceof Error ? error.message : '환불 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 환불 금액 계산 (50% 환불)
  const unusedDays = totalDays - usedDays;
  const unusedRatio = unusedDays / totalDays;
  const unusedAmount = amount * unusedRatio;
  const refundAmount = Math.round(unusedAmount * 0.5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">환불 요청</h2>
        
        <div className="space-y-6">
          {/* 구독 정보 */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">구독 정보</h3>
            <p className="text-gray-600">{subscriptionName}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                사용 기간: {usedDays}일 / {totalDays}일
              </p>
              <p className="text-sm text-gray-500">
                미사용 기간: {unusedDays}일
              </p>
              <p className="text-lg font-semibold">
                환불 예상 금액: {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(refundAmount)}
              </p>
            </div>
          </div>

          {/* 환불 사유 */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              환불 사유
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="환불 사유를 입력해주세요"
            />
          </div>

          {/* 환불 정책 안내 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">환불 정책</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 사용하지 않은 기간에 대해서만 50% 환불</li>
              <li>• 제3자 접근 기록이 있는 경우 환불 불가</li>
              <li>• 환불 금액은 원래 결제 수단으로 자동 환불</li>
            </ul>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* 버튼 */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isProcessing}
            >
              취소
            </button>
            <button
              onClick={handleRefund}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={isProcessing || !reason.trim()}
            >
              {isProcessing ? '처리 중...' : '환불 요청'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 