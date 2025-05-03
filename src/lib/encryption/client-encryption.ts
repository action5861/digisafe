// src/lib/encryption/client-encryption.ts

import {
  deriveMasterKey,
  generateFileKey,
  wrapFileKey,
  unwrapFileKey
} from './key-management';

/**
 * 클라이언트 측 암호화 라이브러리 초기화
 * Web Crypto API는 모든 현대 브라우저에서 지원됨
 */
export async function initializeEncryption(): Promise<boolean> {
  // Web Crypto API 사용 가능 여부 확인
  if (window.crypto && window.crypto.subtle) {
    return true;
  }
  throw new Error('이 브라우저는 암호화를 지원하지 않습니다.');
}

/**
 * 비밀번호에서 암호화 키 유도
 */
export async function deriveKeyFromPassword(
  password: string, 
  providedSalt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  try {
    console.log("=== 키 유도 과정 시작 ===");
    const hasSalt = providedSalt && providedSalt.length > 0;
    console.log("입력값:", {
      passwordLength: password?.length,
      hasSalt,
      saltLength: providedSalt?.length,
      saltBytes: hasSalt ? Array.from(providedSalt.slice(0, 4)) : undefined
    });

    // 비밀번호 유효성 검사
    if (!password || typeof password !== 'string') {
      throw new Error("유효한 비밀번호가 필요합니다");
    }
    
    // 비밀번호 버퍼 생성
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    console.log("비밀번호 버퍼 생성:", {
      byteLength: passwordBytes.byteLength,
      firstBytes: Array.from(passwordBytes.slice(0, 4))
    });
    
    // 키 재료 생성
    console.log("키 재료 생성 시작...");
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    console.log("키 재료 생성 완료:", {
      algorithm: keyMaterial.algorithm,
      extractable: keyMaterial.extractable,
      type: keyMaterial.type,
      usages: keyMaterial.usages
    });
    
    // Salt 처리
    let salt: Uint8Array;
    if (hasSalt) {
      console.log("제공된 Salt 사용 중...");
      salt = providedSalt;
      console.log("제공된 Salt:", {
        length: salt.length,
        firstBytes: Array.from(salt.slice(0, 4))
      });
    } else {
      console.log("새 Salt 생성 중...");
      salt = window.crypto.getRandomValues(new Uint8Array(16));
      console.log("새 Salt 생성 완료:", {
        length: salt.length,
        firstBytes: Array.from(salt.slice(0, 4))
      });
    }
    
    // 키 유도 파라미터 설정
    const keyDerivationParams = {
      name: "PBKDF2",
      salt: salt, // 항상 salt 사용
      iterations: 100000,
      hash: "SHA-256"
    };
    
    console.log("키 유도 시작...", {
      algorithm: "PBKDF2",
      iterations: 100000,
      hash: "SHA-256",
      hasSalt: true,
      saltLength: salt.length,
      saltBytes: Array.from(salt.slice(0, 4))
    });
    
    const key = await window.crypto.subtle.deriveKey(
      keyDerivationParams,
      keyMaterial,
      { 
        name: "AES-GCM", 
        length: 256 
      },
      false,
      ["encrypt", "decrypt"]
    );
    
    console.log("키 유도 완료:", {
      algorithm: key.algorithm,
      extractable: key.extractable, 
      type: key.type,
      usages: key.usages,
      hasSalt: true,
      saltLength: salt.length,
      saltBytes: Array.from(salt.slice(0, 4))
    });
    
    console.log("=== 키 유도 과정 완료 ===");
    
    return { key, salt };
  } catch (error) {
    console.error("키 유도 중 오류:", error);
    if (error instanceof Error) {
      console.error("오류 세부 정보:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

/**
 * 새로운 암호화 함수
 */
export async function encryptFileWithKeyHierarchy(
  file: File,
  password: string,
  existingMasterKeySalt?: Uint8Array
): Promise<{
  encryptedBlob: Blob;
  fileIv: string;
  encryptedFileKey: string;
  fileKeyIv: string;
  masterKeySalt: string;
}> {
  try {
    console.log('키 계층 구조로 암호화 시작...');
    
    // 1. 마스터 키 유도
    const saltArray = existingMasterKeySalt || undefined;
    const { masterKey, salt: masterKeySalt } = await deriveMasterKey(password, saltArray);
    console.log('마스터 키 유도 완료');
    
    // 2. 파일별 고유 키 생성
    const fileKey = await generateFileKey();
    console.log('파일 키 생성 완료');
    
    // 3. 마스터 키로 파일 키 암호화
    const { wrappedKey: encryptedFileKeyBuffer, iv: fileKeyIvArray } = 
      await wrapFileKey(masterKey, fileKey);
    console.log('파일 키 암호화 완료');
    
    // 4. 파일 암호화
    const fileBuffer = await file.arrayBuffer();
    const fileIvArray = window.crypto.getRandomValues(new Uint8Array(12));
    console.log('암호화 IV 생성:', {
      length: fileIvArray.length,
      bytes: Array.from(fileIvArray)
    });
    
    const encryptedFileBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: fileIvArray
      },
      fileKey,
      fileBuffer
    );
    console.log('파일 암호화 완료, 크기:', encryptedFileBuffer.byteLength);
    
    // Base64 인코딩
    const fileIv = btoa(String.fromCharCode(...fileIvArray));
    const fileKeyIv = btoa(String.fromCharCode(...fileKeyIvArray));
    const encryptedFileKey = btoa(
      String.fromCharCode(...new Uint8Array(encryptedFileKeyBuffer))
    );
    const masterKeySaltBase64 = btoa(String.fromCharCode(...masterKeySalt));
    
    // IV 길이 로깅
    console.log('IV 정보:', {
      originalLength: fileIvArray.length,
      base64Length: fileIv.length,
      decodedLength: atob(fileIv).length
    });
    console.log('암호화된 파일 키 길이:', encryptedFileKey.length, '바이트');
    console.log('파일 키 IV 길이:', fileKeyIv.length, '바이트');
    console.log('마스터 키 Salt 길이:', masterKeySalt.length, '바이트');
    
    // 암호화된 파일 Blob 생성
    const encryptedBlob = new Blob([encryptedFileBuffer], { type: 'application/octet-stream' });
    
    return {
      encryptedBlob,
      fileIv,
      encryptedFileKey,
      fileKeyIv,
      masterKeySalt: masterKeySaltBase64
    };
  } catch (error) {
    console.error('파일 암호화 실패:', error);
    throw error;
  }
}

/**
 * 안전한 Base64 디코딩 함수
 */
export function safeAtob(base64String: any): Uint8Array {
  try {
    // 입력값 검증
    if (!base64String) {
      console.error("Base64 문자열이 없습니다");
      throw new Error("Base64 문자열이 필요합니다");
    }
    
    // 'undefined' 문자열 체크
    if (typeof base64String === 'string' && base64String.startsWith('undefined')) {
      console.error("유효하지 않은 Base64 문자열:", base64String.substring(0, 20) + "...");
      throw new Error("유효하지 않은 Base64 문자열");
    }
    
    // 문자열 변환
    const base64 = String(base64String);
    
    // Base64 패딩 추가 (필요한 경우)
    let paddedBase64 = base64;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += '=';
    }
    
    // Base64 디코딩
    try {
      const binaryString = atob(paddedBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("Base64 디코딩 실패:", e);
      throw new Error("Base64 디코딩에 실패했습니다");
    }
  } catch (error) {
    console.error("safeAtob 처리 중 오류:", error);
    throw error;
  }
}

// IV 검증 및 조정 함수
function validateAndAdjustIV(ivBase64: string): Uint8Array {
  try {
    console.log('=== IV 검증 및 조정 시작 ===');
    console.log('원본 IV Base64:', ivBase64);
    
    // Base64 디코딩
    const ivArray = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    console.log('IV 디코딩 완료:', {
      length: ivArray.length,
      bytes: Array.from(ivArray)
    });
    
    // IV 길이 검증 (AES-GCM은 12바이트 IV를 요구)
    if (ivArray.length !== 12) {
      console.warn('IV 길이가 12바이트가 아닙니다:', ivArray.length);
      
      // 길이 조정
      const adjustedIv = new Uint8Array(12);
      if (ivArray.length > 12) {
        // 길이가 긴 경우 앞부분만 사용
        adjustedIv.set(ivArray.slice(0, 12));
        console.log('IV가 12바이트보다 깁니다. 앞부분만 사용합니다.');
      } else {
        // 길이가 짧은 경우 나머지를 0으로 채움
        adjustedIv.set(ivArray);
        console.log('IV가 12바이트보다 짧습니다. 나머지를 0으로 채웁니다.');
      }
      
      console.log('조정된 IV:', {
        length: adjustedIv.length,
        bytes: Array.from(adjustedIv)
      });
      return adjustedIv;
    }
    
    console.log('IV 검증 완료: 길이가 12바이트입니다.');
    return ivArray;
  } catch (error) {
    console.error('IV 처리 중 오류:', error);
    throw new Error('IV 처리에 실패했습니다');
  }
}

// 복호화 시도 함수
async function attemptDecryption(
  encryptedBuffer: ArrayBuffer,
  ivArray: Uint8Array,
  key: CryptoKey,
  contentType: string
): Promise<ArrayBuffer> {
  try {
    console.log('=== 복호화 시도 시작 ===');
    console.log('입력값:', {
      encryptedSize: encryptedBuffer.byteLength,
      ivLength: ivArray.length,
      contentType
    });
    
    // 암호화된 데이터 검증
    if (encryptedBuffer.byteLength < 16) {
      throw new Error('암호화된 데이터가 너무 짧습니다 (최소 16바이트 필요)');
    }
    
    // 처음 16바이트 확인
    const firstBytes = new Uint8Array(encryptedBuffer.slice(0, 16));
    console.log('암호화된 데이터 처음 16바이트:', {
      hex: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
      decimal: Array.from(firstBytes)
    });
    
    // 복호화 시도
    console.log('복호화 시작...');
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
        tagLength: 128 // AES-GCM 기본 태그 길이
      },
      key,
      encryptedBuffer
    );
    
    console.log('복호화 성공:', {
      originalSize: encryptedBuffer.byteLength,
      decryptedSize: decryptedBuffer.byteLength
    });
    
    // 복호화된 데이터 검증
    if (decryptedBuffer.byteLength === 0) {
      throw new Error('복호화된 데이터가 비어 있습니다');
    }
    
    // 처음 16바이트 확인
    const firstDecryptedBytes = new Uint8Array(decryptedBuffer.slice(0, 16));
    console.log('복호화된 데이터 처음 16바이트:', {
      hex: Array.from(firstDecryptedBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
      decimal: Array.from(firstDecryptedBytes)
    });
    
    // 텍스트 데이터인 경우 샘플 확인
    if (contentType.startsWith('text/')) {
      const decoder = new TextDecoder();
      const textSample = decoder.decode(
        decryptedBuffer.slice(0, Math.min(100, decryptedBuffer.byteLength))
      );
      console.log('복호화된 텍스트 샘플:', textSample);
    }
    
    return decryptedBuffer;
  } catch (error) {
    console.error('복호화 실패:', error);
    
    if (error instanceof Error) {
      // OperationError는 일반적으로 비밀번호 오류나 데이터 손상을 나타냄
      if (error.name === 'OperationError') {
        console.error('OperationError 세부 정보:', {
          ivLength: ivArray.length,
          encryptedSize: encryptedBuffer.byteLength,
          keyType: key.type,
          keyAlgorithm: key.algorithm.name
        });
        
        throw new Error('파일 복호화에 실패했습니다. 비밀번호가 올바르지 않거나 파일이 손상되었을 수 있습니다.');
      }
      
      // 다른 오류는 그대로 전파
      throw error;
    }
    
    throw new Error('알 수 없는 복호화 오류가 발생했습니다');
  }
}

/**
 * 이전 버전(레거시) 파일 복호화 함수
 */
export async function decryptLegacyFile(
  encryptedData: ArrayBuffer,
  ivBase64: string,
  password: string,
  saltBase64?: string,
  fileName: string = "downloaded_file",
  contentType: string = "application/octet-stream"
): Promise<File> {
  try {
    console.log('=== 레거시 파일 복호화 시작 ===');
    console.log('복호화 입력 정보:', {
      ivBase64Length: ivBase64?.length,
      hasSalt: !!saltBase64,
      encryptedDataSize: encryptedData.byteLength,
      passwordLength: password?.length,
      fileName,
      contentType
    });
    
    // Salt 디코딩 및 처리
    let saltArray: Uint8Array | undefined;
    if (saltBase64) {
      try {
        console.log('Salt 디코딩 시작...');
        saltArray = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
        console.log('Salt 디코딩 완료:', {
          length: saltArray.length,
          firstBytes: Array.from(saltArray.slice(0, 4))
        });
      } catch (err) {
        console.warn('Salt 디코딩 오류, salt 없이 키 유도를 시도합니다:', err);
      }
    }
    
    // IV 디코딩 및 검증
    let ivArray: Uint8Array;
    try {
      console.log('IV 디코딩 시작...');
      ivArray = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
      console.log('IV 디코딩 완료:', {
        length: ivArray.length,
        bytes: Array.from(ivArray)
      });
      
      // IV 길이 검증 및 조정
      if (ivArray.length !== 12) {
        console.warn('IV 길이가 올바르지 않습니다. 조정 중...');
        const adjustedIv = new Uint8Array(12);
        
        if (ivArray.length < 12) {
          // 짧은 경우 나머지를 0으로 채움
          adjustedIv.set(ivArray);
          console.log('IV가 12바이트보다 짧습니다. 나머지를 0으로 채웁니다.');
        } else {
          // 긴 경우 앞부분만 사용
          adjustedIv.set(ivArray.slice(0, 12));
          console.log('IV가 12바이트보다 깁니다. 앞부분만 사용합니다.');
        }
        
        ivArray = adjustedIv;
        console.log('조정된 IV:', {
          length: ivArray.length,
          bytes: Array.from(ivArray)
        });
      }
    } catch (err) {
      console.error('IV 디코딩 오류:', err);
      throw new Error('잘못된 IV 형식입니다');
    }
    
    // 키 유도 (saltArray 전달)
    console.log('키 유도 시작 (salt 사용:', !!saltArray, ')');
    const { key } = await deriveKeyFromPassword(password, saltArray);
    console.log('키 유도 완료');
    
    // 복호화
    console.log('복호화 시작...');
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivArray,
          tagLength: 128 // 표준 AES-GCM 태그 길이
        },
        key,
        encryptedData
      );
      
      console.log('복호화 성공:', {
        originalSize: encryptedData.byteLength,
        decryptedSize: decryptedBuffer.byteLength
      });
      
      // 결과 확인
      if (decryptedBuffer.byteLength === 0) {
        console.warn('복호화된 데이터가 비어 있습니다!');
      }
      
      // 처음 16바이트 확인
      const firstBytes = new Uint8Array(decryptedBuffer.slice(0, 16));
      console.log('복호화된 데이터 처음 16바이트:', {
        hex: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
        decimal: Array.from(firstBytes)
      });
      
      // 텍스트 데이터인 경우 샘플 확인
      if (contentType.startsWith('text/')) {
        const decoder = new TextDecoder();
        const textSample = decoder.decode(
          decryptedBuffer.slice(0, Math.min(100, decryptedBuffer.byteLength))
        );
        console.log('복호화된 텍스트 샘플:', textSample);
      }
      
      // 파일 생성
      return new File(
        [decryptedBuffer],
        fileName,
        { type: contentType }
      );
    } catch (error) {
      console.error('복호화 작업 실패:', error);
      
      if (error instanceof Error) {
        if (error.name === 'OperationError') {
          // 가장 일반적인 문제: 잘못된 비밀번호 또는 손상된 데이터
          throw new Error('복호화 실패: 비밀번호가 올바르지 않거나 파일이 손상되었습니다.');
        }
        
        // 다른 오류는 그대로 전파
        throw error;
      }
      
      throw new Error('알 수 없는 복호화 오류가 발생했습니다');
    }
  } catch (error) {
    console.error('전체 복호화 과정 오류:', error);
    throw error;
  }
}

