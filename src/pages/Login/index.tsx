import { useEffect, useMemo, useState, useRef } from 'react'
import type { ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Space, Input, Checkbox, Toast } from 'antd-mobile'
import { toSendCode, toLoginByCode, checkPasswordLogin } from '@/services/api/user'
import { useRiskTracking } from '@/hooks/useRiskTracking'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import styles from './Login.module.css'
import { collectDeviceInfo } from '@/utils/device'

/**
 * 登录页面主组件
 */
export default function Login(): ReactElement {
  const navigate = useNavigate()
  // 从登录页跳转过来的手机号
  const mobile = useLocation().state?.mobile
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
  // 验证码Token
  const [tokenKey, setTokenKey] = useState('')

  // 埋点相关状态
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()
  const loginStartTime = useRef<number>(Date.now())
  const lastCompleteMobile = useRef<string>('')
  const lastCompleteCode = useRef<string>('')
  const mobileChangeTimer = useRef<number | null>(null)
  const codeChangeTimer = useRef<number | null>(null)
  const phoneInputData = useRef({ startTime: 0, inputType: 1 })
  const codeInputData = useRef({ startTime: 0, inputType: 1 })
  
  // 获取tokenKey
  useEffect(() => {
    try {
      (async () => {
        let tokenKey = ''
        // @ts-ignore
        const client = new window.FingerPrint(
          "https://us.mobilebene.com/w",
          import.meta.env.VITE_APP_JG_KEY
        )
        // @ts-ignore
        tokenKey = await client.record("info")
        setTokenKey(tokenKey)
      })()

    } catch (err) {
      console.log('金果SDK获取token失败', err)
    }
  }, [])
  // 页面卸载时清理定时器并上报埋点
  useEffect(() => {
    return () => {
      if (mobileChangeTimer.current) clearTimeout(mobileChangeTimer.current)
      if (codeChangeTimer.current) clearTimeout(codeChangeTimer.current)

      const loginTime = Date.now() - loginStartTime.current
      toSetRiskInfo('000003', '2', loginTime)
      toSubmitRiskPoint()
    }
  }, [])

  // 完整手机号（带前缀）
  const fullPhone = useMemo(() => `57${phoneRest}`, [phoneRest])
  // 是否可发送验证码
  const canSend = phoneRest.length === 10 && timeLeft === 0
  // 是否可登录
  const canLogin = phoneRest.length === 10 && code.length === 4 && accepted
  // 密码登录携带的手机号
  useEffect(() => {
    if (mobile) {
      setPhoneRest(mobile.slice(2))
    } else {
      setPhoneRest('')
    }
  }, [mobile])
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
      ; (async () => {
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

    if (!tokenKey) {
      Toast.show({
        content: 'La red es anormal, por favor actualice y vuelva a iniciar sesión',
        position: 'center',
      })
      toSetRiskInfo('000003', '1', '2')
      toSetRiskInfo('000003', '3', 'La red es anormal')
      toSubmitRiskPoint()
      return
    }

    ; (async () => {
      let deviceInfo: any = {}
      try {
        deviceInfo = getStorage(StorageKeys.DEVICE_INFO) || await collectDeviceInfo()
      } catch (e) {
        console.error('Device info error', e)
      }
      if (deviceInfo && typeof deviceInfo === 'object') {
        if (!deviceInfo.amidol) deviceInfo.amidol = {}
        deviceInfo.amidol.nitrolic = tokenKey
      }
      try {
        console.log({
          mobile: `${fullPhone}`,
          code,
          inviteCode: invite || undefined,
          deviceInfo
        },'参数')
        const res = await toLoginByCode({
          mobile: `${fullPhone}`,
          code,
          inviteCode: invite || undefined,
          deviceInfo
        })
        setStorage(StorageKeys.LOGIN_INFO, res)
        setStorage(StorageKeys.USER_PHONE, fullPhone)
        
        toSetRiskInfo('000003', '1', '1')
        toSubmitRiskPoint()

        // fining为0时跳转设置密码页面
        if (res.fining === 0) {
          navigate('/set-password')
        } else {
          navigate('/')
        }
      } catch (error: any) {
        toSetRiskInfo('000003', '1', '2')
        toSetRiskInfo('000003', '3', error?.message || 'Login failed')
        toSubmitRiskPoint()
      }
    })()
  }

  // 密码登录检查
  const handlePasswordLoginCheck = async () => {
    if (phoneRest.length !== 10) return
    try {
      // 先保存手机号，方便后续页面使用
      setStorage(StorageKeys.USER_PHONE, fullPhone)
      const res = await checkPasswordLogin({ mobile: fullPhone })
      if (res.fining === 1) {
        navigate('/password-login')
      } else {
        Toast.show({ content: 'No se puede iniciar sesión con contraseña', position: 'center' })
      }
    } catch (error) {
      // ignore
    }
  }

  // 手机号输入埋点
  const handlePhoneFocus = () => {
    phoneInputData.current.startTime = Date.now()
    phoneInputData.current.inputType = 1
  }

  const handlePhonePaste = () => {
    phoneInputData.current.inputType = 2
  }

  const handlePhoneBlur = () => {
    if (phoneInputData.current.startTime && phoneRest) {
      const duration = Date.now() - phoneInputData.current.startTime
      toSetRiskInfo('000001', '1', phoneInputData.current.inputType)
      toSetRiskInfo('000001', '2', duration)
      phoneInputData.current.startTime = 0
    }
  }

  // 验证码输入埋点
  const handleCodeFocus = () => {
    codeInputData.current.startTime = Date.now()
    codeInputData.current.inputType = 1
  }

  const handleCodePaste = () => {
    codeInputData.current.inputType = 2
  }

  const handleCodeBlur = () => {
    if (codeInputData.current.startTime && code) {
      const duration = Date.now() - codeInputData.current.startTime
      toSetRiskInfo('000002', '1', codeInputData.current.inputType)
      toSetRiskInfo('000002', '2', duration)
      codeInputData.current.startTime = 0
    }
  }

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-card']}>
        {/* 头部标题 */}
        <div className={styles['login-header']}>
          <div className={styles['login-title']}>¡Bienvenido!</div>
          <div className={styles['login-subtitle']}>Ingresa tu número y código para continuar</div>
        </div>

        <Space direction="vertical" block style={{ gap: 0 }}>
          {/* 手机号输入组件 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Número de celular</label>
            <div className={styles['input-wrapper']}>
              {/* 手机号前缀部分 */}
              <div className={styles['phone-prefix']}>
                <div className={styles['prefix-flag']}>🇨🇴</div>
                <span className={styles['prefix-code']}>+57</span>
              </div>
              {/* 手机号输入框 */}
              <Input
                value={phoneRest}
                onChange={(v) => {
                  // 仅允许输入数字
                  const digits = v.replace(/\D/g, '')
                  // 限制长度为10位
                  setPhoneRest(digits.slice(0, 10))

                  // 埋点逻辑
                  if (digits.length === 10) {
                    if (mobileChangeTimer.current) clearTimeout(mobileChangeTimer.current)
                    mobileChangeTimer.current = setTimeout(() => {
                      const currentFullPhone = `57${digits}`
                      if (currentFullPhone !== lastCompleteMobile.current) {
                        toSetRiskInfo('000001', '3', currentFullPhone)
                        lastCompleteMobile.current = currentFullPhone
                      }
                    }, 100)
                  } else if (digits.length < 10 && lastCompleteMobile.current) {
                    lastCompleteMobile.current = ''
                  }
                }}
                maxLength={10}
                placeholder="300 123 4567"
                clearable
                type="tel"
                onFocus={handlePhoneFocus}
                onBlur={handlePhoneBlur}
                onPaste={handlePhonePaste}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16 }}
              />
            </div>
            {phoneRest.length === 10 && (
              <div
                className={styles['password-login-link']}
                onClick={handlePasswordLoginCheck}
              >
                Iniciar sesión con contraseña
              </div>
            )}
          </div>

          {/* 验证码输入 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Código de verificación</label>
            <div className={styles['verification-wrapper']}>
              <div className={`${styles['input-wrapper']} ${styles['verification-input']}`}>
                <Input
                  value={code}
                  onChange={(v) => {
                    const digits = v.replace(/\D/g, '')
                    setCode(digits.slice(0, 4))

                    // 埋点逻辑
                    if (digits.length === 4) {
                      if (codeChangeTimer.current) clearTimeout(codeChangeTimer.current)
                      codeChangeTimer.current = setTimeout(() => {
                        if (digits !== lastCompleteCode.current) {
                          toSetRiskInfo('000002', '3', digits)
                          lastCompleteCode.current = digits
                        }
                      }, 100)
                    } else if (digits.length < 4 && lastCompleteCode.current) {
                      lastCompleteCode.current = ''
                    }
                  }}
                  maxLength={4}
                  placeholder="0000"
                  clearable
                  type="tel"
                  onFocus={handleCodeFocus}
                  onBlur={handleCodeBlur}
                  onPaste={handleCodePaste}
                  style={{ border: 'none', background: 'transparent', fontSize: 16 }}
                />
              </div>
              <Button
                size="small"
                fill="solid"
                color="primary"
                disabled={!canSend}
                onClick={handleSend}
                className={styles['verification-btn']}
              >
                {timeLeft > 0 ? `${timeLeft}s` : 'Enviar código'}
              </Button>
            </div>
          </div>

          {/* 邀请码输入 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Código de invitación (Opcional)</label>
            <div className={styles['input-wrapper']}>
              <Input
                value={invite}
                onChange={setInvite}
                placeholder="Ingresa el código"
                clearable
                style={{ border: 'none', background: 'transparent', fontSize: 16 }}
              />
            </div>
          </div>

          {/* 协议勾选 */}
          <div className={styles['agreement-wrapper']}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Checkbox
                checked={accepted}
                onChange={setAccepted}
                style={{ marginTop: 2, '--icon-size': '18px', '--font-size': '14px', '--checked-color': '#00897b' } as React.CSSProperties}
              />
              <div className={styles['agreement-text']}>
                He leído y acepto los
                <a href="" onClick={() => navigate('/term')} className={styles['agreement-link']}>Términos</a> y
                <a href="" onClick={() => navigate('/privacy')} className={styles['agreement-link']}>Política de Privacidad</a>
              </div>
            </div>
          </div>

          {/* 登录按钮 */}
          <Button
            color="primary"
            disabled={!canLogin}
            onClick={handleLogin}
            block
            className={styles['login-btn']}
          >
            Ingresar
          </Button>
        </Space>
      </div>
    </div>
  )
}
