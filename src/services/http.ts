import { Toast } from 'antd-mobile'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

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

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  timeoutMs?: number
  withAuth?: boolean
  isLoading?: boolean
}

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

function buildHeaders(opts: RequestOptions, body: unknown): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json;',
    ...opts.headers,
  }
  // Default headers from user requirements
  const uuid = localStorage.getItem('uuid') || ''
  const loginInfoStr = localStorage.getItem('loginInfo')
  let loginInfo: any = {}
  try {
    loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : {}
  } catch {
    // ignore parse error
  }

  const isAndroid = /Android/i.test(navigator.userAgent)

  headers['custumal'] = import.meta.env.VITE_APP_VERSION // App Version
  headers['etching'] = '2' // Business line
  headers['wharf'] = import.meta.env.VITE_APP_NAME
  headers['reges'] = isAndroid ? '1' : '2'
  headers['comber'] = ''
  headers['rusty'] = uuid
  headers['urundi'] = ''
  headers['maraca'] = uuid
  // Handle Content-Type for FormData
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

async function parseResponse(resp: Response): Promise<unknown> {
  const ct = resp.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return await resp.json()
    } catch {
      // fall through to text parsing below
    }
  }
  const text = await resp.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function handleTokenExpired(payload: Record<string, unknown>): never {
  Toast.show({ content: typeof payload.msg === 'string' ? payload.msg : 'Token expired' })
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('loginInfo')
    localStorage.removeItem('userPhone')
  } catch {}
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
  throw new HttpError('Token expired', 401, 'R6566S', payload)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const url = `${base}${path}${toQuery(options.params)}`
  const controller = new AbortController()
  const timeout = options.timeoutMs ?? 15000
  const timeoutId = window.setTimeout(() => controller.abort(), timeout)
  
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
          handleTokenExpired(record)
        }
        console.log('code', code, msg)
        errorShown = true
        Toast.show({ content: msg || 'Error', duration: 2000 })
        throw new HttpError(msg || 'Business error', 460, code, raw)
      }
    }
    return raw as T
  } catch (err) {
    if (loading && !errorShown) {
      Toast.clear()
    }
    const name = (err as { name?: string }).name
    if (name === 'AbortError') throw new HttpError('Request timeout', 408)
    throw err as unknown
  }
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
