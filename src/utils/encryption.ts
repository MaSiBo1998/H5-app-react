
import JSEncrypt from 'jsencrypt'

export const rsaPublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCDzDYkfHJLziOJjUV2OPJQlZclCn+x2BFq5Ps1YZPRJGU5bbgZmX6CQHc6w56tJkXMk9x0agnK8Bt9waeHl9TiyDOr7NgGiy8h1OfXYFtxXnllkPmw/zMteWFG+hj9kYcfGgh5qeFgFFs/bMVYM8zZTWcU7HgWH6Sbzkv+esO6QwIDAQAB'

export function encryptByRSA(text: string, key: string): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(key)
  return encryptor.encrypt(text) || ''
}
