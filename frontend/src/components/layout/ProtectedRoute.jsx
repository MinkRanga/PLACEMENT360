import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard based on their role
    if (user.role === 'TPO_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />
    } else if (user.role === 'RECRUITER') {
      return <Navigate to="/recruiter/dashboard" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}
