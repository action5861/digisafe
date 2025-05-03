// 마스터 키(KEK) 유도 함수
export async function deriveMasterKey(
  password: string,
  providedSalt?: Uint8Array
): Promise<{ masterKey: CryptoKey; salt: Uint8Array }> {
  try {
    console.log("=== 마스터 키 유도 시작 ===");
    
    // Salt 검증 및 생성
    let salt: Uint8Array;
    if (providedSalt && providedSalt.length > 0) {
      salt = providedSalt;
      console.log("제공된 Salt 사용:", {
        length: salt.length,
        firstBytes: Array.from(salt.slice(0, 4))
      });
    } else {
      salt = window.crypto.getRandomValues(new Uint8Array(16));
      console.log("새 Salt 생성:", {
        length: salt.length,
        firstBytes: Array.from(salt.slice(0, 4))
      });
    }
    
    // 비밀번호에서 키 재료 생성
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // 마스터 키 유도 - 이 부분이 중요!
    const masterKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000, // 반복 횟수 일관성 유지
        hash: "SHA-256",
      },
      keyMaterial,
      { 
        name: "AES-GCM", 
        length: 256 
      },
      true, // extractable을 반드시 true로 설정
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"] // 모든 필요한 권한 포함
    );
    
    console.log("마스터 키 유도 완료:", {
      algorithm: masterKey.algorithm.name,
      extractable: masterKey.extractable,
      usages: masterKey.usages
    });
    
    return { masterKey, salt };
  } catch (error) {
    console.error("마스터 키 유도 실패:", error);
    throw error;
  }
}

// 파일 암호화 키(DEK) 생성 함수
export async function generateFileKey(): Promise<CryptoKey> {
  try {
    // 각 파일마다 새로운 랜덤 키 생성
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true, // extractable을 true로 설정
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("파일 키 생성 실패:", error);
    throw new Error("파일 암호화 키 생성 중 오류가 발생했습니다.");
  }
}

// 마스터 키를 사용하여 파일 키 래핑(암호화)
export async function wrapFileKey(
  masterKey: CryptoKey,
  fileKey: CryptoKey
): Promise<{ wrappedKey: ArrayBuffer; iv: Uint8Array }> {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const wrappedKey = await window.crypto.subtle.wrapKey(
      "raw", // 내보내기 형식
      fileKey,
      masterKey,
      {
        name: "AES-GCM",
        iv: iv
      }
    );
    
    return { wrappedKey, iv };
  } catch (error) {
    console.error("파일 키 래핑 실패:", error);
    throw new Error("파일 키 암호화 중 오류가 발생했습니다.");
  }
}

// 래핑된 파일 키 언래핑(복호화)
export async function unwrapFileKey(
  masterKey: CryptoKey,
  wrappedKey: ArrayBuffer,
  iv: Uint8Array
): Promise<CryptoKey> {
  try {
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

// 마스터 키를 암호화하여 안전하게 저장
export async function encryptMasterKeyBackup(
  masterKey: CryptoKey,
  backupPassword: string
): Promise<{ encryptedMasterKey: ArrayBuffer; salt: Uint8Array; iv: Uint8Array }> {
  try {
    // 백업 비밀번호로 키 유도
    const { masterKey: backupKey, salt } = await deriveMasterKey(backupPassword);
    
    // 마스터 키를 내보내기
    const exportedMasterKey = await window.crypto.subtle.exportKey("raw", masterKey);
    
    // 백업 키로 마스터 키 암호화
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedMasterKey = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      backupKey,
      exportedMasterKey
    );
    
    return { encryptedMasterKey, salt, iv };
  } catch (error) {
    console.error("마스터 키 백업 암호화 실패:", error);
    throw new Error("복구 키 생성 중 오류가 발생했습니다.");
  }
}

// 백업 비밀번호로 마스터 키 복구
export async function recoverMasterKey(
  encryptedMasterKey: ArrayBuffer,
  backupPassword: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<CryptoKey> {
  try {
    // 백업 비밀번호로 키 유도
    const { masterKey: backupKey } = await deriveMasterKey(backupPassword, salt);
    
    // 암호화된 마스터 키 복호화
    const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      backupKey,
      encryptedMasterKey
    );
    
    // 복호화된 키 데이터로 마스터 키 가져오기
    return await window.crypto.subtle.importKey(
      "raw",
      decryptedKeyBuffer,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  } catch (error) {
    console.error("마스터 키 복구 실패:", error);
    throw new Error("마스터 키 복구 중 오류가 발생했습니다. 올바른 복구 비밀번호인지 확인하세요.");
  }
} 