import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/payments/fail?error=unauthorized', request.url));
    }

    const { searchParams } = new URL(request.url);
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(new URL('/payments/fail?error=invalid_request', request.url));
    }

    // 결제 정보 조회
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { subscription: true },
    });

    if (!payment) {
      return NextResponse.redirect(new URL('/payments/fail?error=payment_not_found', request.url));
    }

    if (payment.amount !== parseInt(amount)) {
      return NextResponse.redirect(new URL('/payments/fail?error=amount_mismatch', request.url));
    }

    // 토스페이먼츠 결제 확인
    const tossResponse = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        paymentKey,
        orderId,
        amount,
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.TOSS_PAYMENTS_SECRET_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 결제 상태 업데이트
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        pgTransactionId: tossResponse.data.transactionKey,
        paidAt: new Date(),
      },
    });

    // 구독 상태 업데이트
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
      },
    });

    return NextResponse.redirect(new URL('/payments/success', request.url));
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.redirect(new URL('/payments/fail?error=payment_service_error', request.url));
  }
} 