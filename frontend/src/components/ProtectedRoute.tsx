import React, { useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'

/**
 * Auth guard component.
 *
 * Checks for a valid token in the auth store (synced from localStorage).
 * - If no token is present, redirects to /login with the current path as
 *   a `redirect` query parameter so the user can be sent back after login.
 * - If a token is present, renders child routes via <Outlet />.
 * - Displays a centered loading spinner while the initial auth check is
 *   in flight (e.g. while fetchUser is resolving).
 */
const ProtectedRoute: React.FC = () => {
  const { token, fetchUser } = useAuthStore()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If there is a token in storage, attempt to hydrate the user object.
    // Once the call completes (success or failure), stop showing the spinner.
    if (token) {
      fetchUser().finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
    // Only run on mount -- fetchUser reference is stable in Zustand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show a full-screen spinner while verifying the session.
  if (checking) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#f0f2f5',
        }}
      >
        <Spin size="large" tip="正在验证身份..." />
      </div>
    )
  }

  // No token -- redirect to login, preserving the intended destination.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated -- render nested routes.
  return <Outlet />
}

export default ProtectedRoute
