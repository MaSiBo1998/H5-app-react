import { request } from '@/services/http'

type Data = Record<string, unknown> | FormData

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

export const getStepConfigInfo = <T = unknown>(data: Data) =>
  request<unknown>('/deter/dotty', { method: 'POST', body: data }).then(decodeNautch<T>)

export const saveWorkInfo = <T = unknown>(data: Data) =>
  request<unknown>('/neuraxon/karafuto/jowett', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const saveContactInfo = <T = unknown>(data: Data) =>
  request<unknown>('/gasket/agnean', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const savePersonalInfo = <T = unknown>(data: Data) =>
  request<unknown>('/louden/bastion/unendued/naoi', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const sendEmailCodeAPI = <T = unknown>(data: Data) =>
  request<unknown>('/flotsan/cavort/alcor/qei', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const getAddressList = <T = unknown>(data: Data) =>
  request<unknown>('/cyclase/tongued/hoise/romano', { method: 'POST', body: data }).then(decodeNautch<T>)

export const idcardOcr = <T = unknown>(data: Data) =>
  request<unknown>('/suez/slay/kibitz', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const saveIdInfo = <T = unknown>(data: Data) =>
  request<unknown>('/amend/cooker', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const updateIdInfo = <T = unknown>(data: Data) =>
  request<unknown>('/jetton/poisoner/finnesko', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const saveFaceInfo = <T = unknown>(data: Data) =>
  request<unknown>('/gabriel/coxalgy/tatting', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const updateFaceInfo = <T = unknown>(data: Data) =>
  request<unknown>('/perigee/virose/foreign', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const getBankList = <T = unknown>(data: Data) =>
  request<unknown>('/claribel/smarmy', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const saveBankInfo = <T = unknown>(data: Data) =>
  request<unknown>('/novelize/primary/pallidly', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)

export const getUserBankInfo = <T = unknown>(data: Data) =>
  request<unknown>('/demotics/tergiant/glowboy', { method: 'POST', body: data, isLoading: true }).then(decodeNautch<T>)
