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

    // 관리자 권한 확인
    const user = await prisma.user.findFirst({
      where: { 
        id: session.user.id,
        role: 'admin'
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 총 사용자 수
    const totalUsers = await prisma.user.count();

    // 활성 구독 수
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    });

    // 이번 달 수익
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    // 총 저장 공간 사용량 (bytes)
    const storageUsed = await prisma.file.aggregate({
      _sum: { size: true },
    });

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      storageUsed: storageUsed._sum.size || 0,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 