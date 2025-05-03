'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface File {
  id: string;
  name: string;
  size: number;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  relation: string | null;
  accessFiles: Record<string, string> | null;
  conditions: {
    type: 'inactivity' | 'date' | 'none';
    days?: number;
    date?: string;
  } | null;
  createdAt: string;
}

export default function ContactAccessPage() {
  const { contactId } = useParams<{ contactId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 연락처 및 파일 정보 가져오기
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 연락처 정보 가져오기
      const contactResponse = await fetch(`/api/contacts/${contactId}`);
      
      if (!contactResponse.ok) {
        throw new Error('연락처 정보를 불러오는데 실패했습니다.');
      }
      
      const contactData = await contactResponse.json();
      setContact(contactData.contact);
      
      // 파일 목록 가져오기
      const filesResponse = await fetch('/api/files');
      
      if (!filesResponse.ok) {
        throw new Error('파일 목록을 불러오는데 실패했습니다.');
      }
      
      const filesData = await filesResponse.json();
      setFiles(filesData.files);
      
      // 현재 선택된 파일 설정
      const currentAccessFiles = contactData.contact.accessFiles || {};
      setSelectedFiles(currentAccessFiles);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    if (status === 'authenticated' && contactId) {
      fetchData();
    }
  }, [status, contactId]);

  // 파일 선택 토글
  const toggleFileSelection = (fileId: string, fileName: string) => {
    setSelectedFiles(prev => {
      const newSelection = { ...prev };
      
      if (newSelection[fileId]) {
        delete newSelection[fileId];
      } else {
        newSelection[fileId] = fileName;
      }
      
      return newSelection;
    });
  };

  // 접근 권한 저장
  const saveAccessSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSaveSuccess(false);
      
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessFiles: selectedFiles,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '접근 권한을 저장하는 중 오류가 발생했습니다.');
      }
      
      setSaveSuccess(true);
      setContact(data.contact);
      
      // 3초 후에 성공 메시지 숨기기
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving access settings:', err);
      setError(err instanceof Error ? err.message : '접근 권한을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">접근 권한 관리</h1>
            <Link
              href={`/contacts/${contactId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              연락처 상세로 돌아가기
            </Link>
          </div>
          
          {contact && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-medium text-blue-800 mb-2">
                {contact.name}의 파일 접근 권한
              </h2>
              <p className="text-blue-600">
                선택한 파일은 접근 조건이 충족될 때 이 연락처에서 접근할 수 있습니다.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {saveSuccess && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md">
              접근 권한이 성공적으로 저장되었습니다.
            </div>
          )}
          
          {files.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-2">업로드된 파일이 없습니다.</p>
              <Link
                href="/files"
                className="text-blue-600 hover:underline"
              >
                파일 업로드하러 가기
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">파일 목록</h3>
                  <div className="text-sm text-gray-500">
                    {Object.keys(selectedFiles).length}개 파일 선택됨
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <li key={file.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`file-${file.id}`}
                            checked={!!selectedFiles[file.id]}
                            onChange={() => toggleFileSelection(file.id, file.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`file-${file.id}`}
                            className="ml-3 flex-1 cursor-pointer"
                          >
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB | 업로드: {new Date(file.createdAt).toLocaleDateString()}
                            </div>
                          </label>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={saveAccessSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {saving ? '저장 중...' : '접근 권한 저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 