import { SystemSettings } from '@/components/admin/settings/system-settings'
import { NotificationSettings } from '@/components/admin/settings/notification-settings'
import { BackupSettings } from '@/components/admin/settings/backup-settings'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SystemSettings />
        </div>
        <div>
          <NotificationSettings />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <BackupSettings />
        </div>
      </div>
    </div>
  )
} 