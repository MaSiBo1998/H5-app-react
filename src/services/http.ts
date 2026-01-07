import { Toast } from 'antd-mobile'
import { removeStorage, getStorage, StorageKeys } from '@/utils/storage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// HTTP 错误类
export class HttpError extends Error {
  status: number
  code?: string
  data?: unknown
  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}

// 请求配置选项
export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  timeoutMs?: number
  withAuth?: boolean
  isLoading?: boolean
  // 重试次数，默认 0
  retries?: number,
  // 是否跳过全局错误处理（包括 Toast 提示和 Token 过期跳转）
  skipErrorHandler?: boolean,
}

// 将参数对象转换为查询字符串
function toQuery(params?: RequestOptions['params']): string {
  if (!params) return ''
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    usp.append(k, String(v))
  })
  const s = usp.toString()
  return s ? `?${s}` : ''
}

// 构建请求头
function buildHeaders(opts: RequestOptions, body: unknown): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json;',
    ...opts.headers,
  }
  // 根据用户需求添加默认请求头
  const uuid = getStorage<string>(StorageKeys.UUID) || ''
  const loginInfo = getStorage(StorageKeys.LOGIN_INFO) || {}

  const isAndroid = /Android/i.test(navigator.userAgent)

  headers['custumal'] = import.meta.env.VITE_APP_VERSION // 应用版本
  headers['etching'] = '2' // 业务线
  headers['wharf'] = import.meta.env.VITE_APP_NAME
  headers['reges'] = isAndroid ? '1' : '2'
  headers['comber'] = ''
  headers['rusty'] = uuid
  headers['urundi'] = ''
  headers['maraca'] = uuid
  // 处理 FormData 的 Content-Type
  const withAuth = opts.withAuth ?? true
  if (withAuth) {
    headers['jukebox'] = loginInfo.ifni
    headers['pact'] = loginInfo.dihydric
  }
  if (body instanceof FormData) {
    delete headers['Content-Type']
  }
  return headers
}

// 解析响应数据
async function parseResponse(resp: Response): Promise<unknown> {
  const ct = resp.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return await resp.json()
    } catch {
      // 如果 JSON 解析失败，则回退到文本解析
    }
  }
  const text = await resp.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// 处理 Token 过期
function handleTokenExpired(payload: Record<string, unknown>): never {
  Toast.show({ content: typeof payload.msg === 'string' ? payload.msg : 'Token 已过期' })
  try {
    removeStorage(StorageKeys.TOKEN)
    removeStorage(StorageKeys.LOGIN_INFO)
    removeStorage(StorageKeys.USER_PHONE)
  } catch {}
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
  throw new HttpError('Token 已过期', 401, 'R6566S', payload)
}

// 核心请求函数
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const url = `${base}${path}${toQuery(options.params)}`
  
  // 默认超时 15s
  const timeout = options.timeoutMs ?? 15000
  // 默认重试次数
  const retries = options.retries ?? 0

  const body = options.method === 'POST'
    ? (
        options.body === undefined || options.body === null
          ? JSON.stringify({})
          : (options.body instanceof FormData ? options.body : JSON.stringify(options.body))
      )
    : (
        options.body && options.method && options.method !== 'GET'
          ? (options.body instanceof FormData ? options.body : JSON.stringify(options.body))
          : undefined
      )
  
  const loading = options.isLoading ?? false
  let errorShown = false
  if (loading) {
    Toast.show({ icon: 'loading', content: 'Cargando...', duration: 0, maskClickable: false })
  }

  // 执行请求的内部函数
  const doFetch = async (attempt: number): Promise<T> => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeout)

    try {
      const resp = await fetch(url, {
        method: options.method || 'GET',
        headers: buildHeaders(options, body),
        body,
        signal: controller.signal,
        credentials: 'include',
      })
      window.clearTimeout(timeoutId)
      
      if (loading) {
        Toast.clear()
      }

      if (!resp.ok) {
        // HTTP 错误通常不重试，除非是 5xx
        const data = await parseResponse(resp)
        const isObj = typeof data === 'object' && data !== null
        const maybeRecord = isObj ? (data as Record<string, unknown>) : undefined
        const message = maybeRecord && typeof maybeRecord.msg === 'string' ? maybeRecord.msg : maybeRecord && typeof maybeRecord.message === 'string' ? (maybeRecord.message as string) : resp.statusText
        const code = maybeRecord && typeof maybeRecord.code === 'string' ? maybeRecord.code : undefined
        errorShown = true
        Toast.show({ content: message || `HTTP ${resp.status}`, duration: 2000 })
        throw new HttpError(message || 'Request failed', resp.status, code, data)
      }

      const raw = await parseResponse(resp)
      const isObj = typeof raw === 'object' && raw !== null
      if (isObj) {
        const record = raw as Record<string, unknown>
        const code = record.code as string | undefined
        if (code) {
          const msg = record.msg as string | undefined
          if (code === 'D2540J') {
            const inner = record.data as unknown as T
            return inner
          }
          if (code === 'R6566S') {
            if (!options.skipErrorHandler) {
              handleTokenExpired(record)
            }
          }
          console.log('code', code, msg)
          errorShown = true
          if (!options.skipErrorHandler) {
            Toast.show({ content: msg || 'Error', duration: 2000 })
          }
          throw new HttpError(msg || 'Business error', 460, code, raw)
        }
      }
      return raw as T
    } catch (err) {
      window.clearTimeout(timeoutId)
      const name = (err as { name?: string }).name
      const isTimeout = name === 'AbortError'
      
      // 如果还有重试机会，且是超时或网络错误
      if (attempt < retries && (isTimeout || name === 'TypeError')) { // TypeError 通常是网络错误
        console.warn(`Request failed, retrying (${attempt + 1}/${retries})...`)
        // 简单的指数退避
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
        return doFetch(attempt + 1)
      }

      if (loading && !errorShown) {
        Toast.clear()
      }
      
      if (isTimeout) throw new HttpError('Tiempo de espera agotado, por favor inténtelo de nuevo.', 408) // 本地化提示
      throw err as unknown
    }
  }

  return doFetch(0)
}

export const http = {
  get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'POST', body })
  },
  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PUT', body })
  },
  delete<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
  patch<T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PATCH', body })
  },
}
