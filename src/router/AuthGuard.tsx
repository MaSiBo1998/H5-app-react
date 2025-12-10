import { type ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function AuthGuard(): ReactElement {
  const loginInfo = localStorage.getItem('loginInfo')

  if (!loginInfo) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
