import { type ReactElement, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStorage, StorageKeys } from '@/utils/storage'

export default function AuthGuard(): ReactElement {
  const { pathname } = useLocation()

  // 路由切换时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
    // 如果是滚动容器，可能需要针对特定容器滚动
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [pathname])

  // 检查登录状态
  const loginInfo = getStorage(StorageKeys.LOGIN_INFO)

  if (!loginInfo) {
    // 未登录跳转至登录页
    return <Navigate to="/login" replace />
  }

  // 已登录显示子路由
  return <Outlet />
}
