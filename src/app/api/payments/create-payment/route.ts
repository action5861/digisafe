import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { planId, paymentType, period } = await request.json();
    
    // 요금제 정보 조회
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });
    
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: '유효하지 않은 요금제입니다.' },
        { status: 400 }
      );
    }
    
    // 결제 금액 결정
    const amount = period === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    
    // 구독 종료일 계산
    const now = new Date();
    const endDate = new Date(now);
    if (period === 'yearly') {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }
    
    // 토스페이먼츠 결제 요청 데이터 생성
    const paymentData = {
      amount,
      orderId: `order_${Date.now()}`,
      orderName: `DigiSafe ${plan.name} ${period === 'yearly' ? '연간' : '월간'} 구독`,
      customerName: session.user.name || 'DigiSafe 사용자',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/fail`,
    };
    
    // 토스페이먼츠 API 호출
    const tossResponse = await axios.post(
      'https://api.tosspayments.com/v1/payments/requestPayment',
      paymentData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_PAYMENTS_SECRET_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // 구독 정보 임시 저장
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'pending',
        startDate: now,
        endDate,
        paymentMethod: paymentType,
        payments: {
          create: {
            amount,
            currency: 'KRW',
            status: 'pending',
            pgProvider: 'toss',
          },
        },
      },
    });
    
    // 결제창 URL 반환
    return NextResponse.json({
      paymentUrl: tossResponse.data.paymentUrl,
      orderId: paymentData.orderId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 