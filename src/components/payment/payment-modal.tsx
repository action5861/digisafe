'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  amount: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  planId,
  planName,
  amount,
}: PaymentModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // 결제 요청 생성
      const response = await fetch('/api/payments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': session?.csrfToken || '',
        },
        body: JSON.stringify({
          planId,
          paymentType: paymentMethod,
          period: 'yearly',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '결제 요청에 실패했습니다.');
      }

      const { paymentUrl } = await response.json();
      
      // 결제창으로 리다이렉트
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">결제 정보</h2>
        
        <div className="space-y-6">
          {/* 요금제 정보 */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">선택한 요금제</h3>
            <p className="text-gray-600">{planName}</p>
            <p className="text-xl font-bold mt-2">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(amount)}
              <span className="text-sm text-gray-500 ml-1">/년</span>
            </p>
          </div>

          {/* 결제 수단 선택 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">결제 수단 선택</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-5 w-5 text-primary"
                />
                <div>
                  <span className="font-medium">신용/체크카드</span>
                  <p className="text-sm text-gray-500">VISA, MasterCard, 국내 모든 카드</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="h-5 w-5 text-primary"
                />
                <div>
                  <span className="font-medium">실시간 계좌이체</span>
                  <p className="text-sm text-gray-500">국내 모든 은행</p>
                </div>
              </label>
            </div>
          </div>

          {/* 환불 정책 안내 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">환불 정책</h4>
            <p className="text-sm text-gray-600">
              사용하지 않은 기간에 대해서는 50% 환불을 보장합니다. 최소 1개월 이상 사용 후 환불이 가능합니다.
            </p>
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
              onClick={handlePayment}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 