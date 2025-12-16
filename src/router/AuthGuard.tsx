import { type ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getStorage, StorageKeys } from '@/utils/storage'

export default function AuthGuard(): ReactElement {
  // 检查登录状态
  const loginInfo = getStorage(StorageKeys.LOGIN_INFO)

  if (!loginInfo) {
    // 未登录跳转至登录页
    return <Navigate to="/login" replace />
  }

  // 已登录显示子路由
  return <Outlet />
}
