import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading || !isAuthenticated) {
    if (loading) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center px-4">
          <p className="text-sm text-navy/60">Checking session...</p>
        </div>
      )
    }
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
