import { useState, useEffect, type ReactElement } from 'react'
import { Card, Space, Button, Input, Picker, Toast } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { markCompleted, getNextPath } from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'
import { 
  RightOutline, 
  UserOutline, 
  PhonebookOutline,
  CalendarOutline 
} from 'antd-mobile-icons'
import { saveContactInfo } from '@/services/api/apply'
import styles from './ApplyPublic.module.css'

export default function EmergencyContact(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 是否从个人中心进入
  const isProfileEntry = searchParams.get('entry') === 'profile'

  // 加载状态
  const [loading, setLoading] = useState(false)
  
  // 选项配置
  const [options, setOptions] = useState({
    relation: [] as Array<{ label: string; value: string }>,
  })

  // 表单状态
  // 紧急联系人列表（默认为2个）
  const [contacts, setContacts] = useState([
    { name: '', phone: '', relation: '', relationValue: '' },
    { name: '', phone: '', relation: '', relationValue: '' }
  ])

  // 关系选择器显示状态
  const [relationVisible, setRelationVisible] = useState(false)
  // 当前操作的联系人索引
  const [currentContactIndex, setCurrentContactIndex] = useState(0)

  // 初始化
  useEffect(() => {
    // 加载配置
    try {
      const stepConfig: Array<any> = JSON.parse(localStorage.getItem('applyStepConfig') || '[]')
      if (stepConfig) {
        // 关系配置代码 10
        const extract = (code: number) => {
          const hit = stepConfig.find(item => item.calices === code)
          return (hit?.sawback || []).map((x: any) => ({ 
            label: x.deicide, 
            value: x.shoddy 
          }))
        }
        setOptions({
          relation: extract(10)
        })
      }
    } catch (error) {
      console.error(error)
    }

    // 设置原生回调（用于通讯录选择）
    
  }, [])
  
  // 选择联系人处理
  const handleSelectContact = (index: number) => {
    // 调用原生方法选择联系人
    console.log('Open address book for index', index)
    try {
        if ((window as any).Android && (window as any).Android.pickContact) {
            (window as any).Android.pickContact(index) // Passing index to get it back?
        } else if ((window as any).webkit && (window as any).webkit.messageHandlers && (window as any).webkit.messageHandlers.pickContact) {
            (window as any).webkit.messageHandlers.pickContact.postMessage({ index })
        } else {
            Toast.show('Functionality available on mobile app')
            // Simulation for dev
            // setTimeout(() => {
            //     updateContact(index, 'Test Name', '1234567890')
            // }, 1000)
        }
    } catch (e) {
        console.error(e)
    }
  }

  // 注册原生回调
  useEffect(() => {
    (window as any).updateContactFromNative = (index: number, name: string, phone: string) => {
        setContacts(prev => {
            const next = [...prev]
            if (next[index]) {
                // 格式化手机号
                let cleanPhone = phone.replace(/\D/g, '')
                // 去除前缀
                if (cleanPhone.startsWith('57') && cleanPhone.length > 10) {
                    cleanPhone = cleanPhone.slice(2)
                }
                next[index] = { ...next[index], name, phone: cleanPhone }
            }
            return next
        })
    }
    return () => {
        delete (window as any).updateContactFromNative
    }
  }, [])

  // 提交表单
  const onSubmit = async () => {
    // 校验逻辑
    for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i]
        if (!c.name || !c.phone || !c.relationValue) {
            Toast.show(`Por favor complete el contacto ${i + 1}`)
            return
        }
        if (c.phone.length !== 10) {
            Toast.show(`El teléfono del contacto ${i + 1} debe tener 10 dígitos`)
            return
        }
    }

    setLoading(true)
    try {
      // 构建提交参数
      const payload = {
        deedy: contacts.map(c => ({
            verdure: `57${c.phone}`,
            decile: c.relationValue,
            jacobin: c.name,
            erasure: 0 // 0:通讯录选择, 1:手动输入
        })),
        coxswain: new Date().getTime() // Start time
      }

      await saveContactInfo(payload)
      
      markCompleted('contacts')
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(getNextPath())
      }
    } catch (e) {
      // Error
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className={styles['page-container']}>
      <HeaderNav
        title="Contactos de emergencia"
        backDirect={false}
        onBack={() => isProfileEntry ? navigate('/my-info') : navigate('/')}
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
            <div className={styles['section-title']}>Contactos de emergencia</div>
            <div className={styles['section-subtitle']}>Por favor proporcione sus contactos de emergencia</div>
          </div>
          
          <Space direction="vertical" block>
            {contacts.map((contact, index) => (
                <div key={index}>
                    {/* Phone */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Contacto {index + 1}</label>
                      <div className={styles['input-wrapper']}>
                        <PhonebookOutline 
                            className={styles['input-icon']} 
                            onClick={() => handleSelectContact(index)} // Trigger selection
                        />
                        <div className={styles['phone-prefix']}>
                          <span className={styles['prefix-code']}>+57</span>
                        </div>
                        <Input
                          value={contact.phone}
                          onChange={v => {
                            let val = v.replace(/\D/g, '')
                            if (val.length > 10) val = val.slice(0, 10)
                            setContacts(prev => {
                                const next = [...prev]
                                next[index] = { ...next[index], phone: val }
                                return next
                            })
                          }}
                          placeholder="Número de teléfono"
                          clearable
                          type='number'
                          style={{ '--font-size': '16px', flex: 1 }}
                        />
                      </div>
                    </div>

                    {/* Relation */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Relación</label>
                      <div className={styles['input-wrapper']} onClick={() => {
                        setCurrentContactIndex(index)
                        setRelationVisible(true)
                      }}>
                        <CalendarOutline className={styles['input-icon']} />
                        <div className={styles['input-content']} style={{ color: contact.relationValue ? '#333' : '#ccc' }}>
                          {contact.relation || 'Seleccionar Relación'}
                        </div>
                        <RightOutline color="#cccccc" />
                      </div>
                    </div>

                    {/* Name */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Nombre</label>
                      <div className={styles['input-wrapper']}>
                        <UserOutline className={styles['input-icon']} />
                        <Input
                          value={contact.name}
                          onChange={v => {
                            setContacts(prev => {
                                const next = [...prev]
                                next[index] = { ...next[index], name: v }
                                return next
                            })
                          }}
                          placeholder="Nombre completo"
                          clearable
                          style={{ '--font-size': '16px', flex: 1 }}
                        />
                      </div>
                    </div>
                    {index < contacts.length - 1 && <div style={{ height: 1, background: '#f5f5f5', margin: '16px 0' }} />}
                </div>
            ))}
          </Space>
      </Card>

      <Picker
        closeOnMaskClick={false}
        confirmText="Confirmar"
        cancelText="Cancelar"
        columns={[options.relation]}
        visible={relationVisible}
        onClose={() => setRelationVisible(false)}
        onConfirm={v => {
          const item = options.relation.find(o => o.value === v[0])
          setContacts(prev => {
            const next = [...prev]
            next[currentContactIndex] = { 
                ...next[currentContactIndex], 
                relation: item?.label || '', 
                relationValue: v[0] as string 
            }
            return next
          })
        }}
      />

      <div className={styles['submit-bar']}>
          <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
      </div>
    </div>
  )
}
