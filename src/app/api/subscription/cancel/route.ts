import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { reason } = await request.json();
    
    // 현재 활성 구독 확인
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: '활성 구독이 없습니다.' },
        { status: 404 }
      );
    }
    
    // 구독 취소 처리
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancellationReason: reason,
        autoRenew: false,
      },
    });
    
    return NextResponse.json(
      { message: '구독이 성공적으로 취소되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 