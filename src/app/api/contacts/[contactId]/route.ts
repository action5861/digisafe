import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// 특정 연락처 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
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
    const contactId = params.contactId;
    
    // 연락처 조회
    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });
    
    if (!contact) {
      return NextResponse.json(
        { error: '연락처를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 접근 권한 확인
    if (contact.userId !== userId) {
      return NextResponse.json(
        { error: '이 연락처에 접근할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: '연락처 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 연락처 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
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
    const contactId = params.contactId;
    const data = await request.json();
    
    // 연락처 존재 여부 확인
    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });
    
    if (!existingContact) {
      return NextResponse.json(
        { error: '연락처를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 접근 권한 확인
    if (existingContact.userId !== userId) {
      return NextResponse.json(
        { error: '이 연락처를 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 이메일 형식 검증
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { error: '유효한 이메일 주소를 입력해주세요.' },
          { status: 400 }
        );
      }
    }
    
    // 연락처 수정
    const updatedContact = await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        name: data.name !== undefined ? data.name : existingContact.name,
        email: data.email !== undefined ? data.email : existingContact.email,
        phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : existingContact.phoneNumber,
        relation: data.relation !== undefined ? data.relation : existingContact.relation,
        accessFiles: data.accessFiles !== undefined ? data.accessFiles : existingContact.accessFiles,
        conditions: data.conditions !== undefined ? data.conditions : existingContact.conditions,
      },
    });
    
    return NextResponse.json(
      { message: '연락처가 성공적으로 수정되었습니다.', contact: updatedContact },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: '연락처 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 연락처 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
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
    const contactId = params.contactId;
    
    // 연락처 존재 여부 확인
    const existingContact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });
    
    if (!existingContact) {
      return NextResponse.json(
        { error: '연락처를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 접근 권한 확인
    if (existingContact.userId !== userId) {
      return NextResponse.json(
        { error: '이 연락처를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 연락처 삭제
    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });
    
    return NextResponse.json(
      { message: '연락처가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: '연락처 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 