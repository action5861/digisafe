'use client';

import { useState } from 'react';
import { decryptFile } from '@/lib/encryption/client-encryption';
import { useRouter } from 'next/navigation';

interface FileMetadata {
  name: string;
  contentType: string;
  ivVector: string;
  encryptedFileKey?: string;
  fileKeyIv?: string;
  masterKeySalt?: string;
  metaData?: {
    salt?: string;
  };
}

// 암호화 유틸리티 함수들
async function deriveKeyFromPassword(password: string, salt?: Uint8Array) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
  
  return { key, salt };
}

// Base64 디코딩을 위한 안전한 함수
function safeAtob(base64: string): Uint8Array {
  try {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  } catch (e) {
    console.error('Base64 디코딩 실패:', e);
    throw new Error('잘못된 Base64 형식입니다');
  }
}

async function unwrapFileKey(
  masterKey: CryptoKey,
  wrappedKey: ArrayBuffer,
  iv: Uint8Array
): Promise<CryptoKey> {
  try {
    console.log('=== unwrapFileKey 내부 ===');
    console.log('crypto.subtle.unwrapKey 호출 전:', {
      masterKeyValid: !!masterKey,
      wrappedKeyLength: wrappedKey.byteLength,
      ivLength: iv.length,
      ivBytes: Array.from(iv)
    });

    return await window.crypto.subtle.unwrapKey(
      "raw",
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

// Base64 인코딩/디코딩 함수
function encodeToBase64(array: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

function decodeFromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// IV 길이 보장 함수
function ensureIvLength(ivArray: Uint8Array, targetLength: number = 12): Uint8Array {
  if (ivArray.length === targetLength) {
    return ivArray;
  }
  
  console.log(`IV 길이 조정: ${ivArray.length} → ${targetLength}`);
  
  const result = new Uint8Array(targetLength);
  
  if (ivArray.length < targetLength) {
    // 짧은 경우 나머지를 0으로 채움
    result.set(ivArray);
  } else {
    // 긴 경우 필요한 만큼만 사용
    result.set(ivArray.subarray(0, targetLength));
  }
  
  return result;
}

async function decryptFileWithKeyHierarchy(
  encryptedData: ArrayBuffer,
  ivVector: string,
  encryptedFileKey: string,
  fileKeyIv: string,
  password: string,
  masterKeySalt?: string,
  fileName: string = "downloaded_file",
  contentType: string = "application/octet-stream",
  metadata?: any
): Promise<File> {
  try {
    console.log("=== 복호화 과정 시작 ===");
    
    // 입력값 유효성 검사
    if (!ivVector || !encryptedFileKey || !fileKeyIv) {
      throw new Error("필수 암호화 데이터가 누락되었습니다");
    }
    
    // Salt 처리 - metaData.salt 활용
    let saltToUse = masterKeySalt;
    if (!saltToUse && metadata?.metaData?.salt) {
      console.log("masterKeySalt가 null이므로 metaData.salt 사용");
      saltToUse = metadata.metaData.salt;
    }
    
    if (!saltToUse) {
      console.warn("사용 가능한 Salt가 없습니다");
    }
    
    // Base64 디코딩 및 IV 길이 처리
    let fileIvArray: Uint8Array;
    let encryptedFileKeyArray: Uint8Array;
    let fileKeyIvArray: Uint8Array;
    let masterKeySaltArray: Uint8Array | undefined;
    
    try {
      fileIvArray = ensureIvLength(decodeFromBase64(ivVector), 12);
      encryptedFileKeyArray = decodeFromBase64(encryptedFileKey);
      fileKeyIvArray = ensureIvLength(decodeFromBase64(fileKeyIv), 12);
      
      if (saltToUse) {
        masterKeySaltArray = decodeFromBase64(saltToUse);
      }
      
      console.log("디코딩 완료:", {
        fileIvLength: fileIvArray.length,
        encryptedFileKeyLength: encryptedFileKeyArray.length,
        fileKeyIvLength: fileKeyIvArray.length,
        masterKeySaltLength: masterKeySaltArray?.length
      });
    } catch (error) {
      console.error("Base64 디코딩 실패:", error);
      throw new Error("암호화 데이터 형식이 올바르지 않습니다");
    }
    
    // 마스터 키 유도
    const { key: masterKey } = await deriveKeyFromPassword(password, masterKeySaltArray);
    
    // 파일 키 언래핑
    console.log("=== 파일 키 복호화 시작 ===");
    console.log("unwrapFileKey 호출 전:", {
      masterKeyValid: !!masterKey,
      encryptedFileKeyLength: encryptedFileKeyArray.length,
      fileKeyIvLength: fileKeyIvArray.length
    });
    
    const fileKey = await unwrapFileKey(
      masterKey,
      encryptedFileKeyArray.buffer as ArrayBuffer,
      fileKeyIvArray
    );
    
    console.log("파일 키 복호화 성공");
    
    // 파일 복호화
    console.log("=== 파일 데이터 복호화 시작 ===");
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: fileIvArray
      },
      fileKey,
      encryptedData
    );
    
    console.log("파일 복호화 성공:", {
      encryptedSize: encryptedData.byteLength,
      decryptedSize: decryptedBuffer.byteLength
    });
    
    // 파일 생성
    return new File(
      [decryptedBuffer],
      fileName,
      { type: contentType || 'application/octet-stream' }
    );
  } catch (error) {
    console.error("파일 복호화 실패:", error);
    throw error;
  }
}

async function decryptLegacyFile(
  encryptedBuffer: ArrayBuffer,
  ivVector: string,
  password: string,
  salt?: string,
  fileName: string = '',
  contentType: string = 'application/octet-stream'
): Promise<File> {
  const { key } = await deriveKeyFromPassword(password, salt ? decodeFromBase64(salt) : undefined);
  
  const fileIvArray = ensureIvLength(decodeFromBase64(ivVector));
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fileIvArray
    },
    key,
    encryptedBuffer
  );
  
  return new File([decryptedBuffer], fileName, { type: contentType });
}

