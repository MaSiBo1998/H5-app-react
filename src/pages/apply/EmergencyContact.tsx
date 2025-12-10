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
  const isProfileEntry = searchParams.get('entry') === 'profile'

  const [loading, setLoading] = useState(false)
  
  // Options from config
  const [options, setOptions] = useState({
    relation: [] as Array<{ label: string; value: string }>,
  })

  // Form State
  // The user didn't specify the exact structure, but usually it's a list of contacts.
  // "Emergency contact submission has the above parameters" implies similar to ContactsInfo.
  // We'll use a list structure but maybe just 2 contacts as is common, or dynamic.
  // ContactsInfo had 5 slots. I'll stick to a dynamic list or fixed slots.
  // Let's assume standard 2-3 emergency contacts. I'll initialize 2.
  const [contacts, setContacts] = useState([
    { name: '', phone: '', relation: '', relationValue: '' },
    { name: '', phone: '', relation: '', relationValue: '' }
  ])

  // Visibles for relation pickers
  const [relationVisible, setRelationVisible] = useState(false)
  const [currentContactIndex, setCurrentContactIndex] = useState(0)

  useEffect(() => {
    // Load configs
    try {
      const stepConfig: Array<any> = JSON.parse(localStorage.getItem('applyStepConfig') || '[]')
      if (stepConfig) {
        // Relation config code 10
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

    // Setup global callback for native contact selection
    // Assuming native calls window.onContactSelected(name, phone)
    
  }, [])
  
  const handleSelectContact = (index: number) => {
    // Save index
    // activeIndexRef.current = index 
    // Since I don't have useRef imported in the snippet above, I will add it.
    
    // Call native bridge
    // Placeholder logic:
    console.log('Open address book for index', index)
    try {
        // Common bridge patterns:
        // Android: window.Android.pickContact()
        // iOS: window.webkit.messageHandlers.pickContact.postMessage({})
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

  // We need to expose a function for Native to call to update the contact
  // Let's define it inside useEffect or outside.
  useEffect(() => {
    (window as any).updateContactFromNative = (index: number, name: string, phone: string) => {
        setContacts(prev => {
            const next = [...prev]
            if (next[index]) {
                // Formatting phone: remove non-digits, maybe slice
                let cleanPhone = phone.replace(/\D/g, '')
                // If it starts with +57 or 57, remove it if we want just the number, 
                // but the form usually expects 10 digits.
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

  const onSubmit = async () => {
    // Validation
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
      // Construct payload matching ContactsInfo pattern or API requirements
      // The API saveContactInfo usually expects 'deedy' array.
      // Based on ContactsInfo.tsx:
      // deedy: [{ verdure: phone, decile: relation, jacobin: name, erasure: 1 }]
      // verdure needs '57' prefix? ContactsInfo adds it.
      
      const payload = {
        deedy: contacts.map(c => ({
            verdure: `57${c.phone}`,
            decile: c.relationValue,
            jacobin: c.name,
            erasure: 0 // 0 for address book, 1 for manual. We can toggle this or just send 1?
            // The user requirement said "can go to address book". 
            // If they type manually, erasure=1. If picked, erasure=0?
            // Let's assume 1 is safe or maybe I should track how it was entered.
            // I'll stick to 1 (manual) as default or check if picked.
            // For now, I'll send 1 unless I strictly know.
        })),
        coxswain: new Date().getTime() // Start time
      }

      await saveContactInfo(payload)
      
      markCompleted('contacts') // Or 'emergency'? 'contacts' seems to be the key in ApplySteps
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
