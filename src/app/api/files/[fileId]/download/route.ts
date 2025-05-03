import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const fileId = params.fileId;
    const userId = session.user.id;

    // 파일 정보 조회
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      return NextResponse.json(
        { message: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 소유자 확인
    if (file.userId !== userId) {
      return NextResponse.json(
        { message: '파일 접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 파일 경로 확인
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const userDir = path.join(uploadDir, userId);
    const filePath = path.join(userDir, fileId);
    
    console.log('파일 경로 확인:', {
      uploadDir,
      userDir,
      filePath,
      exists: {
        uploadDir: fs.existsSync(uploadDir),
        userDir: fs.existsSync(userDir),
        filePath: fs.existsSync(filePath)
      }
    });

    if (!fs.existsSync(filePath)) {
      console.error('파일이 존재하지 않습니다:', filePath);
      return NextResponse.json(
        { message: '파일이 저장소에서 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = fs.readFileSync(filePath);
    console.log('파일 크기:', fileBuffer.length);

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', file.contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json(
      { message: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 