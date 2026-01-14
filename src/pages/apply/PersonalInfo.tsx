import { useState, useEffect, useRef, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { Card, Space, Button, Input, Picker, Cascader, Toast } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/Apply/components/ApplySteps'
import {
  RightOutline,
  UserOutline,
  LocationOutline,
  MailOutline,
  CalendarOutline
} from 'antd-mobile-icons'
import { savePersonalInfo, getAddressList, sendEmailCodeAPI, getStepConfigInfo } from '@/services/api/apply'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import styles from './ApplyPublic.module.css'
import getNextStep from './progress'
import { useRiskTracking } from '@/hooks/useRiskTracking'

export default function PersonalInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isProfileEntry = searchParams.get('entry') === 'profile'

  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  // 下一步骤
  const [nextPath, setNextPath] = useState('')
  // 配置选项
  const [options, setOptions] = useState({
    education: [] as Array<{ label: string; value: string }>,
    marital: [] as Array<{ label: string; value: string }>,
    children: [] as Array<{ label: string; value: string }>,
    residenceType: [] as Array<{ label: string; value: string }>,
    loanUse: [] as Array<{ label: string; value: string }>,
    emailSuffixes: [] as Array<string>,
  })

  // 埋点 Hook
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()

  // 埋点相关 Refs

  const pageStartTime = useRef(Date.now())
  const pickerStartTimes = useRef<{ [key: string]: number }>({
    education: 0,
    marital: 0,
    children: 0,
    residenceType: 0,
    residenceAddress: 0,
    loanUse: 0
  })
  const addressDetailData = useRef({ startTime: 0, inputType: 1 })
  const emailData = useRef({ startTime: 0, inputType: 1 })
  const emailCodeData = useRef({ startTime: 0, inputType: 1 })
  const emailCodeClickStatus = useRef('2')
  const lastCompleteEmail = useRef('')
  const lastCompleteEmailCode = useRef('')
  const emailChangeTimer = useRef<number | null>(null)
  const emailCodeChangeTimer = useRef<number | null>(null)
  const emailWrapperRef = useRef<HTMLDivElement>(null)
  const [emailDropdownStyle, setEmailDropdownStyle] = useState<React.CSSProperties>({})
  // 显示控制
  const [visibles, setVisibles] = useState({
    education: false,
    marital: false,
    children: false,
    residenceType: false,
    loanUse: false,
    address: false,
    emailSuffix: false
  })
  useEffect(() => {
    if (visibles.emailSuffix && emailWrapperRef.current) {
      const updatePosition = () => {
        const rect = emailWrapperRef.current?.getBoundingClientRect()
        if (rect) {
          setEmailDropdownStyle({
            position: 'absolute',
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            zIndex: 9999
          })
        }
      }
      updatePosition()
      window.addEventListener('resize', updatePosition)
      return () => window.removeEventListener('resize', updatePosition)
    }
  }, [visibles.emailSuffix])



  // 埋点 Event Handlers
  const handlePickerOpen = (type: string) => {
    pickerStartTimes.current[type] = Date.now()
  }

  const handlePickerConfirm = (type: string) => {
    const startTime = pickerStartTimes.current[type]
    if (startTime) {
      const duration = Date.now() - startTime
      const trackKeys: Record<string, string> = {
        education: '1',
        marital: '4',
        children: '5',
        residenceAddress: '6',
        loanUse: '15'
      }
      if (trackKeys[type]) {
        toSetRiskInfo('000008', trackKeys[type], duration)
      }
      pickerStartTimes.current[type] = 0

      // 特殊处理 Residence Address (Cascader)
      if (type === 'residenceAddress') {
        // Key 2: 邮政编码输入方式 (2表示自动填充)
        toSetRiskInfo("000008", "2", "2")
        // Key 3: 邮政编码输入时长 (与地区选择时长相同)
        toSetRiskInfo("000008", "3", duration)
      }
    }
  }

  // 详细地址埋点
  const handleAddressDetailFocus = () => {
    addressDetailData.current.startTime = Date.now()
    addressDetailData.current.inputType = 1
  }
  const handleAddressDetailPaste = () => {
    addressDetailData.current.inputType = 2
  }
  const handleAddressDetailBlur = () => {
    if (addressDetailData.current.startTime && form.residenceAddressDetail) {
      const duration = Date.now() - addressDetailData.current.startTime
      toSetRiskInfo('000008', '7', addressDetailData.current.inputType)
      toSetRiskInfo('000008', '8', duration)
      addressDetailData.current.startTime = 0
    }
  }

  // 邮箱埋点
  const handleEmailFocus = (e: any) => {
    emailData.current.startTime = Date.now()
    emailData.current.inputType = 1
    if (form.emailAccount) {
      setVisibles(prev => ({ ...prev, emailSuffix: true }))
    }
    // 解决键盘遮挡
    setTimeout(() => {
      try {
        e?.target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch (error) { }
    }, 300)
  }

  const handleEmailPaste = () => {
    emailData.current.inputType = 2
  }

  const handleEmailBlur = () => {
    if (emailData.current.startTime && form.emailAccount) {
      const duration = Date.now() - emailData.current.startTime
      toSetRiskInfo('000008', '9', emailData.current.inputType)
      toSetRiskInfo('000008', '10', duration)
      emailData.current.startTime = 0
    }
    setTimeout(() => setVisibles(prev => ({ ...prev, emailSuffix: false })), 200)
  }

  // 邮箱验证码埋点
  const handleEmailCodeFocus = (e: any) => {
    emailCodeData.current.startTime = Date.now()
    emailCodeData.current.inputType = 1
    // 解决键盘遮挡
    setTimeout(() => {
      try {
        e?.target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch (error) { }
    }, 300)
  }
  const handleEmailCodePaste = () => {
    emailCodeData.current.inputType = 2
  }
  const handleEmailCodeBlur = () => {
    if (emailCodeData.current.startTime && form.emailCode) {
      const duration = Date.now() - emailCodeData.current.startTime
      toSetRiskInfo('000008', '12', emailCodeData.current.inputType)
      toSetRiskInfo('000008', '13', duration)
      emailCodeData.current.startTime = 0
    }
  }

  // 邮箱验证正则
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    if (!emailRegex.test(email)) return false
    const atIndex = email.indexOf("@")
    if (atIndex === 0) return false
    const lastDotIndex = email.lastIndexOf(".")
    if (lastDotIndex <= atIndex + 1) return false
    if (email.length - lastDotIndex < 3) return false
    return true
  }

  // 邮箱输入变化埋点
  const handleEmailChange = (val: string) => {
    setForm(prev => ({ ...prev, emailAccount: val }))
    setVisibles(prev => ({ ...prev, emailSuffix: !!val }))

    if (validateEmail(val)) {
      if (val !== lastCompleteEmail.current) {
        toSetRiskInfo("000008", "11", val)
      }
      lastCompleteEmail.current = val
    }
  }

  // 验证码输入变化埋点
  const handleEmailCodeChange = (val: string) => {
    let newVal = val.replace(/\D/g, '')
    if (newVal.length > 6) newVal = newVal.slice(0, 6)
    setForm(prev => ({ ...prev, emailCode: newVal }))

    if (newVal.length === 6) {
      if (emailCodeChangeTimer.current) clearTimeout(emailCodeChangeTimer.current as any)
      emailCodeChangeTimer.current = setTimeout(() => {
        if (newVal !== lastCompleteEmailCode.current) {
          toSetRiskInfo("000008", "14", newVal)
          lastCompleteEmailCode.current = newVal
        }
      }, 100)
    } else if (newVal.length < 6 && lastCompleteEmailCode.current) {
      lastCompleteEmailCode.current = ''
    }
  }

  // 表单状态
  const [form, setForm] = useState({
    education: '',
    educationValue: '',
    marital: '',
    maritalValue: '',
    children: '',
    childrenValue: '',
    residenceType: '',
    residenceTypeValue: '',
    residenceAddress: '',
    residenceAddressDetail: '',
    postalCode: '',
    loanUse: '',
    loanUseValue: '',
    emailAccount: '',
    emailCode: '',
    stepTime: 0
  })



  const [addrOptions, setAddrOptions] = useState<any[]>([])

  useEffect(() => {
    // 设置开始时间
    setForm(prev => ({ ...prev, stepTime: new Date().getTime() }))
    try {
      (async () => {
        const { nextPath } = await getNextStep('/personal')
        setNextPath(nextPath ?? '/')
      })()
    } catch (error) {
    }
    // 加载配置
    const fetchConfig = async () => {
      try {
        let stepConfig: Array<any> = getStorage<Array<any>>(StorageKeys.APPLY_STEP_CONFIG) || []

        // 如果本地缓存没有配置，尝试从接口获取
        if (stepConfig.length === 0) {
          try {
            const res = await getStepConfigInfo({}) as any
            stepConfig = res || []
            if (stepConfig.length > 0) {
              setStorage(StorageKeys.APPLY_STEP_CONFIG, stepConfig)
            }
          } catch (err) {
            console.error('Fetch config failed:', err)
          }
        }

        const commonConfig: { peanut: Array<any> } = getStorage<{ peanut: Array<any> }>(StorageKeys.COMMON_CONFIG) || { peanut: [] }
        if (stepConfig && stepConfig.length > 0) {
          const extract = (code: number) => {
            const hit = stepConfig.find(item => item.calices === code)
            return (hit?.sawback || []).map((x: any) => ({
              label: x.deicide,
              value: x.shoddy
            }))
          }

          // 配置 13 是邮箱后缀，结构可能不同
          const extractSuffixes = (code: number) => {
            const hit = commonConfig?.peanut.find((item: any) => item.ingress === code)
            // 假设 sawback 是对象数组，deicide 为后缀
            // console.log(hit)
            return hit?.popgun.split(',') || []
          }

          setOptions({
            education: extract(6),
            marital: extract(7),
            children: extract(8),
            residenceType: extract(9),
            loanUse: extract(12),
            emailSuffixes: extractSuffixes(13)
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchConfig()
    const fetchAddress = async () => {
      try {
        const res: any = await getAddressList({})
        const arr = Array.isArray(res.subscibe) ? res.subscibe : []
        const fmt = arr.map((p: any) => ({
          label: p.willis,
          value: p.willis,
          children: Array.isArray(p.cityList) ? p.cityList.map((c: any) => ({
            label: c.oversing,
            value: c.oversing,
            fusty: c.fusty
          })) : []
        }))
        setAddrOptions(fmt)
      } catch { }
    }
    fetchAddress()

    return () => {
      // 页面卸载时埋点
      const duration = Date.now() - pageStartTime.current
      toSetRiskInfo('000009', '2', duration)
      toSetRiskInfo('000008', '16', emailCodeClickStatus.current)
      toSubmitRiskPoint()
      if (emailChangeTimer.current) clearTimeout(emailChangeTimer.current as any)
      if (emailCodeChangeTimer.current) clearTimeout(emailCodeChangeTimer.current as any)
    }
  }, [])

  // 倒计时
  useEffect(() => {
    let timer: any
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  const openAddr = async () => {
    setVisibles(v => ({ ...v, address: true }))
    handlePickerOpen('residenceAddress')
  }

  const sendCode = async () => {
    emailCodeClickStatus.current = '1'
    toSetRiskInfo('000008', '16', '1')
    if (!form.emailAccount) {
      Toast.show('Por favor ingrese el correo electrónico')
      return
    }
    // 基础邮箱正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.emailAccount)) {
      Toast.show('Por favor ingrese un correo electrónico válido')
      toSetRiskInfo("000009", "1", "2")
      toSetRiskInfo("000009", "3", "Por favor ingrese un correo electrónico válido")
      return
    }

    setCodeLoading(true)
    try {
      await sendEmailCodeAPI({ izzard: form.emailAccount, egypt: 1, })
      Toast.show('Código enviado')
      setCountdown(60)
    } catch (e: any) {
      toSetRiskInfo("000009", "1", "2")
      toSetRiskInfo("000009", "3", e.message || e.msg || "Error al enviar el código")
    } finally {
      setCodeLoading(false)
    }
  }

  const onSubmit = async () => {
    // 基础校验
    if (!form.educationValue || !form.postalCode || !form.emailAccount || !form.emailCode ||
      !form.maritalValue || !form.childrenValue || !form.residenceTypeValue ||
      !form.residenceAddress || !form.residenceAddressDetail || !form.loanUse) {
      Toast.show('Por favor complete toda la información')
      toSetRiskInfo('000009', '1', '2')
      toSetRiskInfo('000009', '3', 'Por favor complete toda la información')
      return
    }

    // 邮箱格式校验
    if (!validateEmail(form.emailAccount)) {
      Toast.show('Por favor ingrese un correo electrónico válido')
      toSetRiskInfo('000009', '1', '2')
      toSetRiskInfo('000009', '3', 'Formato de correo electrónico incorrecto')
      return
    }

    // 验证码校验
    if (form.emailCode.length !== 6) {
      Toast.show('Código de verificación incorrecto')
      toSetRiskInfo('000009', '1', '2')
      toSetRiskInfo('000009', '3', 'Código de verificación incorrecto')
      return
    }

    setLoading(true)
    try {
      const payload = {
        baotou: form.educationValue, // 学历
        trna: form.postalCode, // 邮编
        izzard: form.emailAccount, // 邮箱
        fenagle: form.emailCode, // 邮箱验证码
        whetter: form.maritalValue, // 婚姻状况
        hieratic: form.childrenValue, // 子女数量
        follicle: form.residenceTypeValue, // 居住类型
        anadem: form.residenceAddress, // 居住地址
        vile: form.residenceAddressDetail, // 详细地址
        roundeye: form.loanUse, // 贷款用途
        coxswain: form.stepTime, // 开始时间
      }

      await savePersonalInfo(payload)
      toSetRiskInfo('000009', '1', '1') // 提交成功
      // await toSubmitRiskPoint() // 移除此处提交，以便与页面停留时长合并上报
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(nextPath)
      }
    } catch (e: any) {
      toSetRiskInfo('000009', '1', '2') // 提交失败
      toSetRiskInfo('000009', '3', e.message || e.msg || 'Submit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['page-container']}>
      <HeaderNav
        title="Datos personales"
        backDirect={false}
        onBack={handleBack}
      />
      {!isProfileEntry && (
        <ApplySteps
          steps={[
            { key: 'work', label: 'Trabajo' },
            { key: 'contacts', label: 'Contactos' },
            { key: 'personal', label: 'Datos personales' },
            { key: 'id', label: 'Identificación' },
            { key: 'face', label: 'Selfie' },
          ]}
          current="personal"
        />
      )}

      <Card className={styles['form-card']}>
        <div className={styles['section-header']}>
          <div className={styles['section-title']}>Datos Personales</div>
          <div className={styles['section-subtitle']}>Completa tu información personal</div>
        </div>
        <Space direction="vertical" block>

          {/* 教育程度 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Nivel educativo</label>
            <div className={styles['input-wrapper']} onClick={() => { setVisibles(v => ({ ...v, education: true })); handlePickerOpen('education') }}>
              <UserOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.education ? '#333' : '#ccc' }}>
                {form.education || 'Seleccionar nivel educativo'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 婚姻状况 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Estado civil</label>
            <div className={styles['input-wrapper']} onClick={() => { setVisibles(v => ({ ...v, marital: true })); handlePickerOpen('marital') }}>
              <UserOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.marital ? '#333' : '#ccc' }}>
                {form.marital || 'Seleccionar estado civil'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 子女数量 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Número de hijos</label>
            <div className={styles['input-wrapper']} onClick={() => { setVisibles(v => ({ ...v, children: true })); handlePickerOpen('children') }}>
              <UserOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.children ? '#333' : '#ccc' }}>
                {form.children || 'Seleccionar número de hijos'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 居住类型 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Tipo de vivienda</label>
            <div className={styles['input-wrapper']} onClick={() => { setVisibles(v => ({ ...v, residenceType: true })); handlePickerOpen('residenceType') }}>
              <UserOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.residenceType ? '#333' : '#ccc' }}>
                {form.residenceType || 'Seleccionar tipo de vivienda'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 居住地址 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Dirección de residencia</label>
            <div className={styles['input-wrapper']} onClick={openAddr}>
              <LocationOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.residenceAddress ? '#333' : '#ccc' }}>
                {form.residenceAddress || 'Seleccionar dirección'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 详细地址 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Detalle de la dirección</label>
            <div className={styles['input-wrapper']}>
              <LocationOutline className={styles['input-icon']} />
              <Input
                value={form.residenceAddressDetail}
                onChange={v => setForm({ ...form, residenceAddressDetail: v })}
                onFocus={handleAddressDetailFocus}
                onBlur={handleAddressDetailBlur}
                {...{ onPaste: handleAddressDetailPaste } as any}
                placeholder="Ingresa el detalle de la dirección"
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
              />
            </div>
          </div>

          {/* 贷款用途 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Propósito del préstamo</label>
            <div className={styles['input-wrapper']} onClick={() => { setVisibles(v => ({ ...v, loanUse: true })); handlePickerOpen('loanUse') }}>
              <CalendarOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.loanUse ? '#333' : '#ccc' }}>
                {form.loanUse || 'Seleccionar propósito'}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 电子邮箱 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Correo electrónico</label>
            <div className={styles['input-wrapper']} ref={emailWrapperRef} style={{ position: 'relative', overflow: 'visible' }}>
              <MailOutline className={styles['input-icon']} />
              <Input
                value={form.emailAccount}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
                {...{ onPaste: handleEmailPaste } as any}
                placeholder="Ingresa tu correo electrónico"
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
              />

              {/* 邮箱后缀建议 */}
              {(() => {
                if (!visibles.emailSuffix) return null
                const prefix = form.emailAccount.split('@')[0]
                const domain = form.emailAccount.includes('@') ? form.emailAccount.split('@')[1] : ''
                const filtered = options.emailSuffixes.filter(s =>
                  !form.emailAccount.includes('@') || s.toLowerCase().startsWith(`@${domain.toLowerCase()}`) || domain === ''
                )
                if (filtered.length === 0) return null

                return createPortal(
                  <div style={{
                    background: 'white',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    ...emailDropdownStyle
                  }}>
                    {filtered.map((suffix, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleEmailChange(prefix + suffix)
                          setVisibles(prev => ({ ...prev, emailSuffix: false }))
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f5f5f5',
                          fontSize: '14px',
                          color: '#333'
                        }}
                      >
                        {prefix}{suffix}
                      </div>
                    ))}
                  </div>,
                  document.body
                )
              })()}
            </div>
          </div>

          {/* 邮箱验证码 */}
          <div className={styles['form-group']}>
            {/* <label className={styles['form-label']}>Código de verificación</label> */}
            <div className={styles['input-wrapper']}>
              <MailOutline className={styles['input-icon']} />
              <Input
                value={form.emailCode}
                onChange={handleEmailCodeChange}
                onFocus={handleEmailCodeFocus}
                onBlur={handleEmailCodeBlur}
                {...{ onPaste: handleEmailCodePaste } as any}
                placeholder="Ingresa el código"
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
                type='number'
                maxLength={6}
              />
              <Button
                fill='none'
                color='primary'
                disabled={countdown > 0 || codeLoading}
                onClick={sendCode}
                style={{
                  fontSize: '14px',
                  padding: '0 8px',
                  borderLeft: '1px solid #eee',
                  height: '24px',
                  lineHeight: '24px',
                  color: '#26a69a'
                }}
              >
                {countdown > 0 ? `${countdown}s` : 'Enviar'}
              </Button>
            </div>
          </div>
        </Space>
      </Card>

      <div className={styles['submit-bar']}>
        <Button
          className={styles['submit-btn']}
          block
          onClick={onSubmit}
          loading={loading}
          disabled={loading}
        >
          Siguiente
        </Button>
      </div>

      {/* Pickers */}
      <Picker
        columns={[options.education]}
        visible={visibles.education}
        onClose={() => { setVisibles(v => ({ ...v, education: false })) }}
        value={[form.educationValue]}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={v => {
          setForm(f => ({ ...f, educationValue: v[0] as string, education: options.education.find(i => i.value === v[0])?.label || '' }))
          handlePickerConfirm('education')
        }}
      />
      <Picker
        columns={[options.marital]}
        visible={visibles.marital}
        onClose={() => { setVisibles(v => ({ ...v, marital: false })) }}
        value={[form.maritalValue]}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={v => {
          setForm(f => ({ ...f, maritalValue: v[0] as string, marital: options.marital.find(i => i.value === v[0])?.label || '' }))
          handlePickerConfirm('marital')
        }}
      />
      <Picker
        columns={[options.children]}
        visible={visibles.children}
        onClose={() => { setVisibles(v => ({ ...v, children: false })) }}
        value={[form.childrenValue]}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={v => {
          setForm(f => ({ ...f, childrenValue: v[0] as string, children: options.children.find(i => i.value === v[0])?.label || '' }))
          handlePickerConfirm('children')
        }}
      />
      <Picker
        columns={[options.residenceType]}
        visible={visibles.residenceType}
        onClose={() => { setVisibles(v => ({ ...v, residenceType: false })) }}
        value={[form.residenceTypeValue]}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={v => {
          setForm(f => ({ ...f, residenceTypeValue: v[0] as string, residenceType: options.residenceType.find(i => i.value === v[0])?.label || '' }))
          handlePickerConfirm('residenceType')
        }}
      />
      <Picker
        columns={[options.loanUse]}
        visible={visibles.loanUse}
        onClose={() => { setVisibles(v => ({ ...v, loanUse: false })) }}
        value={[form.loanUse]}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={v => {
          console.log('loanUse', options.loanUse, v)
          setForm(f => ({ ...f, loanUseValue: v[0] as string, loanUse: options.loanUse.find(i => i.value === v[0])?.label || '' }))
          handlePickerConfirm('loanUse')
        }}
      />
      <Cascader
        title="Seleccionar dirección"
        placeholder="Seleccionar"
        options={addrOptions}
        visible={visibles.address}
        onClose={() => { setVisibles(v => ({ ...v, address: false })) }}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        onConfirm={(_v, extend) => {
          const items = extend.items
          if (items.length < 2) {
            Toast.show('Por favor seleccione provincia y ciudad')
            return
          }
          const address = items.map(i => i?.label).join(' ')
          const last = items[items.length - 1]
          setForm(f => ({
            ...f,
            residenceAddress: address,
            postalCode: (last?.fusty as string) || ''
          }))
          handlePickerConfirm('residenceAddress')
        }}
      />
    </div>
  )
}
