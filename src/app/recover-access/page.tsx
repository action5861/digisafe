'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recoverMasterKey, deriveMasterKey } from '@/lib/encryption/key-management';

export default function RecoverAccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 1단계: 사용자 확인
  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 사용자 복구 정보 확인
      const response = await fetch(`/api/user/recovery-info?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '사용자 정보를 확인할 수 없습니다.');
      }
      
      const data = await response.json();
      
      // 복구 기능이 비활성화되어 있는 경우
      if (!data.recoveryEnabled) {
        throw new Error('이 계정에는 복구 옵션이 설정되어 있지 않습니다.');
      }
      
      // 다음 단계로
      setStep(2);
    } catch (error: any) {
      console.error('User verification error:', error);
      setError(error.message || '사용자 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 2단계: 마스터 키 복구 및 새 비밀번호 설정
  const handleRecoverAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryPassword || !newPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 1. 복구 정보 가져오기
      const recoveryResponse = await fetch(`/api/user/recovery-data?email=${encodeURIComponent(email)}`);
      
      if (!recoveryResponse.ok) {
        throw new Error('복구 데이터를 가져오는데 실패했습니다.');
      }
      
      const recoveryData = await recoveryResponse.json();
      
      // 2. 마스터 키 복구 시도
      const encryptedMasterKey = Uint8Array.from(
        atob(recoveryData.encryptedMasterKey), c => c.charCodeAt(0)
      ).buffer;
      
      const salt = Uint8Array.from(
        atob(recoveryData.masterKeySalt), c => c.charCodeAt(0)
      );
      
      const iv = Uint8Array.from(
        atob(recoveryData.masterKeyIv), c => c.charCodeAt(0)
      );
      
      // 복구 비밀번호로 마스터 키 복구 시도
      const recoveredMasterKey = await recoverMasterKey(
        encryptedMasterKey,
        recoveryPassword,
        salt,
        iv
      );
      
      // 3. 새 비밀번호로 마스터 키 다시 암호화
      const { masterKey: newMasterKey, salt: newSalt } = await deriveMasterKey(newPassword);
      
      // 4. 암호화된 파일 키들 재암호화 (서버에서 처리)
      const resetResponse = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword,
          newMasterKeySalt: btoa(String.fromCharCode(...newSalt)),
        }),
      });
      
      if (!resetResponse.ok) {
        throw new Error('비밀번호 재설정 중 오류가 발생했습니다.');
      }
      
      // 성공 시 로그인 페이지로 이동
      router.push('/login?reset=success');
    } catch (error: any) {
      console.error('Recovery error:', error);
      setError(error.message || '비밀번호 복구 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            계정 접근 복구
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            복구 비밀번호를 사용하여 계정에 다시 접근하세요.
          </p>
        </div>
        
        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyUser}>
            <div>
              <label htmlFor="email" className="sr-only">이메일 주소</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '확인 중...' : '다음'}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRecoverAccess}>
            <div className="space-y-4">
              <div>
                <label htmlFor="recoveryPassword" className="sr-only">복구 비밀번호</label>
                <Input
                  id="recoveryPassword"
                  name="recoveryPassword"
                  type="password"
                  required
                  placeholder="복구 비밀번호"
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="sr-only">새 비밀번호</label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="confirmNewPassword" className="sr-only">새 비밀번호 확인</label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  placeholder="새 비밀번호 확인"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '처리 중...' : '비밀번호 재설정'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 