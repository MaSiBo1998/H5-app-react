import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'
import { toSendCode, toLoginByCode } from '@/services/api/user'

export const useLoginForm = () => {
  const navigate = useNavigate()
  const [phoneRest, setPhoneRest] = useState('')
  const [code, setCode] = useState('')
  const [invite, setInvite] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [accepted, setAccepted] = useState(true)

  const fullPhone = useMemo(() => `57${phoneRest}`, [phoneRest])
  const canSend = phoneRest.length === 10 && timeLeft === 0
  const canLogin = phoneRest.length === 10 && code.length === 4 && accepted

  useEffect(() => {
    if (timeLeft === 0) return
    const id: number = window.setInterval(() => {
      setTimeLeft((t) => (t > 1 ? t - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [timeLeft])

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

  const handleLogin = () => {
    if (!canLogin) return
    ;(async () => {
      try {
        const deviceInfoStr = localStorage.getItem('deviceInfo')
        const deviceInfo = deviceInfoStr ? JSON.parse(deviceInfoStr) : undefined
        const res = await toLoginByCode({ mobile: `${fullPhone}`, code, inviteCode: invite || undefined, deviceInfo })
          localStorage.setItem('loginInfo', JSON.stringify(res))
          localStorage.setItem('userPhone', fullPhone)
          navigate('/')
      } catch {
        // ignore
      }
    })()
  }

  return {
    // state
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
    // derived
    canSend,
    canLogin,
    // actions
    handleSend,
    handleLogin,
  }
}
