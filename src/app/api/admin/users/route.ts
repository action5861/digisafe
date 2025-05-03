import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10;

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
    const admin = await prisma.user.findFirst({
      where: { 
        id: session.user.id,
        role: 'admin'
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const role = searchParams.get('role') || 'all';
    const search = searchParams.get('search') || '';

    // 검색 조건 구성
    let whereCondition: Prisma.UserWhereInput = {};
    
    if (role !== 'all') {
      whereCondition.role = role;
    }
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // 총 사용자 수 조회
    const totalUsers = await prisma.user.count({
      where: whereCondition,
    });
    const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        subscriptions: {
          where: { status: 'active' },
          select: {
            status: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        subscription: user.subscriptions[0] || null,
      })),
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 