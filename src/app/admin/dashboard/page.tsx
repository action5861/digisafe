import { DashboardStats } from '@/components/admin/dashboard/stats'
import { RecentActivity } from '@/components/admin/dashboard/recent-activity'
import { SystemStatus } from '@/components/admin/dashboard/system-status'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemStatus />
      </div>
    </div>
  )
} 