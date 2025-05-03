// Files page will be implemented here // src/app/(dashboard)/files/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FileUploadForm from '@/components/dashboard/file-upload-form';
import FileList from '@/components/dashboard/file-list';
import Sidebar from '@/components/dashboard/sidebar';
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
} from '@tabler/icons-react';
import { logActivity } from '@/lib/activity-logger';
import { encryptFileWithKeyHierarchy } from '@/lib/encryption/client-encryption';

export default function FilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFileUpload = async (file: File) => {
    if (!session?.user?.id) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const uploadedFile = await response.json();

      // 파일 업로드 성공 후 활동 로그 기록
      await logActivity({
        userId: session.user.id,
        action: 'FILE_UPLOAD',
        resourceId: uploadedFile.id,
        details: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      });

      // 파일 암호화 부분 수정
      const { encryptedBlob, fileIv, encryptedFileKey, fileKeyIv, masterKeySalt } = 
        await encryptFileWithKeyHierarchy(file, password);

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error uploading file:', error);
      // ... existing error handling code ...
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
            <p className="mt-2 text-gray-600">Manage and organize your important documents</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <IconSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <IconFilter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <IconSortAscending className="w-5 h-5 mr-2" />
                  Sort
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
            <FileUploadForm 
              userId={session?.user?.id} 
              onFileUploaded={handleFileUploaded}
            />
          </div>

          {/* File List Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Files</h2>
            <FileList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}