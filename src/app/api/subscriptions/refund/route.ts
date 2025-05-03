import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import axios from 'axios';

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
    const { subscriptionId, reason } = await request.json();
    
    // 구독 정보 조회
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
        userId: userId,
      },
      include: {
        payments: {
          where: { status: 'completed' },
          orderBy: { paidAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: '활성 상태인 구독만 환불할 수 있습니다.' },
        { status: 400 }
      );
    }
    
    // 제3자 접근 기록 확인
    const accessLogs = await prisma.activityLog.findMany({
      where: {
        userId: userId,
        action: 'THIRD_PARTY_ACCESS',
        createdAt: {
          gte: subscription.startDate,
        },
      },
    });
    
    // 환불 금액 계산 (제3자 접근이 없으면 50% 환불)
    const latestPayment = subscription.payments[0];
    if (!latestPayment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }
    
    // 사용 기간 계산 (일)
    const startDate = new Date(subscription.startDate);
    const currentDate = new Date();
    const totalDays = Math.ceil(
      (subscription.endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const usedDays = Math.ceil(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // 환불 금액 계산
    let refundAmount = 0;
    
    if (accessLogs.length === 0) {
      // 제3자 접근이 없는 경우 50% 환불
      const unusedRatio = (totalDays - usedDays) / totalDays;
      const unusedAmount = latestPayment.amount * unusedRatio;
      refundAmount = Math.round(unusedAmount * 0.5); // 50% 환불
    } else {
      // 제3자 접근이 있는 경우 환불 불가
      return NextResponse.json(
        { error: '제3자 접근 기록이 있어 환불이 불가능합니다.' },
        { status: 400 }
      );
    }
    
    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: '환불 가능한 금액이 없습니다.' },
        { status: 400 }
      );
    }
    
    // 토스페이먼츠 환불 요청
    const tossResponse = await axios.post(
      `https://api.tosspayments.com/v1/payments/${latestPayment.pgTransactionId}/cancel`,
      {
        cancelReason: reason || '사용자 요청에 의한 환불',
        cancelAmount: refundAmount,
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_PAYMENTS_SECRET_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // 환불 정보 저장
    const refund = await prisma.refund.create({
      data: {
        subscriptionId: subscription.id,
        amount: refundAmount,
        currency: 'KRW',
        reason: reason || '사용자 요청에 의한 환불',
        status: 'completed',
        pgRefundId: tossResponse.data.cancels[0].transactionKey,
        refundedAt: new Date(),
      },
    });
    
    // 구독 상태 업데이트
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancellationReason: reason || '사용자 요청에 의한 취소',
      },
    });
    
    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        refundedAt: refund.refundedAt,
      },
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: '환불 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 