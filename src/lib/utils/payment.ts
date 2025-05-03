interface RefundCalculationParams {
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  minUsagePeriod: number;
  refundPercentage: number;
}

export function calculateRefundAmount({
  totalAmount,
  startDate,
  endDate,
  currentDate,
  minUsagePeriod,
  refundPercentage,
}: RefundCalculationParams): number {
  // 총 구독 기간 (일)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 사용한 기간 (일)
  const usedDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 남은 기간 (일)
  const remainingDays = totalDays - usedDays;
  
  // 최소 사용 기간 확인
  if (usedDays < minUsagePeriod) {
    return 0;
  }
  
  // 일일 요금 계산
  const dailyRate = totalAmount / totalDays;
  
  // 환불 금액 계산 (남은 기간 * 일일 요금 * 환불 비율)
  const refundAmount = Math.floor(remainingDays * dailyRate * (refundPercentage / 100));
  
  return refundAmount;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

interface PaymentRequest {
  planId: string;
  paymentType: string;
  period: 'monthly' | 'yearly';
}

export function validatePaymentRequest(data: PaymentRequest): string | null {
  // 필수 필드 검증
  if (!data.planId || !data.paymentType || !data.period) {
    return '필수 정보가 누락되었습니다.';
  }

  // 결제 수단 검증
  const validPaymentTypes = ['card', 'bank_transfer', 'virtual_account'];
  if (!validPaymentTypes.includes(data.paymentType)) {
    return '유효하지 않은 결제 수단입니다.';
  }

  // 구독 기간 검증
  if (data.period !== 'monthly' && data.period !== 'yearly') {
    return '유효하지 않은 구독 기간입니다.';
  }

  return null;
} 