/**
 * 수정된 복호화 함수 (호환성 유지)
 */
export async function decryptFileWithKeyHierarchy(
  encryptedData: ArrayBuffer,
  fileIv: string,
  encryptedFileKey?: string,
  fileKeyIv?: string,
  password: string,
  masterKeySalt?: string,
  originalFileName: string = "downloaded_file",
  originalContentType: string = "application/octet-stream",
  metadata?: any  // metaData.salt에 접근하기 위한 추가 매개변수
): Promise<File> {
  try {
    console.log('키 계층 구조로 복호화 시작...');
    console.log('입력값 검증:', {
      encryptedDataSize: encryptedData.byteLength,
      fileIvLength: fileIv?.length,
      encryptedFileKeyLength: encryptedFileKey?.length,
      fileKeyIvLength: fileKeyIv?.length,
      masterKeySaltLength: masterKeySalt?.length,
      passwordLength: password?.length
    });
    
    // 이전 버전 파일 감지
    const isLegacyFile = 
      !encryptedFileKey || 
      !fileKeyIv || 
      typeof encryptedFileKey === 'string' && encryptedFileKey.startsWith('undefined') ||
      typeof fileKeyIv === 'string' && fileKeyIv.startsWith('undefined');
    
    if (isLegacyFile) {
      console.log('이전 버전 파일 감지됨, 레거시 복호화 사용...');
      return await decryptLegacyFile(
        encryptedData,
        fileIv,
        password,
        masterKeySalt,
        originalFileName,
        originalContentType
      );
    }
    
    // 새 키 계층 구조 복호화
    console.log('새 키 계층 구조 복호화 사용...');
    
    // Base64 디코딩
    let fileIvArray: Uint8Array;
    let encryptedFileKeyArray: Uint8Array;
    let fileKeyIvArray: Uint8Array;
    let masterKeySaltArray: Uint8Array;
    
    try {
      fileIvArray = safeAtob(fileIv);
      encryptedFileKeyArray = safeAtob(encryptedFileKey!);
      fileKeyIvArray = safeAtob(fileKeyIv!);
      masterKeySaltArray = safeAtob(masterKeySalt!);
      
      console.log('디코딩 완료:', {
        fileIvLength: fileIvArray.length,
        encryptedFileKeyLength: encryptedFileKeyArray.length,
        fileKeyIvLength: fileKeyIvArray.length,
        masterKeySaltLength: masterKeySaltArray.length
      });
    } catch (error) {
      console.error('Base64 디코딩 실패:', error);
      throw new Error('암호화 데이터 형식이 올바르지 않습니다');
    }
    
    // 1. 마스터 키 유도
    const { masterKey } = await deriveMasterKey(password, masterKeySaltArray);
    console.log('마스터 키 유도 완료');
    
    // 2. 파일 키 복호화
    const encryptedFileKeyBuffer = new ArrayBuffer(encryptedFileKeyArray.length);
    const encryptedFileKeyView = new Uint8Array(encryptedFileKeyBuffer);
    encryptedFileKeyView.set(encryptedFileKeyArray);
    
    const fileKey = await unwrapFileKey(
      masterKey,
      encryptedFileKeyBuffer,
      fileKeyIvArray
    );
    console.log('파일 키 복호화 완료');
    
    // 3. 파일 복호화
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: fileIvArray
        },
        fileKey,
        encryptedData
      );
      console.log('파일 복호화 완료, 크기:', decryptedBuffer.byteLength);
      
      return new File(
        [decryptedBuffer],
        originalFileName,
        { type: originalContentType || 'application/octet-stream' }
      );
    } catch (error) {
      console.error('파일 복호화 작업 실패:', error);
      throw new Error('파일 복호화에 실패했습니다. 올바른 비밀번호인지 확인하세요.');
    }
  } catch (error) {
    console.error('파일 복호화 실패:', error);
    throw error;
  }
}

