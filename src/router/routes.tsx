import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import AuthGuard from './AuthGuard'
import MyInfo from '@/pages/Profile/components/MyInfo'

const Home = lazy(() => import('@/pages/Home/Home'))
const Profile = lazy(() => import('@/pages/Profile/Profile'))
const Login = lazy(() => import('@/pages/Login/index'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const WorkInfo = lazy(() => import('@/pages/apply/WorkInfo'))
const ContactsInfo = lazy(() => import('@/pages/apply/ContactsInfo'))
const PersonalInfo = lazy(() => import('@/pages/apply/PersonalInfo'))
const IdInfo = lazy(() => import('@/pages/apply/IdInfo'))
const FaceCapture = lazy(() => import('@/pages/apply/FaceCapture'))
const BankInfo = lazy(() => import('@/pages/apply/BankInfo'))

export const routes: RouteObject[] = [
  // 登录页
  { path: '/login', element: <Login /> },
  {
    // 路由守卫
    element: <AuthGuard />,
    children: [
      {
        // 带有底部导航的布局
        element: <AppLayout />,
        children: [
          // 首页
          { index: true, element: <Home /> },
          // 个人中心
          { path: '/profile', element: <Profile /> },
        ],
      },
      // 申请流程页面
      { path: 'work', element: <WorkInfo /> },
      { path: 'contacts', element: <ContactsInfo /> },
      { path: 'personal', element: <PersonalInfo /> },
      { path: 'id', element: <IdInfo /> },
      { path: 'face-capture', element: <FaceCapture /> },
      { path: 'bank', element: <BankInfo /> },
      // 个人信息汇总
      { path: '/my-info', element: <MyInfo /> },
    ],
  },
  // 404 页面
  { path: '*', element: <NotFound /> },
]
