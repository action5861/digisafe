// File list component will be implemented here // src/components/dashboard/file-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { IconFile, IconDownload, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface File {
  id: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
}

interface FileListProps {
  refreshTrigger?: number;
}

export default function FileList({ refreshTrigger = 0 }: FileListProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('파일 목록을 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setFiles(data.files?.recent || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchFiles();
    }
  }, [session, refreshTrigger]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '파일 삭제에 실패했습니다.');
      }

      // 파일 목록 새로고침
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('파일 삭제 오류:', error);
      setError(error instanceof Error ? error.message : '파일 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        아직 업로드된 파일이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <IconFile className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-medium text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {formatDate(file.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              onClick={() => router.push(`/files/download/${file.id}`)}
            >
              <IconDownload className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              onClick={() => {
                if (confirm('정말로 이 파일을 삭제하시겠습니까?')) {
                  handleDeleteFile(file.id);
                }
              }}
            >
              <IconTrash className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}