/**
 * 파일 복호화
 */
export async function decryptFile(
  encryptedFile: Blob,
  password: string,
  metadata: {
    ivVector: string;
    encryptedFileKey?: string;
    fileKeyIv?: string;
    masterKeySalt?: string;
    metaData?: {
      salt?: string;
      [key: string]: any;
    };
  }
): Promise<Blob> {
  try {
    console.log("=== 파일 복호화 시작 ===");
    console.log("입력값:", {
      fileSize: encryptedFile.size,
      hasIv: !!metadata.ivVector,
      hasEncryptedFileKey: !!metadata.encryptedFileKey,
      hasFileKeyIv: !!metadata.fileKeyIv,
      hasMasterKeySalt: !!metadata.masterKeySalt,
      hasMetaData: !!metadata.metaData,
      hasMetaDataSalt: !!metadata.metaData?.salt
    });

    // Salt 검색 경로 확장
    let saltToUse: string | undefined;
    if (metadata.masterKeySalt) {
      console.log('masterKeySalt 사용');
      saltToUse = metadata.masterKeySalt;
    } else if (metadata?.metaData?.salt) {
      console.log('metaData.salt 사용');
      saltToUse = metadata.metaData.salt;
    } else {
      console.log('사용 가능한 salt가 없습니다');
    }

    // Base64 디코딩
    let masterKeySaltArray: Uint8Array | undefined;
    if (saltToUse) {
      try {
        masterKeySaltArray = safeAtob(saltToUse);
        console.log('Salt 디코딩 성공, 길이:', masterKeySaltArray.length);
      } catch (e) {
        console.warn('Salt 디코딩 실패, salt 없이 시도:', e);
      }
    }

    // 파일 유형 확인 (키 계층 구조 사용 여부)
    const isLegacyFile = !metadata.encryptedFileKey || !metadata.fileKeyIv;
    console.log('이전 버전 파일:', isLegacyFile);

    // 레거시 복호화 방식 사용
    if (isLegacyFile) {
      try {
        // IV 디코딩
        let ivArray: Uint8Array;
        try {
          ivArray = safeAtob(metadata.ivVector);
          console.log('IV 디코딩 성공, 길이:', ivArray.length);
        } catch (error) {
          console.error('IV 디코딩 실패:', error);
          throw new Error('IV 디코딩에 실패했습니다');
        }
        
        // 키 유도
        const { key } = await deriveKeyFromPassword(password, masterKeySaltArray);
        console.log('키 유도 성공');
        
        // 파일 복호화
        const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: ivArray
          },
          key,
          await encryptedFile.arrayBuffer()
        );
        
        console.log('파일 복호화 성공, 크기:', decryptedArrayBuffer.byteLength);
        return new Blob([decryptedArrayBuffer]);
      } catch (e) {
        console.error('복호화 실패:', e);
        throw e;
      }
    }

    // 새로운 버전 복호화 방식
    if (!metadata.encryptedFileKey || !metadata.fileKeyIv) {
      throw new Error("암호화된 파일 키 또는 IV가 없습니다.");
    }

    // 마스터 키 유도
    const { key: masterKey } = await deriveKeyFromPassword(password, masterKeySaltArray);
    console.log('마스터 키 유도 성공');

    // 파일 키 복호화
    let fileKeyIvArray: Uint8Array;
    let encryptedFileKeyArray: Uint8Array;
    
    try {
      fileKeyIvArray = safeAtob(metadata.fileKeyIv);
      encryptedFileKeyArray = safeAtob(metadata.encryptedFileKey);
    } catch (error) {
      console.error('파일 키 관련 데이터 디코딩 실패:', error);
      throw new Error('파일 키 데이터 디코딩에 실패했습니다');
    }
    
    const fileKeyArrayBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fileKeyIvArray
      },
      masterKey,
      encryptedFileKeyArray
    );
    
    const fileKey = await window.crypto.subtle.importKey(
      "raw",
      fileKeyArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    console.log('파일 키 복호화 성공');

    // 파일 복호화
    let ivArray: Uint8Array;
    try {
      ivArray = safeAtob(metadata.ivVector);
    } catch (error) {
      console.error('IV 디코딩 실패:', error);
      throw new Error('IV 디코딩에 실패했습니다');
    }
    
    const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray
      },
      fileKey,
      await encryptedFile.arrayBuffer()
    );
    
    console.log('파일 복호화 성공, 크기:', decryptedArrayBuffer.byteLength);
    return new Blob([decryptedArrayBuffer]);
  } catch (error) {
    console.error("파일 복호화 중 오류:", error);
    throw error;
  }
}

