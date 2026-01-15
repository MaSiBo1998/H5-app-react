import { useEffect, useState, useRef } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { loginByPassword } from '@/services/api/user'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import HeaderNav from '@/components/common/HeaderNav'
import styles from './PasswordLogin.module.css'
import { collectDeviceInfo } from '@/utils/device'
import { useReduxRiskTracking } from '@/hooks/useReduxRiskTracking'

/**
 * 密码登录页面
 * 对应 crediprisa-h5 的 password.vue
 */
export default function PasswordLogin(): ReactElement {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  // 验证码Token
  const [tokenKey, setTokenKey] = useState('')
  // 埋点相关状态
  const { toSetRiskInfo, toSubmitRiskPoint } = useReduxRiskTracking()
  const pageStartTime = useRef<number>(Date.now())
  // 获取tokenKey
  useEffect(() => {

    try {
      (
        async () => {
          let tokenKey = ''
          // @ts-ignore
          const client = new window.FingerPrint(
            "https://us.mobilebene.com/w",
            import.meta.env.VITE_APP_JG_KEY
          )
          // @ts-ignore
          tokenKey = await client.record("info")
          setTokenKey(tokenKey)
        }
      )()

    } catch (err) {
      console.log('金果SDK获取token失败', err)
    }
  }, [])
  // 获取存储的手机号
  const mobile = getStorage<string>(StorageKeys.USER_PHONE) || ''

  useEffect(() => {
    if (!mobile) {
      Toast.show({ content: 'Por favor, ingrese su número de teléfono primero' })
      navigate('/login', { replace: true })
    }
  }, [mobile, navigate])

  const handlePasswordChange = (val: string) => {
    const filtered = val.replace(/[^a-zA-Z0-9]/g, '')
    setPassword(filtered)
  }

  const canSubmit = password.length >= 6

  const handleLogin = async () => {
    if (!canSubmit) return
    if (!tokenKey) {
      Toast.show({
        content: 'La red es anormal, por favor actualice y vuelva a iniciar sesión',
        position: 'center',
      })
      return
    }
    setLoading(true)
    try {
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
      const res = await loginByPassword({ mobile, loginPwd: password, deviceInfo })
      setStorage(StorageKeys.LOGIN_INFO, res)

      // 登录成功埋点上报
      toSetRiskInfo('000003', '1', '1')
      const duration = Date.now() - pageStartTime.current
      toSetRiskInfo('000003', '2', duration)
      toSubmitRiskPoint()

      navigate('/')
    } catch (error: any) {
      // 记录失败但不立即上报，等成功时一起上报
      toSetRiskInfo('000003', '1', '2')
      toSetRiskInfo('000003', '3', error?.message || 'Login failed')
      // Error handling usually in interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['password-login-page']}>
      <HeaderNav
        title="Inicio de sesión con contraseña"
        onBack={() => navigate('/login')}
        background="transparent"
      />

      <div className={styles['content']}>
        <div className={styles['title-section']}>
          <div className={styles['title']}>Por favor, introduzca su contraseña</div>
        </div>

        <div className={styles['form-container']}>
          <div className={styles['input-item']}>
            <Input
              value={password}
              onChange={handlePasswordChange}
              placeholder="Contraseña de 6-16 dígitos"
              type={showPassword ? 'text' : 'password'}
              maxLength={16}
              style={{ flex: 1, '--font-size': '16px' }}
            />
            <div
              className={styles['eye-icon']}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
            </div>
          </div>

          <div
            className={styles['forget-password']}
            onClick={() => navigate('/check-mobile?type=loginEdit')}
          >
            ¿Olvidaste la contraseña?
          </div>

          <Button
            block
            className={styles['submit-btn']}
            disabled={!canSubmit || loading}
            loading={loading}
            onClick={handleLogin}
          >
            Siguiente
          </Button>

          <div
            className={styles['to-code']}
            onClick={() => navigate('/login', { state: { mobile: mobile } })}
          >
            Código de verificación
          </div>
        </div>
      </div>
    </div>
  )
}
