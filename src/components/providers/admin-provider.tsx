'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  const value = {
    isAdmin: session?.user?.role === 'admin',
    isLoading: status === 'loading'
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
} 