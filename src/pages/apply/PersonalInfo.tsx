import { useState, useEffect, type ReactElement } from 'react'
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
import { savePersonalInfo, getAddressList, sendEmailCodeAPI } from '@/services/api/apply'
import { getStorage, StorageKeys } from '@/utils/storage'
import styles from './ApplyPublic.module.css'
import getNowAndNextStep from './progress'

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
    emailAccount: '',
    emailCode: '',
    stepTime: 0
  })

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

  const [addrOptions, setAddrOptions] = useState<any[]>([])

  useEffect(() => {
    // 设置开始时间
    setForm(prev => ({ ...prev, stepTime: new Date().getTime() }))
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {
    }
    // 加载配置
    try {
      const stepConfig: Array<any> = getStorage<Array<any>>(StorageKeys.APPLY_STEP_CONFIG) || []
      const commonConfig: { peanut: Array<any> } = getStorage<{ peanut: Array<any> }>(StorageKeys.COMMON_CONFIG) || { peanut: [] }
      if (stepConfig) {
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
          console.log(hit)
          return hit?.popgun.split(',')
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
  }

  const sendCode = async () => {
    if (!form.emailAccount) {
      Toast.show('Por favor ingrese el correo electrónico')
      return
    }
    // 基础邮箱正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.emailAccount)) {
      Toast.show('Por favor ingrese un correo electrónico válido')
      return
    }

    setCodeLoading(true)
    try {
      await sendEmailCodeAPI({ izzard: form.emailAccount, egypt: 1, })
      Toast.show('Código enviado')
      setCountdown(60)
    } catch (e) {
      // 错误通常由请求拦截器处理，或显示 Toast
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
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(nextPath)
      }
    } catch (e) {
      // 错误处理
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
            <div className={styles['input-wrapper']} onClick={() => setVisibles(v => ({ ...v, education: true }))}>
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
            <div className={styles['input-wrapper']} onClick={() => setVisibles(v => ({ ...v, marital: true }))}>
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
            <div className={styles['input-wrapper']} onClick={() => setVisibles(v => ({ ...v, children: true }))}>
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
            <div className={styles['input-wrapper']} onClick={() => setVisibles(v => ({ ...v, residenceType: true }))}>
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
                placeholder="Ingresa el detalle de la dirección"
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
              />
            </div>
          </div>





          {/* 电子邮箱 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Correo electrónico</label>
            <div className={styles['input-wrapper']} style={{ position: 'relative', overflow: 'visible' }}>
              <MailOutline className={styles['input-icon']} />
              <Input
                value={form.emailAccount}
                onChange={v => {
                  setForm({ ...form, emailAccount: v })
                  setVisibles(prev => ({ ...prev, emailSuffix: !!v && !v.includes('@') }))
                }}
                onFocus={() => {
                  if (form.emailAccount && !form.emailAccount.includes('@')) {
                    setVisibles(prev => ({ ...prev, emailSuffix: true }))
                  }
                }}
                onBlur={() => {
                  // 延迟关闭以允许点击后缀
                  setTimeout(() => setVisibles(prev => ({ ...prev, emailSuffix: false })), 200)
                }}
                placeholder="Ingresa tu correo electrónico"
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
              />

              {/* 邮箱后缀建议 */}
              {visibles.emailSuffix && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {options.emailSuffixes.map((suffix, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setForm(prev => ({ ...prev, emailAccount: prev.emailAccount + suffix }))
                        setVisibles(prev => ({ ...prev, emailSuffix: false }))
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f5f5f5',
                        fontSize: '14px',
                        color: '#333'
                      }}
                    >
                      {form.emailAccount}{suffix}
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div style={{ marginTop: 12 }} className={styles['input-wrapper']}>
              <MailOutline className={styles['input-icon']} />
              <Input
                value={form.emailCode}
                onChange={v => {
                  let val = v.replace(/\D/g, '')
                  if (val.length > 6) val = val.slice(0, 6)
                  setForm({ ...form, emailCode: val })
                }}
                placeholder="Ingresa el código"
                type="number"
                maxLength={6}
                clearable
                style={{ '--font-size': '16px', flex: 1 }}
              />
              <Button
                size='small'
                color='primary'
                fill='none'
                disabled={countdown > 0 || !form.emailAccount}
                loading={codeLoading}
                onClick={sendCode}
              >
                {countdown > 0 ? `${countdown}s` : 'Enviar'}
              </Button>
            </div>
          </div>
          {/* 贷款用途 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Propósito del préstamo</label>
            <div className={styles['input-wrapper']} onClick={() => setVisibles(v => ({ ...v, loanUse: true }))}>
              <CalendarOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.loanUse ? '#333' : '#ccc' }}>
                {(() => {
                  const it = options.loanUse.find(o => o.value === form.loanUse)
                  return it ? it.label : 'Seleccionar propósito'
                })()}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>
        </Space>
      </Card>

      <div className={styles['submit-bar']}>
        <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
      </div>

      {/* 选择器 */}
      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.education]}
        visible={visibles.education}
        onClose={() => setVisibles(v => ({ ...v, education: false }))}
        onConfirm={v => {
          const item = options.education.find(o => o.value === v[0])
          setForm({ ...form, education: item?.label || '', educationValue: v[0] as string })
        }}
      />
      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.marital]}
        visible={visibles.marital}
        onClose={() => setVisibles(v => ({ ...v, marital: false }))}
        onConfirm={v => {
          const item = options.marital.find(o => o.value === v[0])
          setForm({ ...form, marital: item?.label || '', maritalValue: v[0] as string })
        }}
      />
      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.children]}
        visible={visibles.children}
        onClose={() => setVisibles(v => ({ ...v, children: false }))}
        onConfirm={v => {
          const item = options.children.find(o => o.value === v[0])
          setForm({ ...form, children: item?.label || '', childrenValue: v[0] as string })
        }}
      />
      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.residenceType]}
        visible={visibles.residenceType}
        onClose={() => setVisibles(v => ({ ...v, residenceType: false }))}
        onConfirm={v => {
          const item = options.residenceType.find(o => o.value === v[0])
          setForm({ ...form, residenceType: item?.label || '', residenceTypeValue: v[0] as string })
        }}
      />
      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.loanUse]}
        visible={visibles.loanUse}
        onClose={() => setVisibles(v => ({ ...v, loanUse: false }))}
        onConfirm={v => {
          setForm({ ...form, loanUse: v[0] as string })
        }}
      />

      {/* 地址级联选择器 */}
      <Cascader
        confirmText="Confirmar"
        cancelText="Cancelar"
        options={addrOptions}
        visible={visibles.address}
        placeholder="Seleccionar dirección"
        onCancel={() => setVisibles(v => ({ ...v, address: false }))}
        onConfirm={(val, extend) => {
          const postalCode = (extend.items[extend.items.length - 1] as any)?.fusty || ''
          setForm({ ...form, residenceAddress: val.join('-'), postalCode: postalCode })
          setVisibles(v => ({ ...v, address: false }))
        }}
      />

    </div>
  )
}
