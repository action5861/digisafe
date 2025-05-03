import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { role } = await request.json();

    // 역할 값 검증
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: '잘못된 역할입니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자기 자신의 역할은 변경할 수 없음
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: '자신의 역할은 변경할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 역할 변경
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'update_user_role',
        resourceId: params.userId,
        details: {
          oldRole: user.role,
          newRole: role,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json(
      { error: '역할 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 