'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  invalid_request: '잘못된 요청입니다.',
  payment_not_found: '결제 정보를 찾을 수 없습니다.',
  amount_mismatch: '결제 금액이 일치하지 않습니다.',
  payment_service_error: '결제 서비스에 문제가 발생했습니다.',
  unknown_error: '알 수 없는 오류가 발생했습니다.',
};

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown_error';
  const errorMessage = errorMessages[error] || errorMessages.unknown_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            다시 시도하기
          </Link>
          <Link
            href="/support"
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            고객 지원
          </Link>
        </div>
      </div>
    </div>
  );
} 