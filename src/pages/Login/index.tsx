import { Button, Space, Input, Checkbox } from 'antd-mobile'
import type { ReactElement } from 'react'
import { QuestionCircleOutline } from 'antd-mobile-icons'
import styles from './Login.module.css'
import PhoneInput from './components/PhoneInput'
import { useLoginForm } from './hooks/useLoginForm'

export default function Login(): ReactElement {
  // 登录表单逻辑 Hook
  const {
    // 手机号（不含前缀）
    phoneRest,
    setPhoneRest,
    // 验证码
    code,
    setCode,
    // 邀请码
    invite,
    setInvite,
    // 倒计时
    timeLeft,
    // 协议同意状态
    accepted,
    setAccepted,
    // 是否可发送验证码
    canSend,
    // 是否可登录
    canLogin,
    // 发送验证码处理
    handleSend,
    // 登录处理
    handleLogin,
  } = useLoginForm()

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
          <PhoneInput value={phoneRest} onChange={setPhoneRest} />

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
            <a href="#" className={styles['footer-link']}>¿Olvidaste tu contraseña?</a>
            <a href="#" className={styles['footer-link']}>
              <QuestionCircleOutline /> Ayuda
            </a>
          </div>
        </Space>
      </div>
    </div>
  )
}
