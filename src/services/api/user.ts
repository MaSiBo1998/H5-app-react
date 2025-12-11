import { request } from '@/services/http'
import { encryptByRSA, rsaPublicKey } from '@/utils/encryption.ts'
import type { DeviceInfo } from '@/utils/device'

// 发送验证码参数
export interface SendCodeParams {
  mobile: string
  loginType: number
  smsType: number
  bayadere?: string
}

// 登录参数
export interface LoginParams {
  mobile: string
  code: string
}

// 发送验证码
export const toSendCode = (data: SendCodeParams) => {
  return request<{ success: boolean; ttl?: number; message?: string }>(
    '/reeb/salween/seizer',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(data.mobile, rsaPublicKey),
        egypt: data.loginType,
        diarist: data.smsType,
        bayadere: data.bayadere,
      },
      isLoading: true,
      withAuth: false,
    },
  )
}

// 登录
export const toLogin = (data: LoginParams) => {
  return request<{ success: boolean; token?: string; message?: string }>(
    '/api/login',
    {
      method: 'POST',
      body: {
        phone: data.mobile,
        code: data.code,
      },
      isLoading: true,
      withAuth: false,
    },
  )
}

// 获取 Cookie
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
  )
  return match ? decodeURIComponent(match[1]) : null
}

// 验证码登录参数
export interface LoginByCodeParams {
  mobile: string
  code: string
  inviteCode?: string
  deviceInfo?: DeviceInfo | Record<string, unknown>
}

// 验证码登录
export const toLoginByCode = (data: LoginByCodeParams) => {
  const adjustInfoStr = localStorage.getItem('adjustInfo')
  let adjustInfo: Record<string, unknown> | null = null
  try {
    adjustInfo = adjustInfoStr ? JSON.parse(adjustInfoStr) : null
  } catch {
    adjustInfo = null
  }
  const payloadUA = navigator.userAgent
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc')
  const deviceId = localStorage.getItem('uuid') || ''
  const bewail = {
    fugate: null,
    acetated: null,
    bourne: btoa(
      JSON.stringify({
        userAgent: payloadUA,
        adjustId:
          adjustInfo && typeof adjustInfo === 'object' ? (adjustInfo as any).adid || null : null,
        info: adjustInfo,
        fbp,
        fbc,
        deviceId,
      }),
    ),
  }
  const deviceInfo = data.deviceInfo ?? (() => {
    const s = localStorage.getItem('deviceInfo')
    if (!s) return {}
    try {
      return JSON.parse(s)
    } catch {
      return {}
    }
  })()
  return request<{ success: boolean; token?: string; msg?: string; code?: string }>(
    '/lanner/karoo',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(data.mobile, rsaPublicKey),
        odds: data.code,
        dubitant: data.inviteCode,
        blastous: btoa(JSON.stringify(deviceInfo)),
        bewail,
      },
      isLoading: true,
      withAuth: false,
    },
  )
}

// 用户详情
export interface UserDetail {
  champak?: number | null
  pentoxid?: Array<{ creditPage: string; leonora: number }> | []
}

// 获取用户详情
export const getUserDetail = () => {
  return request<UserDetail>('/troffer/audit/frow', { method: 'GET' })
}
