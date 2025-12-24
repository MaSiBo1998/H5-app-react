import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, Button, Toast } from 'antd-mobile'
import { toSendCode, checkCode } from '@/services/api/user'
import { getStorage, StorageKeys } from '@/utils/storage'
import HeaderNav from '@/components/common/HeaderNav'
import styles from './CheckMobile.module.css'

/**
 * 验证手机号页面
 * 对应 crediprisa-h5 的 checkMobile.vue
 */
export default function CheckMobile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || 'userEditPass'
  
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [smsType, setSmsType] = useState(1) // 1: SMS, 2: WhatsApp
  const [loading, setLoading] = useState(false)
  const [allowChange, setAllowChange] = useState(false)

  // 根据 typeParam 映射配置
  const config = useMemo(() => {
    switch (typeParam) {
      case 'loginEdit': // 忘记密码
        return {
          title: 'Iniciar sesión',
          loginType: 4,
          checkType: 4,
          nextPath: '/set-password?type=loginEdit'
        }
      case 'editbank': // 修改银行卡
        return {
          title: 'Número de verificación',
          loginType: 3,
          checkType: 3,
          nextPath: '/bank?entry=profile' // 假设 BankInfo 路由为 /bank
        }
      case 'userEditPass': // 修改密码
      default:
        return {
          title: 'Cambiar contraseña',
          loginType: 2,
          checkType: 2,
          nextPath: '/set-password?type=userEditPass'
        }
    }
  }, [typeParam])

  useEffect(() => {
    const storedMobile = getStorage<string>(StorageKeys.USER_PHONE)
    if (storedMobile) {
      setMobile(storedMobile)
      handleSendCode(storedMobile, 1, config.loginType) // 默认发送短信
    } else {
      Toast.show({ content: 'No se encontró el número de móvil' })
      navigate('/login', { replace: true })
    }
  }, [config.loginType, navigate])

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft === 0) {
      setAllowChange(false)
      return
    }
    
    // 当倒计时剩余40秒时(即过了20秒)，允许切换发送方式
    if (timeLeft === 40) {
      setAllowChange(true)
    }

    const id = setInterval(() => {
      setTimeLeft((t) => (t > 1 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  const maskedMobile = useMemo(() => {
    if (!mobile) return ''
    // 如果是12位且以57开头，去掉前缀显示（因为UI已有前缀）
    let displayMobile = mobile
    if (mobile.length === 12 && mobile.startsWith('57')) {
      displayMobile = mobile.slice(2)
    }
    // 对10位号码进行脱敏: 前3后4，中间星号
    // 例如: 300****567
    if (displayMobile.length === 10) {
      return displayMobile.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
    }
    // Fallback for original regex if length matches 12 (though we stripped it)
    // Or just return as is if not 10
    return displayMobile.replace(/(\d{2})\d{6}(\d{4})/, '$1********$2')
  }, [mobile])

  const handleSendCode = async (phone: string, smsTypeVal: number, loginTypeVal: number) => {
    try {
      const res = await toSendCode({
        mobile: phone,
        loginType: loginTypeVal, 
        smsType: smsTypeVal,
      })
      const ttl = res?.ttl ?? 60
      setTimeLeft(ttl)
      setAllowChange(false)
      Toast.show({ content: 'Código enviado con éxito' })
    } catch (e) {
      setTimeLeft(0)
    }
  }

  const onSendClick = () => {
    if (timeLeft > 0) return
    handleSendCode(mobile, smsType, config.loginType)
  }

  const handleChangeType = () => {
    if (!allowChange) return
    const newType = smsType === 1 ? 2 : 1
    setSmsType(newType)
    handleSendCode(mobile, newType, config.loginType)
  }

  const handleSubmit = async () => {
    if (!code || code.length !== 4) return
    setLoading(true)
    try {
      await checkCode({
        mobile,
        code,
        checkType: config.checkType,
        codeType: smsType,
      })
      // 验证成功跳转
      navigate(config.nextPath)
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['check-mobile-page']}>
      <HeaderNav title={config.title} />
      
      <div className={styles['content']}>
        <div className={styles['title-section']}>
          <div className={styles['title']}>
            EI OTP ha sido enviado a {smsType === 2 ? 'Whatsapp' : 'SMS'}
          </div>
        </div>

        <div className={styles['form-container']}>
          <div className={styles['form-group']}>
            <div className={styles['input-wrapper']}>
              <div className={styles['phone-prefix']}>
                <span className={styles['prefix-flag']}>🇨🇴</span>
                <span className={styles['prefix-code']}>+57</span>
              </div>
              <Input 
                value={maskedMobile} 
                disabled 
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '16px', '--color': '#37474f', opacity: 1 }} 
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <div className={styles['verification-wrapper']}>
              <div className={`${styles['input-wrapper']} ${styles['verification-input']}`}>
                <Input
                  value={code}
                  onChange={(val) => {
                    let codeVal = val.replace(/\D/g, '')
                    if (codeVal.length > 4) {
                      codeVal = codeVal.slice(0, 4)
                    }
                    setCode(codeVal)
                  }}
                  placeholder="Código de verificación"
                  type="number"
                  maxLength={4}
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '16px', '--placeholder-color': '#b0bec5' }}
                />
              </div>
              <button 
                className={styles['verification-btn']} 
                onClick={onSendClick}
                disabled={timeLeft > 0}
              >
                {timeLeft > 0 ? `${timeLeft}s` : 'Obtenga'}
              </button>
            </div>
          </div>

          <div className={styles['tips']}>
            {!allowChange ? (
              <span>Una pequeña demora,tenga paciencia</span>
            ) : (
              <span className={styles['tips-action']} onClick={handleChangeType}>
                Dar clic para recibir el OTP de {smsType === 2 ? 'SMS' : 'Whatsapp'}
              </span>
            )}
          </div>

          <Button
            className={styles['submit-btn']}
            onClick={handleSubmit}
            loading={loading}
            disabled={code.length !== 4}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
