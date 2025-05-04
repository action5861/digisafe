import { SecurityOverview } from '@/components/admin/security/security-overview'
import { SecurityLogs } from '@/components/admin/security/security-logs'
import { SecuritySettings } from '@/components/admin/security/security-settings'

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">보안 관리</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SecurityOverview />
        </div>
        <div>
          <SecuritySettings />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <SecurityLogs />
        </div>
      </div>
    </div>
  )
} 