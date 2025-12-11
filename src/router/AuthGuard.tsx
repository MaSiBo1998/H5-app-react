import { type ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function AuthGuard(): ReactElement {
  // 检查登录状态
  const loginInfo = localStorage.getItem('loginInfo')

  if (!loginInfo) {
    // 未登录跳转至登录页
    return <Navigate to="/login" replace />
  }

  // 已登录显示子路由
  return <Outlet />
}
