import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space, Input, Checkbox, Toast } from 'antd-mobile'
import { QuestionCircleOutline } from 'antd-mobile-icons'
import { toSendCode, toLoginByCode, checkPasswordLogin } from '@/services/api/user'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import styles from './Login.module.css'

/**
 * 登录页面主组件
 */
export default function Login(): ReactElement {
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
        // fining为0时跳转设置密码页面
        if (res.fining === 0) {
          navigate('/set-password')
        } else {
          navigate('/')
        }
      } catch {
        // ignore
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

  // 忘记密码跳转
  const handleForgetPassword = () => {
    // 无论是否有手机号，都跳转到验证页面
    // 如果有输入的手机号，先保存一下，方便 CheckMobile 页面自动填充
    if (phoneRest.length === 10) {
      setStorage(StorageKeys.USER_PHONE, fullPhone)
    }
    navigate('/check-mobile?type=loginEdit')
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
                }}
                maxLength={10}
                placeholder="300 123 4567"
                clearable
                type="tel"
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
                  }}
                  maxLength={4}
                  placeholder="0000"
                  clearable
                  type="tel"
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
                <a href="#" className={styles['agreement-link']}>Términos</a> y
                <a href="#" className={styles['agreement-link']}>Política de Privacidad</a>
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

          {/* 底部链接 */}
          <div className={styles['footer-links']}>
            <span className={styles['footer-link']} onClick={handleForgetPassword}>¿Olvidaste tu contraseña?</span>
            <a href="#" className={styles['footer-link']}>
              <QuestionCircleOutline /> Ayuda
            </a>
          </div>
        </Space>
      </div>
    </div>
  )
}
