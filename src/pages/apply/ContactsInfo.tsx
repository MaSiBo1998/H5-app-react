import { useEffect, useState, useRef, type ReactElement } from 'react'
import { Card, Space, Input, Picker, Button, Toast } from 'antd-mobile'
// import { useNavigate } from 'react-router-dom'
import getNextStep from '@/pages/Apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/Apply/components/ApplySteps'
import styles from './ApplyPublic.module.css'
import { CalendarOutline, PhonebookOutline, RightOutline, UserOutline } from 'antd-mobile-icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getStepConfigInfo, saveContactInfo } from '@/services/api/apply'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import { useRiskTracking } from '@/hooks/useRiskTracking'


export default function ContactsInfo(): ReactElement {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 是否从个人中心进入
  const isProfileEntry = searchParams.get('entry') === 'profile'
  // 入口参数
  // const entryParams = searchParams.get('entry')

  // 下一步跳转路径
  const [nextPath, setNextPath] = useState('')
  // 当前正在编辑的联系人索引
  const [currentContactIndex, setCurrentContactIndex] = useState<number>(0)
  // 关系选择器显示状态
  const [relationVisible, setRelationVisible] = useState(false)
  // 选项配置
  const [options, setOptions] = useState({
    // 联系人关系选项（变量名decile为历史遗留命名）
    relation: [] as Array<{ deicide: string, shoddy: string }>,
  })
  // 表单状态
  const [form, setForm] = useState({
    // 页面进入时间戳（变量名coxswain为历史遗留命名，实际存储进入页面的毫秒时间戳）
    coxswain: 0,
    // 联系人列表（变量名deedy为历史遗留命名，固定生成5个联系人条目）
    deedy: Array.from({ length: 5 }, () => ({
      // 联系人电话（变量名verdure为历史遗留命名）
      verdure: '',
      // 联系人关系（变量名decile为历史遗留命名）
      decile: '',
      // 联系人输入类型,0:选择通讯录,1:手动输入（变量名erasure为历史遗留命名）
      erasure: 1,
      // 联系人名称（变量名jacobin为历史遗留命名）
      jacobin: ''
    }))
  })
  // 加载状态
  const [loading, setLoading] = useState(false)

  // 埋点 Hook
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()

  // 埋点状态
  const pageStartTime = useRef<number>(Date.now())
  
  // 存储每个联系人的输入状态
  const contactInputData = useRef(Array.from({ length: 5 }, () => ({
    phoneStartTime: 0,
    phoneInputType: 1,
    nameStartTime: 0,
    nameInputType: 1,
    relationStartTime: 0
  })))

  // 页面停留埋点
  useEffect(() => {
    pageStartTime.current = Date.now()
    return () => {
      const stayTime = Date.now() - pageStartTime.current
      toSetRiskInfo('000007', '2', stayTime)
      toSubmitRiskPoint()
    }
  }, [])

  // 输入处理函数
  const handlePhoneFocus = (index: number) => {
    contactInputData.current[index].phoneStartTime = Date.now()
    contactInputData.current[index].phoneInputType = 1
  }

  const handlePhonePaste = (index: number) => {
    contactInputData.current[index].phoneInputType = 2
  }

  const handlePhoneBlur = (index: number) => {
    const data = contactInputData.current[index]
    if (data.phoneStartTime) {
      const duration = Date.now() - data.phoneStartTime
      const timeKey = index * 5 + 3
      const typeKey = index * 5 + 2
      toSetRiskInfo('000006', timeKey.toString(), duration)
      toSetRiskInfo('000006', typeKey.toString(), data.phoneInputType)
      data.phoneStartTime = 0
    }
  }

  const handleNameFocus = (index: number) => {
    contactInputData.current[index].nameStartTime = Date.now()
    contactInputData.current[index].nameInputType = 1
  }

  const handleNamePaste = (index: number) => {
    contactInputData.current[index].nameInputType = 2
  }

  const handleNameBlur = (index: number) => {
    const data = contactInputData.current[index]
    if (data.nameStartTime) {
      const duration = Date.now() - data.nameStartTime
      const timeKey = index * 5 + 5
      const typeKey = index * 5 + 4
      toSetRiskInfo('000006', timeKey.toString(), duration)
      toSetRiskInfo('000006', typeKey.toString(), data.nameInputType)
      data.nameStartTime = 0
    }
  }

  const handleRelationOpen = (index: number) => {
    contactInputData.current[index].relationStartTime = Date.now()
  }

  const handleRelationConfirm = (index: number) => {
    const data = contactInputData.current[index]
    if (data.relationStartTime) {
      const duration = Date.now() - data.relationStartTime
      const timeKey = index * 5 + 1
      toSetRiskInfo('000006', timeKey.toString(), duration)
      data.relationStartTime = 0
    }
  }

  // 初始化
  useEffect(() => {
    setForm({...form,coxswain:new Date().getTime()})
    // 获取下一步直接跳转的路径
    try {
      (async () => {
        const { nextPath } = await getNextStep('/contacts')
        console.log(nextPath,'nextPath')
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {

    }
    // 获取配置项
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

        if (stepConfig && stepConfig.length > 0) {
          const contactStep = stepConfig.find(item => item.calices == 11)
          if (contactStep) {
            setOptions(prev => ({
              ...prev,
              relation: (contactStep.sawback || []).map((item: any) => ({ deicide: item.deicide, shoddy: item.shoddy }))
            }))
          }
        }
      } catch (error) {
        console.error('Config processing error:', error)
      }
    }
    fetchConfig()
  }, [])

  // 返回处理
  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  // 提交表单
  const onSubmit = async () => {
    // 校验重复手机号
    const phones = form.deedy
      .map(item => item.verdure)
      .filter(phone => phone && phone.trim() !== '')

    if (new Set(phones).size !== phones.length) {
      const msg = 'No se permiten números de teléfono duplicados'
      Toast.show(msg)
      toSetRiskInfo('000007', '1', 2)
      toSetRiskInfo('000007', '3', msg)
      return
    }

    // 校验逻辑
    for (let i = 0; i < form.deedy.length; i++) {
      const item = form.deedy[i]
      const isMandatory = i < 3
      const hasAny = item.verdure || item.decile || item.jacobin
      const hasAll = item.verdure && item.decile && item.jacobin

      if (isMandatory) {
        if (!hasAll) {
          const msg = `Por favor complete la información del contacto ${i + 1}`
          Toast.show(msg)
          toSetRiskInfo('000007', '1', 2)
          toSetRiskInfo('000007', '3', msg)
          return
        }
      } else {
        // 选填项，如果填写了任意一项，则必须全部填写
        if (hasAny && !hasAll) {
          const msg = `Por favor complete toda la información del contacto ${i + 1}`
          Toast.show(msg)
          toSetRiskInfo('000007', '1', 2)
          toSetRiskInfo('000007', '3', msg)
          return
        }
      }

      // 校验手机号长度
      if (item.verdure && item.verdure.length < 10) {
        const msg = `Contacto número ${i + 1}, Por favor ingrese un número de teléfono válido`
        Toast.show(msg)
        toSetRiskInfo('000007', '1', 2)
        toSetRiskInfo('000007', '3', msg)
        return
      }
    }

    setLoading(true)
    // 提交前给手机号添加57前缀，并过滤掉空数据
    let tokeny = ''
    try {
        // @ts-ignore
        const client = new window.FingerPrint(
            "https://us.mobilebene.com/w",
            import.meta.env.VITE_APP_JG_KEY
        )
        // @ts-ignore
        tokeny = await client.record("order")
    } catch (err) {
        console.log('金果SDK获取token失败', err)
        tokeny = ''
    }

    const submitForm = {
      ...form,
      tokenKey: tokeny,
      deedy: form.deedy
        .filter(item => item.verdure || item.decile || item.jacobin)
        .map(item => ({
          ...item,
          verdure: item.verdure ? `57${item.verdure}` : item.verdure
        }))
    }
    saveContactInfo(submitForm).then(async () => {
        toSetRiskInfo('000007', '1', 1)
        setLoading(false)
        if (isProfileEntry) {
          navigate('/my-info')
        } else {
          navigate(nextPath || '/')
        }
      }).catch((e: any) => {
        toSetRiskInfo('000007', '1', 2)
        toSetRiskInfo('000007', '3', e.msg || e.message || 'Unknown error')
        setLoading(false)
      })
    }
  return (
    <>
      <div className={styles['page-container']}>
        <HeaderNav
          title="Información laboral"
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
            current="contacts"
          />
        )}
        <Card className={styles['form-card']}>
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>Información Laboral</div>
            <div className={styles['section-subtitle']}>Completa los detalles de tu empleo actual</div>
          </div>
          <Space direction="vertical" block>
            {
              form.deedy.map((item, index) => {
                return (
                  <>
                    {/* 手机号 */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Contacto {index + 1} {index > 2 ? '(opcional)' : ''}</label>
                      <div className={styles['input-wrapper']}>
                        <PhonebookOutline className={styles['input-icon']} />
                        <div className={styles['phone-prefix']}>
                          <span className={styles['prefix-code']}>+57</span>
                        </div>
                        <Input
                         
                          value={item.verdure}
                          onChange={v => {
                            // 限制只能输入数字
                            let val = v.replace(/\D/g, '')
                            if (val.length > 10) val = val.slice(0, 10)
                            setForm({ ...form, deedy: form.deedy.map((item, i) => i === index ? { ...item, verdure: val } : item) })
                          }}
                          placeholder={'300 123 456' + index}
                          clearable
                          type='tel'
                          inputMode='numeric'
                          style={{ '--font-size': '16px', flex: 1 }}
                          onFocus={() => handlePhoneFocus(index)}
                          onBlur={() => handlePhoneBlur(index)}
                          onPaste={() => handlePhonePaste(index)}
                        />
                      </div>
                    </div>
                    {/* 联系人关系 */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Relación{index + 1} {index > 2 ? '(opcional)' : ''}</label>
                      <div className={styles['input-wrapper']} onClick={() => {
                        handleRelationOpen(index)
                        setCurrentContactIndex(index)
                        setRelationVisible(true)
                      }}>
                        <CalendarOutline className={styles['input-icon']} />
                        <div className={styles['input-content']} style={{ color: item.decile ? '#333333' : '#cccccc' }}>
                          {(() => {
                            const it = options.relation.find(o => o.shoddy === item.decile)
                            return it ? it.deicide : 'Seleccionar Relación'
                          })()}
                        </div>
                        <RightOutline color="#cccccc" />
                      </div>
                    </div>
                    {/* 姓名 */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Nombre {index + 1} {index > 2 ? '(opcional)' : ''}</label>
                      <div className={styles['input-wrapper']}>
                        <UserOutline className={styles['input-icon']} />
                        <Input
                          value={item.jacobin}
                          onChange={v => {
                            if (v.length > 100) v = v.slice(0, 100)
                            setForm({ ...form, deedy: form.deedy.map((item, i) => i === index ? { ...item, jacobin: v } : item) })
                          }}
                          placeholder='jack maray'
                          clearable
                          style={{ '--font-size': '16px', flex: 1 }}
                          onFocus={() => handleNameFocus(index)}
                          onBlur={() => handleNameBlur(index)}
                          onPaste={() => handleNamePaste(index)}
                        />
                      </div>
                    </div>

                  </>
                )
              })
            }
          </Space>
          {/* 薪资范围  */}
          <Picker
            closeOnMaskClick={false}
            confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
            cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
            columns={[options.relation.map(o => ({ label: o.deicide, value: o.shoddy }))]}
            visible={relationVisible}
            onClose={() => setRelationVisible(false)}
            onConfirm={(vals) => {
              handleRelationConfirm(currentContactIndex)
              const val = vals[0]
              if (val) {
                setForm(prev => ({
                  ...prev,
                  deedy: prev.deedy.map((item, i) =>
                    i === currentContactIndex ? { ...item, decile: val as string } : item
                  )
                }))
              }
              setRelationVisible(false)
            }}
          />
        </Card>
        <div className={styles['submit-bar']}>
          <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
        </div>
      </div>
    </>
  )
}