/**
 * Uint8Array를 Base64 문자열로 인코딩
 */
export function encodeUint8ArrayToBase64(array: Uint8Array): string {
  const binaryString = String.fromCharCode.apply(null, Array.from(array));
  return btoa(binaryString);
}

/**
 * Base64 문자열을 Uint8Array로 디코딩
 */
export function decodeBase64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 파일 복호화 처리 함수
 */
export async function handleFileDecryption(
  encryptedBuffer: ArrayBuffer,
  metadata: FileMetadata,
  password: string,
  onProgress?: (progress: number) => void,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<File> {
  try {
    console.log('=== 파일 복호화 처리 시작 ===');
    console.log('파일 메타데이터:', {
      id: metadata.id,
      name: metadata.name,
      contentType: metadata.contentType,
      hasIv: !!metadata.ivVector,
      hasEncryptedFileKey: !!metadata.encryptedFileKey,
      hasFileKeyIv: !!metadata.fileKeyIv,
      hasMasterKeySalt: !!metadata.masterKeySalt,
      hasMetaData: !!metadata.metaData,
      hasMetaDataSalt: !!metadata.metaData?.salt
    });

    // 메타데이터 검증
    if (!metadata.ivVector) {
      throw new Error('필수 암호화 정보(IV)가 없습니다.');
    }

    // 진행률 업데이트
    onProgress?.(10);

    // 복호화 시도
    const decryptedBlob = await decryptFile(
      new Blob([encryptedBuffer]),
      password,
      {
        ivVector: metadata.ivVector,
        encryptedFileKey: metadata.encryptedFileKey,
        fileKeyIv: metadata.fileKeyIv,
        masterKeySalt: metadata.masterKeySalt,
        metaData: metadata.metaData
      }
    );

    // 파일 생성
    const decryptedFile = new File(
      [decryptedBlob],
      metadata.name,
      { type: metadata.contentType }
    );

    console.log('복호화 완료:', {
      fileName: decryptedFile.name,
      size: decryptedFile.size,
      type: decryptedFile.type
    });

    // 진행률 업데이트
    onProgress?.(100);
    onSuccess?.();

    return decryptedFile;
  } catch (error) {
    console.error('파일 복호화 처리 오류:', error);
    
    // 에러 처리
    const errorMessage = error instanceof Error 
      ? error.message 
      : '파일 복호화에 실패했습니다.';
    
    onError?.(new Error(errorMessage));
    throw error;
  }
}

/**
 * 파일 다운로드 처리 함수
 */
export function downloadFile(file: File): void {
  try {
    console.log('파일 다운로드 시작:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 다운로드 링크 생성
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    
    // 다운로드 실행
    document.body.appendChild(a);
    a.click();
    
    // 정리
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('다운로드 완료 및 정리');
    }, 100);
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    throw error;
  }
}

