'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 5초 후 대시보드로 리다이렉트
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">결제가 완료되었습니다!</h1>
        <p className="text-gray-600 mb-8">
          DigiSafe 서비스 이용을 환영합니다. 5초 후 대시보드로 이동합니다.
        </p>
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            대시보드로 이동
          </Link>
          <Link
            href="/settings"
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            구독 정보 확인
          </Link>
        </div>
      </div>
    </div>
  );
} 