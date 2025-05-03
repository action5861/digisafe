// src/components/dashboard/file-upload-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { initializeEncryption, deriveKeyFromPassword, encryptFileWithKeyHierarchy } from '@/lib/encryption/client-encryption';

interface FileUploadFormProps {
  userId?: string;
  onFileUploaded?: () => void;
}

export default function FileUploadForm({ userId, onFileUploaded }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // 암호화 라이브러리 초기화
  useEffect(() => {
    async function initEncryption() {
      try {
        const initialized = await initializeEncryption();
        if (!initialized) {
          throw new Error('Failed to initialize encryption');
        }
        setEncryptionReady(true);
        console.log('Encryption initialized successfully');
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        setStatus('암호화 초기화 실패');
        setError('암호화 모듈을 초기화할 수 없습니다.');
      }
    }
    
    initEncryption();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('');
      setError('');
      setProgress(0);
    }
  };

  const validateForm = () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return false;
    }
    
    if (!password) {
      setError('암호화 비밀번호를 입력해주세요.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      setProgress(0);
      setError('');

      // 1. 파일 암호화
      const {
        encryptedBlob,
        fileIv,
        encryptedFileKey,
        fileKeyIv,
        masterKeySalt
      } = await encryptFileWithKeyHierarchy(file!, password);

      // 2. FormData 생성
      const formData = new FormData();
      formData.append('file', encryptedBlob);
      formData.append('filename', file!.name);
      formData.append('contentType', file!.type);
      formData.append('size', file!.size.toString());
      formData.append('ivVector', fileIv);
      formData.append('encryptedFileKey', encryptedFileKey);
      formData.append('fileKeyIv', fileKeyIv);
      formData.append('masterKeySalt', masterKeySalt);

      // 3. 파일 업로드
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
      }

      const data = await response.json();
      console.log('파일 업로드 성공:', data);
      setProgress(100);
      setStatus('업로드 완료!');
      onFileUploaded?.();
    } catch (error) {
      console.error('파일 업로드 오류:', error);
      setError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            파일 선택
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={!encryptionReady || isEncrypting || isUploading}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              선택된 파일: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            암호화 비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!encryptionReady || isEncrypting || isUploading}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="최소 8자 이상"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!encryptionReady || isEncrypting || isUploading}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {(isEncrypting || isUploading) && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">{status}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!encryptionReady || isEncrypting || isUploading || !file || !password || !confirmPassword}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEncrypting ? '암호화 중...' : isUploading ? '업로드 중...' : '암호화 후 업로드'}
        </button>
        
        <p className="mt-4 text-xs text-gray-500">
          모든 파일은 업로드 전 귀하의 브라우저에서 암호화됩니다. 
          DigiSafe는 암호화되지 않은 파일에 접근할 수 없습니다.
          <br />
          <span className="font-medium">중요:</span> 암호화 비밀번호를 잊어버리면 파일을 복구할 수 없습니다.
        </p>
      </form>
    </div>
  );
}