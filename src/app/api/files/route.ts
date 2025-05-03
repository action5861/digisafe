// Files API route will be implemented here 
// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 사용자의 파일 목록 조회
    const files = await prisma.file.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        size: true,
        contentType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: '파일 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}