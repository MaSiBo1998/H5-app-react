
import JSEncrypt from 'jsencrypt'

// RSA 公钥
export const rsaPublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCDzDYkfHJLziOJjUV2OPJQlZclCn+x2BFq5Ps1YZPRJGU5bbgZmX6CQHc6w56tJkXMk9x0agnK8Bt9waeHl9TiyDOr7NgGiy8h1OfXYFtxXnllkPmw/zMteWFG+hj9kYcfGgh5qeFgFFs/bMVYM8zZTWcU7HgWH6Sbzkv+esO6QwIDAQAB'

// RSA 加密函数
export function encryptByRSA(text: string, key: string): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(key)
  return encryptor.encrypt(text) || ''
}

// 解码响应数据
export function decodeNautch<T>(resp: unknown): T {
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