export default function FileDownloadPage({ params }: { params: { fileId: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState<FileMetadata | null>(null);
  
  // 파일 메타데이터 가져오기
  const fetchFileMetadata = async () => {
    try {
      const response = await fetch(`/api/files/${params.fileId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 정보를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      if (!data.file) {
        throw new Error('파일 정보를 찾을 수 없습니다.');
      }
      
      setFileData(data.file);
      console.log('파일 메타데이터:', data.file);
      
      return data.file;
    } catch (error) {
      console.error('메타데이터 가져오기 실패:', error);
      setError(error instanceof Error ? error.message : '파일 정보를 불러올 수 없습니다.');
      throw error;
    }
  };
  
  // 파일 다운로드 및 복호화
  const handleDownloadAndDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setProgress(10);
      
      // 1. 파일 메타데이터 가져오기 (아직 로드되지 않은 경우)
      const metadata = fileData || await fetchFileMetadata();
      setProgress(20);
      
      console.log('파일 메타데이터:', {
        id: metadata.id,
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        ivVector: metadata.ivVector,
        encryptedFileKey: metadata.encryptedFileKey,
        fileKeyIv: metadata.fileKeyIv,
        masterKeySalt: metadata.masterKeySalt,
        metaData: metadata.metaData
      });
      
      // 2. 암호화된 파일 다운로드
      console.log('파일 다운로드 시도:', params.fileId);
      
      try {
        setProgress(30);
        const fileResponse = await fetch(`/api/files/download/${params.fileId}`);
        
        if (!fileResponse.ok) {
          console.error('파일 다운로드 실패:', fileResponse.status, fileResponse.statusText);
          throw new Error(`파일 다운로드에 실패했습니다. (${fileResponse.status}: ${fileResponse.statusText})`);
        }
        
        setProgress(50);
        
        // 응답 정보 확인
        console.log('파일 응답 정보:', {
          status: fileResponse.status,
          statusText: fileResponse.statusText,
          headers: {
            contentType: fileResponse.headers.get('Content-Type'),
            contentLength: fileResponse.headers.get('Content-Length'),
            contentDisposition: fileResponse.headers.get('Content-Disposition')
          }
        });
        
        // 응답을 바이너리 데이터로 읽기
        const encryptedBuffer = await fileResponse.arrayBuffer();
        console.log('다운로드된 암호화 파일 크기:', encryptedBuffer.byteLength);
        
        if (encryptedBuffer.byteLength === 0) {
          throw new Error('다운로드된 파일이 비어 있습니다.');
        }
        
        setProgress(60);
        
        // 3. 복호화 실행 - 여러 방법 시도
        console.log('파일 복호화 시작:', {
          encryptedDataSize: encryptedBuffer.byteLength,
          fileIv: metadata.ivVector?.substring(0, 10) + '...',
          passwordLength: password.length,
          metaDataSalt: metadata.metaData?.salt?.substring(0, 10) + '...'
        });
        
        let decryptedFile = null;
        
        // 방법 1: 키 계층 구조 (masterKeySalt 또는 metaData.salt 사용)
        try {
          console.log('방법 1: 키 계층 구조 복호화 시도');
          decryptedFile = await decryptFileWithKeyHierarchy(
            encryptedBuffer,
            metadata.ivVector,
            metadata.encryptedFileKey,
            metadata.fileKeyIv,
            password,
            metadata.masterKeySalt,
            metadata.name,
            metadata.contentType,
            metadata
          );
          console.log('방법 1 성공');
        } catch (e) {
          console.log('첫 번째 방법 실패, 다음 시도:', e);
        }
        
        // 방법 2: 레거시 복호화 (실패 시 시도)
        if (!decryptedFile) {
          try {
            console.log('방법 2: 레거시 복호화 시도');
            decryptedFile = await decryptLegacyFile(
              encryptedBuffer,
              metadata.ivVector,
              password,
              metadata.metaData?.salt,  // 메타데이터에서 salt 사용
              metadata.name,
              metadata.contentType
            );
            console.log('방법 2 성공');
          } catch (e) {
            console.log('두 번째 방법도 실패:', e);
          }
        }
        
        // 모든 방법 실패 시
        if (!decryptedFile) {
          throw new Error('모든 복호화 방법이 실패했습니다. 비밀번호를 확인하세요.');
        }
        
        setProgress(90);
        
        // 4. 복호화된 파일 다운로드
        const url = URL.createObjectURL(decryptedFile);
        console.log('파일 URL 생성:', url);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = metadata.name;
        document.body.appendChild(a);
        a.click();
        
        // 정리
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 1000);
        
      } catch (downloadError: unknown) {
        console.error('파일 다운로드 단계 오류:', downloadError);
        throw new Error(`파일 다운로드 중 오류: ${downloadError instanceof Error ? downloadError.message : '알 수 없는 오류'}`);
      }
      
    } catch (error: any) {
      console.error('전체 프로세스 오류:', error);
      setError(error instanceof Error ? error.message : '파일 복호화에 실패했습니다.');
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">파일 다운로드</h1>
      
      <form onSubmit={handleDownloadAndDecrypt} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">암호화 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="파일 암호화에 사용한 비밀번호"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {loading && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {progress < 50 ? '파일 다운로드 중...' : 
               progress < 90 ? '파일 복호화 중...' : '완료 중...'}
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? '처리 중...' : '복호화 및 다운로드'}
        </button>
      </form>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>비밀번호를 잊어버리셨나요?</p>
        <a href="/recover-access" className="text-blue-600 hover:underline">
          복구 옵션을 사용하여 접근 복구하기
        </a>
      </div>
    </div>
  );
} 