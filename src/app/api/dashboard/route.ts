import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 사용자 정보
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    
    // 구독 정보
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        planId: true,
        status: true,
        startDate: true,
        endDate: true,
        paymentMethod: true,
        autoRenew: true,
      },
    });
    
    // 사용자의 파일 목록 가져오기
    const files = await prismaClient.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5 // 최근 5개 파일만 가져오기
    });

    // 총 저장 공간 계산
    const totalStorage = files.reduce((sum, file) => sum + file.size, 0);
    
    // 연락처 통계
    const contactsStats = await prisma.$transaction([
      // 총 연락처 수
      prisma.contact.count({ where: { userId } }),
      
      // 최근 연락처 3개
      prisma.contact.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          email: true,
          relation: true,
        },
      }),
    ]);
    
    // 최근 활동 로그
    const recentActivities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    return NextResponse.json({
      user,
      subscription,
      files: {
        total: files.length,
        storageUsed: totalStorage,
        recent: files
      },
      contacts: {
        total: contactsStats[0],
        recent: contactsStats[1],
      },
      activities: recentActivities,
    }, { status: 200 });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 