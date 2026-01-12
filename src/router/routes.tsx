import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
const AppLayout = lazy(() => import('@/layouts/AppLayout'))
const AuthGuard = lazy(() => import('./AuthGuard'))
const Home = lazy(() => import('@/pages/Home/Home'))
const Profile = lazy(() => import('@/pages/Profile/Profile'))
const Login = lazy(() => import('@/pages/Login/index'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const WorkInfo = lazy(() => import('@/pages/Apply/WorkInfo'))
const ContactsInfo = lazy(() => import('@/pages/Apply/ContactsInfo'))
const PersonalInfo = lazy(() => import('@/pages/Apply/PersonalInfo'))
const IdInfo = lazy(() => import('@/pages/Apply/IdInfo'))
const FaceCapture = lazy(() => import('@/pages/Apply/FaceCapture'))
const BankInfo = lazy(() => import('@/pages/Apply/BankInfo'))
const MyInfo = lazy(() => import('@/pages/MyInfo/index'))
const MyOrder = lazy(() => import('@/pages/MyOrder/index'))
const MyOrderDetail = lazy(() => import('@/pages/MyOrder/Detail/index'))
const StatusPage = lazy(() => import('@/pages/Status/index'))
const CheckMobile = lazy(() => import('@/pages/CheckMobile'))
const PasswordLogin = lazy(() => import('@/pages/PasswordLogin/index'))
const Privacy = lazy(() => import('@/pages/Rule/Privacy'))
const Term = lazy(() => import('@/pages/Rule/Term'))
const LoanAgreement = lazy(() => import('@/pages/Rule/LoanAgreement'))
const Help = lazy(() => import('@/pages/Help'))
const SetPassword = lazy(() => import('@/pages/SetPassword'))
export const routes: RouteObject[] = [
  // 登录页
  { path: '/login', element: <Login /> },
  // 密码登录页
  { path: '/password-login', element: <PasswordLogin /> },
  // 隐私政策页
  { path: '/privacy', element: <Privacy /> },
  // 条款与条件页
  { path: '/term', element: <Term /> },
  // 贷款协议页
  { path: '/loan-agreement', element: <LoanAgreement /> },
  // 验证手机号页
  { path: '/check-mobile', element: <CheckMobile /> },
  // 设置密码页
  { path: '/set-password', element: <SetPassword /> },
  // 404 页面
  { path: '*', element: <NotFound /> },
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
      // 状态详情页
      { path: '/status', element: <StatusPage /> },
      // 申请流程页面
      { path: 'work', element: <WorkInfo /> },
      { path: 'contacts', element: <ContactsInfo /> },
      { path: 'personal', element: <PersonalInfo /> },
      { path: 'id', element: <IdInfo /> },
      { path: 'face-capture', element: <FaceCapture /> },
      { path: 'bank', element: <BankInfo /> },
      // 帮助中心
      { path: '/help', element: <Help /> },
      // 个人信息汇总
      { path: '/my-info', element: <MyInfo /> },
      // 我的订单
      { path: '/my-order', element: <MyOrder /> },
      // 订单详情
      { path: '/my-order/detail', element: <MyOrderDetail /> },
    ],
  },
  
]
