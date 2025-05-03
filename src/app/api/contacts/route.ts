import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// 연락처 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// 연락처 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: '이름과 이메일은 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 연락처 생성
    const contact = await prisma.contact.create({
      data: {
        userId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        relation: data.relation || null,
        accessFiles: data.accessFiles || null,
        conditions: data.conditions || null,
      },
    });
    
    return NextResponse.json(
      { message: '연락처가 성공적으로 등록되었습니다.', contact },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: '연락처 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 