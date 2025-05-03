import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 구독 정보
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            storageLimit: true,
            contactLimit: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            paidAt: true,
            receiptUrl: true,
          },
        },
      },
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: '구독 정보가 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subscription, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: '구독 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 