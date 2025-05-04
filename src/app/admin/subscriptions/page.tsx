import { SubscriptionList } from '@/components/admin/subscriptions/subscription-list'
import { SubscriptionFilters } from '@/components/admin/subscriptions/subscription-filters'
import { SubscriptionStats } from '@/components/admin/subscriptions/subscription-stats'

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">구독/결제 관리</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SubscriptionStats />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-6">
            <SubscriptionFilters />
          </div>

          <SubscriptionList />
        </div>
      </div>
    </div>
  )
} 