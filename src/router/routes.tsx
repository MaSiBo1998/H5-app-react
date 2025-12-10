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
  { path: '/login', element: <Login /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
      { path: 'work', element: <WorkInfo /> },
      { path: 'contacts', element: <ContactsInfo /> },
      { path: 'personal', element: <PersonalInfo /> },
      { path: 'id', element: <IdInfo /> },
      { path: 'face-capture', element: <FaceCapture /> },
      { path: 'bank', element: <BankInfo /> },
      { path: '/my-info', element: <MyInfo /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]
