import React, { useState, useEffect, useMemo } from 'react'
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
    }
  }, [config.loginType])

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
    return mobile.replace(/(\d{2})\d{6}(\d{4})/, '$1********$2')
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
          <div className={styles['input-item']}>
            <Input 
              value={maskedMobile} 
              disabled 
              style={{ '--font-size': '16px', color: '#142948' }} 
            />
          </div>

          <div className={styles['input-item']}>
            <Input
              value={code}
              onChange={setCode}
              placeholder="Código de verificación"
              type="number"
              maxLength={4}
              style={{ flex: 1, '--font-size': '16px' }}
            />
            <div 
              className={styles['send-btn']} 
              onClick={onSendClick}
              style={{ color: timeLeft > 0 ? '#a5d948' : '#a5d948' }}
            >
              {timeLeft > 0 ? `${timeLeft}s` : 'Obtenga'}
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
