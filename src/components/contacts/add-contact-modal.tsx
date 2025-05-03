'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
    accessConditions: {
      type: 'time' | 'emergency';
      date?: string;
    };
    selectedFiles: string[];
  }) => void;
}

export default function AddContactModal({ isOpen, onClose, onSave }: AddContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    accessConditions: {
      type: 'time' as 'time' | 'emergency',
      date: '',
    },
    selectedFiles: [] as string[],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Trusted Contact</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Conditions
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessType"
                      value="time"
                      checked={formData.accessConditions.type === 'time'}
                      onChange={() => setFormData({
                        ...formData,
                        accessConditions: { ...formData.accessConditions, type: 'time' }
                      })}
                      className="mr-2"
                    />
                    <span>Time-based Access</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessType"
                      value="emergency"
                      checked={formData.accessConditions.type === 'emergency'}
                      onChange={() => setFormData({
                        ...formData,
                        accessConditions: { ...formData.accessConditions, type: 'emergency' }
                      })}
                      className="mr-2"
                    />
                    <span>Emergency Access</span>
                  </label>
                </div>
                {formData.accessConditions.type === 'time' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      value={formData.accessConditions.date}
                      onChange={(e) => setFormData({
                        ...formData,
                        accessConditions: { ...formData.accessConditions, date: e.target.value }
                      })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accessible Files
              </label>
              <div className="border border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">
                  Select files that this contact should have access to
                </p>
                <div className="space-y-2">
                  {/* TODO: Add file selection UI */}
                  <p className="text-sm text-gray-500 italic">
                    File selection will be implemented here
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Add Contact
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 