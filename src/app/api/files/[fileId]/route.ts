import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base64 유효성 검증 함수
function isValidBase64(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    // Base64 정규식 패턴
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str);
  } catch (e) {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const fileId = params.fileId;
    const userId = session.user.id;
    
    // 파일 메타데이터 조회
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        id: true,
        name: true,
        size: true,
        contentType: true,
        ivVector: true,
        encryptedFileKey: true,
        fileKeyIv: true,
        masterKeySalt: true,
        metaData: true,
        userId: true,
      },
    });
    
    if (!file) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 파일 접근 권한 확인
    if (file.userId !== userId) {
      return NextResponse.json(
        { error: '이 파일에 접근할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 마스터 키 salt 가져오기
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { masterKeySalt: true }
    });
    
    // Base64 인코딩 상태 확인 및 로깅
    console.log('서버에서 반환하는 메타데이터 인코딩 상태:', {
      ivVectorValid: isValidBase64(file.ivVector),
      encryptedFileKeyValid: isValidBase64(file.encryptedFileKey || ''),
      fileKeyIvValid: isValidBase64(file.fileKeyIv || ''),
      masterKeySaltValid: isValidBase64(user?.masterKeySalt || ''),
      // 길이 정보도 함께 로깅
      ivVectorLength: file.ivVector?.length,
      encryptedFileKeyLength: file.encryptedFileKey?.length,
      fileKeyIvLength: file.fileKeyIv?.length,
      masterKeySaltLength: user?.masterKeySalt?.length
    });
    
    // 파일 데이터에 마스터 키 salt 추가
    const fileWithMasterKey = {
      ...file,
      masterKeySalt: user?.masterKeySalt || null
    };
    
    return NextResponse.json({ file: fileWithMasterKey }, { status: 200 });
  } catch (error) {
    console.error('파일 메타데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '파일 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    const fileId = params.fileId;
    const userId = session.user.id;
    
    // 파일 존재 여부 및 소유권 확인
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      select: { userId: true, storagePath: true }
    });
    
    if (!file) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    if (file.userId !== userId) {
      return NextResponse.json(
        { error: '이 파일을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 파일 시스템에서 파일 삭제
    if (file.storagePath) {
      try {
        const fs = require('fs');
        if (fs.existsSync(file.storagePath)) {
          fs.unlinkSync(file.storagePath);
        }
      } catch (error) {
        console.error('파일 시스템에서 파일 삭제 실패:', error);
        // 파일 시스템 삭제 실패는 데이터베이스 삭제를 막지 않음
      }
    }
    
    // 데이터베이스에서 파일 레코드 삭제
    await prisma.file.delete({
      where: { id: fileId }
    });
    
    return NextResponse.json(
      { message: '파일이 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    return NextResponse.json(
      { error: '파일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 