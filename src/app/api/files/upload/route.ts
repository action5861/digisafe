// src/app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as fs from 'fs';
import * as path from 'path';
import { mkdir } from 'fs/promises';
import { deriveKeyFromPassword, safeAtob } from '@/lib/encryption/client-encryption';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// 파일 저장 디렉토리 설정
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// 디렉토리가 없으면 생성
async function ensureDirectoryExists(directory: string): Promise<void> {
  try {
    await mkdir(directory, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('파일 업로드 요청 시작');
    
    const session = await getServerSession(authOptions);
    console.log('세션 확인:', session?.user?.id);
    
    if (!session?.user) {
      console.log('인증되지 않은 요청');
      return NextResponse.json(
        { message: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    
    // FormData에서 모든 필요한 값 추출
    const file = formData.get('file') as Blob;
    const filename = formData.get('filename') as string;
    const contentType = formData.get('contentType') as string;
    const sizeStr = formData.get('size') as string;
    const size = parseInt(sizeStr);
    const ivVector = formData.get('ivVector') as string;
    const encryptedFileKey = formData.get('encryptedFileKey') as string;
    const fileKeyIv = formData.get('fileKeyIv') as string;
    const masterKeySalt = formData.get('masterKeySalt') as string;

    console.log('업로드 데이터 확인:', {
      filename,
      size,
      contentType,
      ivVectorLength: ivVector?.length,
      encryptedFileKeyLength: encryptedFileKey?.length,
      fileKeyIvLength: fileKeyIv?.length,
      masterKeySaltLength: masterKeySalt?.length
    });

    if (!file || !filename || !contentType || isNaN(size) || !ivVector || !encryptedFileKey || !fileKeyIv || !masterKeySalt) {
      console.error('필수 파일 정보 누락:', { 
        hasFile: !!file, 
        hasFilename: !!filename, 
        hasContentType: !!contentType, 
        sizeIsValid: !isNaN(size),
        hasIvVector: !!ivVector,
        hasEncryptedFileKey: !!encryptedFileKey,
        hasFileKeyIv: !!fileKeyIv,
        hasMasterKeySalt: !!masterKeySalt
      });
      return NextResponse.json(
        { message: '필수 파일 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error('사용자를 찾을 수 없음:', userId);
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업로드 디렉토리 확인 및 생성
    console.log(`업로드 디렉토리 확인: ${UPLOAD_DIR}`);
    await ensureDirectoryExists(UPLOAD_DIR);
    
    const userUploadDir = path.join(UPLOAD_DIR, userId);
    console.log(`사용자 업로드 디렉토리 확인: ${userUploadDir}`);
    await ensureDirectoryExists(userUploadDir);

    // 파일 저장
    const fileId = uuidv4();
    const storagePath = path.join(userUploadDir, fileId);
    console.log(`파일 저장 경로: ${storagePath}`);
    
    const fileArrayBuffer = await file.arrayBuffer();
    console.log('업로드된 파일 크기:', fileArrayBuffer.byteLength);
    
    const fileBuffer = Buffer.from(fileArrayBuffer);
    fs.writeFileSync(storagePath, fileBuffer);
    console.log('파일 저장 완료');

    // 데이터베이스에 파일 정보 저장
    console.log('데이터베이스에 파일 정보 저장 시작');
    const fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        name: filename,
        size,
        contentType,
        path: `/files/${userId}/${fileId}`,
        storagePath,
        userId,
        ivVector,
        encryptedFileKey,
        fileKeyIv,
        masterKeySalt,
        metaData: {
          salt: masterKeySalt,
          originalName: filename,
          lastModified: new Date().toISOString(),
        },
      },
    });
    console.log('파일 레코드 생성 완료:', fileRecord.id);

    return NextResponse.json(
      { 
        message: '파일이 성공적으로 업로드되었습니다.',
        fileId: fileRecord.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { message: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function decryptFileWithKeyHierarchy(
  encryptedData: ArrayBuffer,
  fileIv: string,
  password: string,
  encryptedFileKey?: string,
  fileKeyIv?: string,
  masterKeySalt?: string,
  originalFileName: string = "downloaded_file",
  originalContentType: string = "application/octet-stream",
  metadata?: any
): Promise<File> {
  try {
    // 1. 마스터 키 유도
    const { key: masterKey } = await deriveKeyFromPassword(password, masterKeySalt ? safeAtob(masterKeySalt) : undefined);
    
    console.log('마스터 키 유도 완료:', {
      algorithm: masterKey.algorithm.name,
      extractable: masterKey.extractable,
      usages: masterKey.usages
    });

    // 2. 파일 키 복호화
    if (encryptedFileKey && fileKeyIv) {
      const encryptedFileKeyArray = safeAtob(encryptedFileKey);
      const encryptedFileKeyBuffer = new ArrayBuffer(encryptedFileKeyArray.length);
      const encryptedFileKeyView = new Uint8Array(encryptedFileKeyBuffer);
      encryptedFileKeyView.set(encryptedFileKeyArray);

      const fileKey = await unwrapFileKey(
        masterKey,
        encryptedFileKeyBuffer,
        safeAtob(fileKeyIv)
      );

      // 3. 파일 복호화
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: safeAtob(fileIv)
        },
        fileKey,
        encryptedData
      );

      return new File([decryptedData], originalFileName, { type: originalContentType });
    }

    throw new Error('파일 키 정보가 누락되었습니다.');
  } catch (error) {
    console.error('파일 복호화 실패:', error);
    throw error;
  }
}

async function unwrapFileKey(
  masterKey: CryptoKey,
  wrappedKey: ArrayBuffer,
  iv: Uint8Array
): Promise<CryptoKey> {
  try {
    console.log('unwrapFileKey 호출 전:', {
      masterKeyValid: !!masterKey,
      encryptedFileKeyLength: wrappedKey.byteLength,
      fileKeyIvLength: iv.length
    });
    return await window.crypto.subtle.unwrapKey(
      "raw", // 가져오기 형식
      wrappedKey,
      masterKey,
      {
        name: "AES-GCM",
        iv: iv
      },
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("파일 키 언래핑 실패:", error);
    throw new Error("파일 키 복호화 중 오류가 발생했습니다. 올바른 비밀번호인지 확인하세요.");
  }
}

function ensureIvLength(ivArray: Uint8Array): Uint8Array {
  if (ivArray.length === 12) {
    return ivArray;
  }
  
  const adjustedIv = new Uint8Array(12);
  if (ivArray.length < 12) {
    // 짧은 경우 나머지를 0으로 채움
    adjustedIv.set(ivArray);
  } else {
    // 긴 경우 앞부분만 사용
    adjustedIv.set(ivArray.slice(0, 12));
  }
  return adjustedIv;
}

// 1. 마스터 키 유도 테스트
export async function testMasterKeyDerivation(
  password: string,
  masterKeySalt: string
): Promise<{ success: boolean; key?: CryptoKey; error?: string }> {
  try {
    console.log('=== 마스터 키 유도 테스트 시작 ===');
    console.log('입력값:', {
      passwordLength: password.length,
      masterKeySaltLength: masterKeySalt.length
    });

    const { key: masterKey } = await deriveKeyFromPassword(
      password,
      safeAtob(masterKeySalt)
    );

    console.log('마스터 키 유도 성공:', {
      algorithm: masterKey.algorithm.name,
      extractable: masterKey.extractable,
      usages: masterKey.usages
    });

    return { success: true, key: masterKey };
  } catch (error) {
    console.error('마스터 키 유도 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

// 2. 파일 키 언래핑 테스트
export async function testFileKeyUnwrapping(
  masterKey: CryptoKey,
  encryptedFileKey: string,
  fileKeyIv: string
): Promise<{ success: boolean; key?: CryptoKey; error?: string }> {
  try {
    console.log('=== 파일 키 언래핑 테스트 시작 ===');
    console.log('입력값:', {
      masterKeyValid: !!masterKey,
      encryptedFileKeyLength: encryptedFileKey.length,
      fileKeyIvLength: fileKeyIv.length
    });

    const encryptedFileKeyArray = safeAtob(encryptedFileKey);
    const encryptedFileKeyBuffer = new ArrayBuffer(encryptedFileKeyArray.length);
    const encryptedFileKeyView = new Uint8Array(encryptedFileKeyBuffer);
    encryptedFileKeyView.set(encryptedFileKeyArray);

    const fileKey = await unwrapFileKey(
      masterKey,
      encryptedFileKeyBuffer,
      safeAtob(fileKeyIv)
    );

    console.log('파일 키 언래핑 성공:', {
      algorithm: fileKey.algorithm.name,
      extractable: fileKey.extractable,
      usages: fileKey.usages
    });

    return { success: true, key: fileKey };
  } catch (error) {
    console.error('파일 키 언래핑 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

// 3. 파일 데이터 복호화 테스트
export async function testFileDecryption(
  fileKey: CryptoKey,
  encryptedData: ArrayBuffer,
  fileIv: string
): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
  try {
    console.log('=== 파일 데이터 복호화 테스트 시작 ===');
    console.log('입력값:', {
      fileKeyValid: !!fileKey,
      encryptedDataSize: encryptedData.byteLength,
      fileIvLength: fileIv.length
    });

    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: safeAtob(fileIv)
      },
      fileKey,
      encryptedData
    );

    console.log('파일 데이터 복호화 성공:', {
      decryptedDataSize: decryptedData.byteLength
    });

    return { success: true, data: decryptedData };
  } catch (error) {
    console.error('파일 데이터 복호화 실패:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}

// 전체 복호화 과정을 단계별로 실행하는 테스트 함수
export async function testDecryptionProcess(
  encryptedData: ArrayBuffer,
  fileIv: string,
  password: string,
  encryptedFileKey: string,
  fileKeyIv: string,
  masterKeySalt: string
): Promise<{ 
  masterKeyTest: { success: boolean; error?: string };
  fileKeyTest: { success: boolean; error?: string };
  decryptionTest: { success: boolean; error?: string };
}> {
  // 1. 마스터 키 유도 테스트
  const masterKeyResult = await testMasterKeyDerivation(password, masterKeySalt);
  if (!masterKeyResult.success || !masterKeyResult.key) {
    return {
      masterKeyTest: { success: false, error: masterKeyResult.error },
      fileKeyTest: { success: false, error: '마스터 키 유도 실패로 인해 파일 키 테스트를 건너뜁니다.' },
      decryptionTest: { success: false, error: '마스터 키 유도 실패로 인해 복호화 테스트를 건너뜁니다.' }
    };
  }

  // 2. 파일 키 언래핑 테스트
  const fileKeyResult = await testFileKeyUnwrapping(
    masterKeyResult.key,
    encryptedFileKey,
    fileKeyIv
  );
  if (!fileKeyResult.success || !fileKeyResult.key) {
    return {
      masterKeyTest: { success: true },
      fileKeyTest: { success: false, error: fileKeyResult.error },
      decryptionTest: { success: false, error: '파일 키 언래핑 실패로 인해 복호화 테스트를 건너뜁니다.' }
    };
  }

  // 3. 파일 데이터 복호화 테스트
  const decryptionResult = await testFileDecryption(
    fileKeyResult.key,
    encryptedData,
    fileIv
  );

  return {
    masterKeyTest: { success: true },
    fileKeyTest: { success: true },
    decryptionTest: { 
      success: decryptionResult.success,
      error: decryptionResult.error
    }
  };
}
