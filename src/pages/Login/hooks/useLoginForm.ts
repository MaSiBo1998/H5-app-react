import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'
import { toSendCode, toLoginByCode } from '@/services/api/user'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'

export const useLoginForm = () => {
  const navigate = useNavigate()
  // 手机号（不含前缀）
  const [phoneRest, setPhoneRest] = useState('')
  // 验证码
  const [code, setCode] = useState('')
  // 邀请码
  const [invite, setInvite] = useState('')
  // 倒计时
  const [timeLeft, setTimeLeft] = useState(0)
  // 协议同意状态
  const [accepted, setAccepted] = useState(true)

  // 完整手机号（带前缀）
  const fullPhone = useMemo(() => `57${phoneRest}`, [phoneRest])
  // 是否可发送验证码
  const canSend = phoneRest.length === 10 && timeLeft === 0
  // 是否可登录
  const canLogin = phoneRest.length === 10 && code.length === 4 && accepted

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft === 0) return
    const id: number = window.setInterval(() => {
      setTimeLeft((t) => (t > 1 ? t - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [timeLeft])

  // 发送验证码
  const handleSend = () => {
    if (!canSend) return
    ;(async () => {
      try {
        const res = await toSendCode({ mobile: fullPhone, loginType: 1, smsType: 2 })
        const ttl = res?.ttl ?? 60
        setTimeLeft(ttl)
        Toast.show({
          content: 'Código enviado con éxito',
          position: 'center',
        })
      } catch {
        setTimeLeft(60)
      }
    })()
  }

  // 登录处理
  const handleLogin = () => {
    if (!canLogin) return
    ;(async () => {
      try {
        const deviceInfo = getStorage(StorageKeys.DEVICE_INFO) || undefined
        const res = await toLoginByCode({ mobile: `${fullPhone}`, code, inviteCode: invite || undefined, deviceInfo })
          setStorage(StorageKeys.LOGIN_INFO, res)
          setStorage(StorageKeys.USER_PHONE, fullPhone)
          navigate('/')
      } catch {
        // ignore
      }
    })()
  }

  return {
    // 状态
    phoneRest,
    setPhoneRest,
    code,
    setCode,
    invite,
    setInvite,
    timeLeft,
    setTimeLeft,
    accepted,
    setAccepted,
    // 派生状态
    canSend,
    canLogin,
    // 操作
    handleSend,
    handleLogin,
  }
}
