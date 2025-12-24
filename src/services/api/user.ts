import { request } from '@/services/http'
import { encryptByRSA, rsaPublicKey } from '@/utils/encryption.ts'
import type { DeviceInfo } from '@/utils/device'
import { getStorage, StorageKeys } from '@/utils/storage'

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
        // 1：注册登录验证码，2：修改登录密码 3.修改银行卡 4.忘记密码 5.邀请好友 7.修改手机号码
        egypt: data.loginType,
        diarist: data.smsType,
        bayadere: data.bayadere,
      },
      isLoading: true,
      withAuth: false,
    },
  )
}

// 退出登录
export const toLogOut = (data: Record<string, unknown> = {}) => {
  return request<unknown>(
    '/boltrope/jmb',
    {
      method: 'POST',
      body: data,
      isLoading: true,
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
  const adjustInfo = getStorage<Record<string, unknown>>(StorageKeys.ADJUST_INFO)
  const payloadUA = navigator.userAgent
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc')
  const deviceId = getStorage<string>(StorageKeys.UUID) || ''
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
  const deviceInfo = data.deviceInfo ?? (getStorage(StorageKeys.DEVICE_INFO) || {})
  return request<{ success: boolean; token?: string; msg?: string; code?: string; fining?: number }>(
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

// 设置密码参数
export interface SetPasswordParams {
  loginPwd: string
  loginPwdTwo: string
}

// 设置密码
export const toSetPassword = (data: SetPasswordParams) => {
  const mobile = getStorage<string>(StorageKeys.USER_PHONE) || ''
  return request<unknown>(
    '/egotism/durzi/lesbian/boxwood',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(mobile, rsaPublicKey),
        buddhist: data.loginPwd,
        apices: data.loginPwdTwo,
      },
      isLoading: true,
    },
  )
}

// 校验验证码参数
export interface CheckCodeParams {
  mobile: string
  code: string
  checkType: number
  codeType: number
  bayadere?: string
}

// 校验验证码
export const checkCode = (data: CheckCodeParams) => {
  return request<unknown>(
    '/diorite/hideout/demisemi',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(data.mobile, rsaPublicKey),
        odds: data.code,
        //短信类型，1：注册登录验证码，2：修改登录密码 3.修改银行卡 4.忘记密码 5.邀请好友 7.修改手机号码
        egypt: data.checkType,
        diarist: data.codeType,
        bayadere: data.bayadere,
      },
      isLoading: true,
    },
  )
}

// 检查是否可以使用密码登录参数
export interface CheckPasswordLoginParams {
  mobile: string
}

// 检查是否可以使用密码登录
export const checkPasswordLogin = (data: CheckPasswordLoginParams) => {
  return request<{ fining: number }>(
    '/climax/deskwork/embezzle',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(data.mobile, rsaPublicKey),
      },
      isLoading: true,
      withAuth: false,
    },
  )
}

// 密码登录参数
export interface LoginByPasswordParams {
  mobile: string
  loginPwd: string
  deviceInfo?: DeviceInfo | Record<string, unknown>
}

// 密码登录
export const loginByPassword = (data: LoginByPasswordParams) => {
  const adjustInfo = getStorage<Record<string, unknown>>(StorageKeys.ADJUST_INFO)
  const payloadUA = navigator.userAgent
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc')
  const deviceId = getStorage<string>(StorageKeys.UUID) || ''
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
  const deviceInfo = data.deviceInfo ?? (getStorage(StorageKeys.DEVICE_INFO) || {})
  
  return request<{ success: boolean; token?: string; msg?: string; code?: string }>(
    '/brief/window/ganges/puris',
    {
      method: 'POST',
      body: {
        romish: encryptByRSA(data.mobile, rsaPublicKey),
        buddhist: data.loginPwd,
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
  painty?: {
    dermoid?: number // 1: 允许修改银行卡
    shriek?: number // 1: 修改银行卡需要验证码
  }
}

// 获取用户详情
export const getUserDetail = () => {
  return request<UserDetail>('/troffer/audit/frow', { method: 'POST' })
}
