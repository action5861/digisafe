'use client';

import { useState, useRef } from 'react';
import { IconUpload, IconX } from '@tabler/icons-react';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (file: File) => void;
}

export default function ProfileImageUpload({ currentImage, onImageChange }: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <IconUpload className="w-8 h-8" />
            </div>
          )}
        </div>
        {preview && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="profile-image"
        />
        <label
          htmlFor="profile-image"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <IconUpload className="w-4 h-4 mr-2" />
          {preview ? 'Change Image' : 'Upload Image'}
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Recommended: Square image, max 2MB
        </p>
      </div>
    </div>
  );
} 