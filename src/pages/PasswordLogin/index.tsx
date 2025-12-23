import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { loginByPassword } from '@/services/api/user'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import HeaderNav from '@/components/common/HeaderNav'
import styles from './PasswordLogin.module.css'

/**
 * 密码登录页面
 * 对应 crediprisa-h5 的 password.vue
 */
export default function PasswordLogin(): ReactElement {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 获取存储的手机号
  const mobile = getStorage<string>(StorageKeys.USER_PHONE) || ''
  // 实际上这里应该用上一页传递的手机号，但 Login 页通常会存入 USER_PHONE
  // 如果是从 Login 页跳过来，Login 页应该先存一下

  const handlePasswordChange = (val: string) => {
    const filtered = val.replace(/[^a-zA-Z0-9]/g, '')
    setPassword(filtered)
  }

  const canSubmit = password.length >= 6

  const handleLogin = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const deviceInfo = getStorage(StorageKeys.DEVICE_INFO) || undefined
      const res = await loginByPassword({ mobile, loginPwd: password, deviceInfo })
      
      if (res.success) {
        setStorage(StorageKeys.LOGIN_INFO, res)
        navigate('/')
      } else {
        Toast.show({ content: res.msg || 'Error de inicio de sesión' })
      }
    } catch (error) {
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
              placeholder="Ingresar la contraseña"
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
            onClick={() => navigate('/login')}
          >
            Código de verificación
          </div>
        </div>
      </div>
    </div>
  )
}
