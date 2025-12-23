import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { toSetPassword } from '@/services/api/user'
import styles from './SetPassword.module.css'

/**
 * 设置密码页面
 * 对应 crediprisa-h5 的 setPassword.vue
 */
export default function SetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // 密码输入过滤：只允许字母和数字
  const handlePasswordChange = (val: string, setFn: (val: string) => void) => {
    const filtered = val.replace(/[^a-zA-Z0-9]/g, '')
    setFn(filtered)
  }

  // 验证逻辑
  const canSubmit = password.length >= 6 && password.length <= 16 && 
                    confirmPassword.length >= 6 && confirmPassword.length <= 16 &&
                    password === confirmPassword

  const handleSkip = () => {
    navigate('/')
  }

  const handleSubmit = async () => {
    if (password.length < 6 || password.length > 16 || confirmPassword.length < 6 || confirmPassword.length > 16) {
      Toast.show({ content: 'La contraseña consta de 6 a 16 dígitos, letras' })
      return
    }
    if (password !== confirmPassword) {
      Toast.show({ content: 'Contraseñas inconsistentes dos veces' })
      return
    }

    setLoading(true)
    try {
      await toSetPassword({ loginPwd: password, loginPwdTwo: confirmPassword })
      Toast.show({ content: 'Configuración exitosa' })
      navigate('/')
    } catch (error) {
      // Error handled by request interceptor usually, or ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['set-password-page']}>
      <div className={styles['top-bar']}>
        <div className={styles['skip-btn']} onClick={handleSkip}>
          Omitir
        </div>
      </div>

      <div className={styles['title-section']}>
        <div className={styles['title']}>¡Bienvenidos!</div>
        <div className={styles['subtitle']}>Por favor, establezca su contraseña de inicio de sesión</div>
      </div>

      <div className={styles['form-container']}>
        <div className={styles['input-item']}>
          <Input
            value={password}
            onChange={(val) => handlePasswordChange(val, setPassword)}
            placeholder="Por favor, introduzca su contraseña"
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

        <div className={styles['input-item']}>
          <Input
            value={confirmPassword}
            onChange={(val) => handlePasswordChange(val, setConfirmPassword)}
            placeholder="Vuelva a introducir la contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            maxLength={16}
            style={{ flex: 1, '--font-size': '16px' }}
          />
          <div 
            className={styles['eye-icon']}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
          </div>
        </div>

        <Button
          block
          className={styles['submit-btn']}
          disabled={!canSubmit || loading}
          loading={loading}
          onClick={handleSubmit}
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}