/**
 * 파일 메타데이터 타입 정의
 */
export interface FileMetadata {
  id: string;
  name: string;
  contentType: string;
  ivVector: string;
  encryptedFileKey?: string;
  fileKeyIv?: string;
  masterKeySalt?: string;
  metaData?: {
    salt?: string;
    [key: string]: any;
  };
}

/**
 * 메타데이터에서 암호화 정보 추출
 */
function extractEncryptionMetadata(metadata: FileMetadata): {
  salt: Uint8Array | undefined;
  iv: Uint8Array | undefined;
} {
  try {
    console.log('=== 암호화 메타데이터 추출 시작 ===');
    console.log('원본 메타데이터:', {
      hasSalt: !!metadata.metaData?.salt,
      hasIv: !!metadata.metaData?.iv
    });

    let salt: Uint8Array | undefined;
    let iv: Uint8Array | undefined;

    // Salt 추출
    if (metadata.metaData?.salt) {
      try {
        console.log('Salt 디코딩 시작...');
        salt = Uint8Array.from(atob(metadata.metaData.salt), c => c.charCodeAt(0));
        console.log('Salt 디코딩 완료:', {
          length: salt.length,
          firstBytes: Array.from(salt.slice(0, 4))
        });
      } catch (err) {
        console.warn('Salt 디코딩 실패:', err);
      }
    }

    // IV 추출
    if (metadata.metaData?.iv) {
      try {
        console.log('IV 디코딩 시작...');
        iv = Uint8Array.from(atob(metadata.metaData.iv), c => c.charCodeAt(0));
        console.log('IV 디코딩 완료:', {
          length: iv.length,
          firstBytes: Array.from(iv.slice(0, 4))
        });
      } catch (err) {
        console.warn('IV 디코딩 실패:', err);
      }
    }

    console.log('암호화 메타데이터 추출 결과:', {
      hasSalt: !!salt,
      hasIv: !!iv,
      saltLength: salt?.length,
      ivLength: iv?.length
    });

    return { salt, iv };
  } catch (error) {
    console.error('메타데이터 추출 중 오류:', error);
    throw error;
  }
}

