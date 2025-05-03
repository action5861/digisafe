'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { encryptMasterKeyBackup } from '@/lib/encryption/key-management';
import { deriveMasterKey } from '@/lib/encryption/key-management';

export default function KeyRecoverySetup() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSetupRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !recoveryPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (recoveryPassword !== confirmRecoveryPassword) {
      setError('복구 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // 1. 현재 비밀번호로 마스터 키 유도
      // 실제 구현에서는 서버에서 사용자의 저장된 salt를 가져와야 함
      const { masterKey, salt } = await deriveMasterKey(currentPassword);
      
      // 2. 복구 비밀번호로 마스터 키 백업 암호화
      const { encryptedMasterKey, salt: backupSalt, iv } = 
        await encryptMasterKeyBackup(masterKey, recoveryPassword);
      
      // 3. 암호화된 마스터 키와 관련 데이터를 서버에 저장
      const response = await fetch('/api/user/key-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedMasterKey: btoa(String.fromCharCode(...new Uint8Array(encryptedMasterKey))),
          masterKeySalt: btoa(String.fromCharCode(...salt)),
          masterKeyIv: btoa(String.fromCharCode(...iv)),
          recoveryEnabled: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('복구 설정 저장 중 오류가 발생했습니다.');
      }
      
      setSuccess(true);
    } catch (error: any) {
      console.error('Recovery setup error:', error);
      setError(error.message || '복구 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">키 복구 설정</h2>
      
      {success ? (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-700">
            복구 비밀번호 설정이 완료되었습니다. 이 비밀번호를 안전한 곳에 보관하세요.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSetupRecovery}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">복구 비밀번호</label>
              <Input
                type="password"
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder="복구용 비밀번호를 입력하세요"
              />
              <p className="text-xs text-gray-500 mt-1">
                기존 비밀번호와 다른 안전한 비밀번호를 사용하세요.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">복구 비밀번호 확인</label>
              <Input
                type="password"
                value={confirmRecoveryPassword}
                onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                placeholder="복구 비밀번호를 다시 입력하세요"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? '처리 중...' : '복구 비밀번호 설정'}
            </Button>
          </div>
        </form>
      )}
      
      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <h3 className="font-medium text-blue-700 mb-2">복구 비밀번호의 중요성</h3>
        <p className="text-sm text-blue-600">
          복구 비밀번호는 기본 비밀번호를 잊어버렸을 때 파일에 접근할 수 있는 유일한 방법입니다.
          안전한 장소에 보관하고 절대 잊어버리지 마세요.
        </p>
      </div>
    </div>
  );
} 