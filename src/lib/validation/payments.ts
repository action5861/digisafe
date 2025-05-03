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