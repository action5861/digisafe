'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/payment/payment-modal';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: '기본 플랜',
    price: 12000,
    features: [
      '1GB 저장 공간',
      'E2E 암호화',
      '1명의 제3자 접근 관리',
    ],
  },
  {
    id: 'standard',
    name: '표준 플랜',
    price: 24000,
    features: [
      '5GB 저장 공간',
      'E2E 암호화',
      '3명의 제3자 접근 관리',
      '액세스 로그 확인',
    ],
    isPopular: true,
  },
  {
    id: 'premium',
    name: '프리미엄 플랜',
    price: 36000,
    features: [
      '10GB 저장 공간',
      'E2E 암호화',
      '5명의 제3자 접근 관리',
      '우선 고객 지원',
    ],
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePlanSelect = (plan: Plan) => {
    if (status === 'unauthenticated') {
      router.push(`/register?plan=${plan.id}`);
      return;
    }

    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* 히어로 섹션 */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">요금제</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              사용하지 않으면 50% 환불되는 투명한 요금제
            </p>
          </div>
        </section>

        {/* 요금제 비교 섹션 */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white p-8 rounded-lg shadow-sm flex flex-col h-full ${
                    plan.isPopular ? 'border-2 border-blue-500 relative' : ''
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      인기
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
                  <p className="text-3xl font-bold mb-6">
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                    }).format(plan.price)}
                    <span className="text-lg text-gray-500">/년</span>
                  </p>
                  <ul className="space-y-4 text-gray-600 mb-8 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mt-1 mr-2"
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
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className="relative z-10 block w-full text-center px-6 py-3 font-medium rounded-md bg-[#0F52BA] text-white hover:bg-[#0F52BA]/90 transition-colors shadow-md border-2 border-[#0F52BA] mt-auto"
                  >
                    선택하기
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 환불 정책 섹션 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">투명한 환불 정책</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                사용하지 않은 기간에 대해서는 50% 환불을 보장합니다.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">환불 조건</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-1 mr-2"
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
                    <span>최소 1개월 이상 사용 후 환불 가능</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-1 mr-2"
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
                    <span>사용하지 않은 기간에 대해서만 환불</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-1 mr-2"
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
                    <span>환불 금액의 50% 환불 보장</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">환불 예시</h3>
                <div className="space-y-4 text-gray-600">
                  <p>예를 들어, 3개월 요금제를 구매하고 1개월만 사용한 경우:</p>
                  <ul className="space-y-2">
                    <li>사용 기간: 1개월</li>
                    <li>미사용 기간: 2개월</li>
                    <li>환불 금액: 2개월 요금의 50%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
            <div className="space-y-8">
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-2">결제는 어떻게 하나요?</h3>
                <p className="text-gray-600">
                  신용카드, 직불카드, 계좌이체 등 다양한 결제 수단을 지원합니다.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-2">환불은 어떻게 받나요?</h3>
                <p className="text-gray-600">
                  환불 요청 시 원래 결제 수단으로 자동 환불됩니다.
                </p>
              </div>
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold mb-2">요금제를 변경할 수 있나요?</h3>
                <p className="text-gray-600">
                  언제든지 더 높은 요금제로 업그레이드할 수 있으며, 다운그레이드는 다음 결제 주기에 적용됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">지금 DigiSafe를 시작하세요</h2>
            <p className="text-lg text-gray-600 mb-8">
              투명한 요금제와 환불 정책으로 안심하고 사용하세요.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              지금 시작하기
            </button>
          </div>
        </section>
      </main>

      {/* 결제 모달 */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
        />
      )}
    </div>
  );
} 