// src/app/api/files/download/[fileId]/route.ts 또는 app/api/files/download/[fileId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    console.log('파일 다운로드 요청 fileId:', params.fileId);
    
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('인증되지 않은 요청');
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('요청 사용자 ID:', userId);
    
    // 파일 정보 조회
    const file = await prisma.file.findUnique({
      where: { id: params.fileId },
    });

    if (!file) {
      console.log('파일을 찾을 수 없음:', params.fileId);
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 접근 권한 확인
    if (file.userId !== userId) {
      console.log('파일 접근 권한 없음. 파일 소유자:', file.userId, '요청자:', userId);
      return NextResponse.json(
        { error: '파일 접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 파일 경로 로깅
    console.log('파일 경로:', file.storagePath);
    console.log('파일 존재 여부:', fs.existsSync(file.storagePath));

    // 파일 존재 여부 확인
    if (!fs.existsSync(file.storagePath)) {
      console.log('파일이 저장소에 없음:', file.storagePath);
      return NextResponse.json(
        { error: '파일이 저장소에서 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = fs.readFileSync(file.storagePath);
    console.log('파일 크기:', fileBuffer.length, 'bytes');
    
    // 응답 헤더 설정
    const headers = {
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString(),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      // CORS 헤더 추가
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    console.log('응답 헤더:', headers);
    
    // 응답 생성
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    
    if (error instanceof Error) {
      console.error('오류 세부 정보:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 지원 추가
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}