/**
 * 파일 다운로드 및 복호화 처리 함수
 */
export async function handleDownloadAndDecrypt(
  fileId: string,
  password: string,
  metadata: FileMetadata | null = null,
  onProgress?: (progress: number) => void,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    console.log('=== 파일 다운로드 및 복호화 시작 ===');
    
    // 비밀번호 검증
    if (!password) {
      throw new Error('비밀번호를 입력해주세요.');
    }
    
    // 진행률 업데이트
    onProgress?.(10);
    
    // 1. 파일 메타데이터 가져오기 (없는 경우)
    let fileMetadata = metadata;
    if (!fileMetadata) {
      console.log('메타데이터 가져오기 시작...');
      const response = await fetch(`/api/files/metadata/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`메타데이터 가져오기 실패 (${response.status}: ${response.statusText})`);
      }
      
      fileMetadata = await response.json();
      console.log('메타데이터 가져오기 완료:', fileMetadata);
    }
    
    if (!fileMetadata) {
      throw new Error('파일 메타데이터를 가져올 수 없습니다.');
    }
    
    onProgress?.(20);
    
    // 2. 암호화 메타데이터 추출
    const { salt, iv } = extractEncryptionMetadata(fileMetadata);
    
    console.log('복호화 정보:', {
      fileName: fileMetadata.name,
      contentType: fileMetadata.contentType,
      hasSalt: !!salt,
      hasIv: !!iv,
      saltLength: salt?.length,
      ivLength: iv?.length
    });
    
    if (!iv) {
      throw new Error('IV 정보가 없습니다. 파일 메타데이터가 잘못되었습니다.');
    }
    
    // 3. 파일 다운로드
    onProgress?.(30);
    console.log('파일 다운로드 시작...');
    
    const fileResponse = await fetch(`/api/files/download/${fileId}`);
    if (!fileResponse.ok) {
      throw new Error(`파일 다운로드 실패 (${fileResponse.status}: ${fileResponse.statusText})`);
    }
    
    const encryptedBuffer = await fileResponse.arrayBuffer();
    console.log('암호화된 파일 다운로드 완료:', {
      size: encryptedBuffer.byteLength
    });
    
    onProgress?.(50);
    
    // 4. 파일 복호화
    console.log('파일 복호화 시작...');
    const decryptedFile = await handleFileDecryption(
      encryptedBuffer,
      fileMetadata,
      password,
      (progress) => onProgress?.(50 + progress * 0.4), // 50-90% 범위
      () => onProgress?.(90),
      onError
    );
    
    onProgress?.(90);
    
    // 5. 파일 다운로드 처리
    console.log('복호화된 파일 다운로드 시작...');
    downloadFile(decryptedFile);
    
    onProgress?.(100);
    onSuccess?.();
    
    console.log('=== 파일 다운로드 및 복호화 완료 ===');
  } catch (error) {
    console.error('파일 처리 오류:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : '파일 다운로드 및 복호화에 실패했습니다.';
    
    onError?.(new Error(errorMessage));
    throw error;
  }
}