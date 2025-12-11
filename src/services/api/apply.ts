import { request } from '@/services/http'

type Data = Record<string, unknown> | FormData

// 解码响应数据
function decodeNautch<T>(resp: unknown): T {
  const obj = resp as Record<string, unknown>
  const val = obj && typeof obj === 'object' ? (obj as any).nautch : undefined
  if (typeof val === 'string') {
    let decoded = ''
    try {
      decoded = decodeURIComponent(atob(val).split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''))
    } catch {
      decoded = val
    }
    try {
      return JSON.parse(decoded) as T
    } catch {
      return decoded as unknown as T
    }
  }
  return resp as T
}

// 获取步骤配置信息
export const getStepConfigInfo = <T = unknown>(data: Data) =>
  request<unknown>('/deter/dotty', { method: 'POST', body: data }).then(decodeNautch<T>)

// 保存工作信息
export const saveWorkInfo = <T = unknown>(data: Data) =>
  request<unknown>('/neuraxon/karafuto/jowett', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 保存联系人信息
export const saveContactInfo = <T = unknown>(data: Data) =>
  request<unknown>('/gasket/agnean', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 保存个人信息
export const savePersonalInfo = <T = unknown>(data: Data) =>
  request<unknown>('/louden/bastion/unendued/naoi', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 发送邮箱验证码
export const sendEmailCodeAPI = <T = unknown>(data: Data) =>
  request<unknown>('/flotsan/cavort/alcor/qei', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 获取地址列表
export const getAddressList = <T = unknown>(data: Data) =>
  request<unknown>('/cyclase/tongued/hoise/romano', { method: 'POST', body: data }).then(decodeNautch<T>)

// 身份证 OCR 识别
export const idcardOcr = <T = unknown>(data: Data) =>
  request<unknown>('/suez/slay/kibitz', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 保存身份证信息
export const saveIdInfo = <T = unknown>(data: Data) =>
  request<unknown>('/amend/cooker', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 更新身份证信息
export const updateIdInfo = <T = unknown>(data: Data) =>
  request<unknown>('/jetton/poisoner/finnesko', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 保存人脸信息
export const saveFaceInfo = <T = unknown>(data: Data) =>
  request<unknown>('/gabriel/coxalgy/tatting', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 更新人脸信息
export const updateFaceInfo = <T = unknown>(data: Data) =>
  request<unknown>('/perigee/virose/foreign', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 获取银行列表
export const getBankList = <T = unknown>(data: Data) =>
  request<unknown>('/claribel/smarmy', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 保存银行卡信息
export const saveBankInfo = <T = unknown>(data: Data) =>
  request<unknown>('/novelize/primary/pallidly', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

// 获取用户银行卡信息
export const getUserBankInfo = <T = unknown>(data: Data) =>
  request<unknown>('/demotics/tergiant/glowboy', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)
