import { type ReactElement, useState, useEffect } from 'react'
import { Card, Button, Input, Toast, Space } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RightOutline, BankcardOutline, UserOutline } from 'antd-mobile-icons'
import { markCompleted } from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'
import BankListPopup from '@/pages/apply/components/BankListPopup'
import { getStepConfigInfo, saveBankInfo, getUserBankInfo } from '@/services/api/apply'
import styles from './ApplyPublic.module.css'

// 银行类型接口
interface BankType {
  deicide: string // 标题
  shoddy: number // 类型值
  adapted: string // 图标 URL
  wrong: number // 是否默认
  ontogeny: string // 描述
}

export default function BankInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 是否从个人中心进入
  const isProfileEntry = searchParams.get('entry') === 'profile'

  const [loading, setLoading] = useState(false)
  
  // 银行类型列表
  const [bankTypes, setBankTypes] = useState<BankType[]>([])
  
  // 表单状态
  const [form, setForm] = useState({
    bankType: 0, // 银行卡类型
    bankTypeTitle: '',
    bankName: '',
    bankCode: '',
    bankAccount: '',
    stepTime: 0
  })

  // 银行选择器显示状态
  const [bankPickerVisible, setBankPickerVisible] = useState(false)

  // 初始化
  useEffect(() => {
    const init = async () => {
      setForm(prev => ({ ...prev, stepTime: Date.now() }))
      
      let configTypes: BankType[] = []

      // 1. 获取配置信息 (银行类型)
      try {
        let stepConfig: any[] = JSON.parse(localStorage.getItem('applyStepConfig') || '[]')
        if (stepConfig.length === 0) {
           const res = await getStepConfigInfo({}) as any
           stepConfig = res || []
           localStorage.setItem('applyStepConfig', JSON.stringify(stepConfig))
        }
        
        // 查找 calices == 14 的配置
        const bankConfig = stepConfig.find(item => item.calices === 14)
        if (bankConfig && bankConfig.sawback) {
          configTypes = bankConfig.sawback
          setBankTypes(configTypes)
          
          // 如果没有选中的类型，设置默认值
          const defaultType = configTypes.find(t => t.wrong === 1)
          if (defaultType && !form.bankType) {
            handleTypeSelect(defaultType)
          }
        }
      } catch (e) {
        console.error('Failed to load config', e)
      }

      // 3. 获取用户已有银行信息 (如果是编辑模式或重新申请)
      try {
        const res = await getUserBankInfo({}) as any
        if (res) {
          const { scorn, frau, antidote, manned } = res
          if (scorn) {
             // 尝试从配置中找到对应的类型以获取正确的标题
             const matchType = configTypes.find(t => t.shoddy === scorn)
             // 如果找不到匹配的类型（可能是旧数据），回退到默认逻辑
             const title = matchType ? matchType.deicide : (scorn === 1 ? 'BANCO' : (frau || ''))

             setForm(prev => ({
               ...prev,
               bankType: scorn,
               bankName: frau || '',
               bankCode: manned || '',
               bankAccount: antidote || '',
               bankTypeTitle: title
             }))
          }
        }
      } catch (e) {
        // 忽略错误，可能是新用户
      }
    }
    init()
  }, [])

  // 切换银行类型
  const handleTypeSelect = (type: BankType) => {
    setForm(prev => {
      const isBank = type.shoddy === 1 // 假设 1 是银行卡
      return {
        ...prev,
        bankType: type.shoddy,
        bankTypeTitle: type.deicide,
        bankName: isBank ? '' : type.deicide,
        bankCode: isBank ? '' : (type as any).aciduric || '',
        bankAccount: '' // 切换类型清空账号
      }
    })

    // 针对 Nequi 等自动填充手机号逻辑
    const name = type.deicide.toLowerCase()
    if (name.includes('nequi') || name.includes('daviplata')) {
      const mobile = localStorage.getItem('mobile') || ''
      const cleanMobile = mobile.startsWith('57') ? mobile.slice(2) : mobile
      if (cleanMobile) {
        setForm(prev => ({ ...prev, bankAccount: cleanMobile }))
      }
    }
  }

  // 提交
  const handleSubmit = async () => {
    const { bankType, bankName, bankCode, bankAccount, stepTime } = form
    
    // 校验
    if (!bankType) {
      Toast.show('Por favor seleccione el tipo de cuenta')
      return
    }
    if (bankType === 1 && (!bankName || !bankCode)) {
      Toast.show('Por favor seleccione el banco')
      return
    }
    if (!bankAccount) {
      Toast.show('Por favor ingrese el número de cuenta')
      return
    }
    
    setLoading(true)
    try {
      const payload = {
        scorn: bankType,
        frau: bankName,
        manned: bankCode,
        antidote: bankAccount,
        coxswain: stepTime,
      }
      
      await saveBankInfo(payload)
      markCompleted('bank')
      
      setTimeout(() => {
        if (isProfileEntry) {
          navigate('/my-info')
        } else {
          navigate('/')
        }
      }, 500)
    } catch (error: any) {
      Toast.show(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  // 返回处理
  const handleBack = () => {
    if (isProfileEntry) {
      navigate('/my-info')
    } else {
      navigate('/')
    }
  }

  return (
    <div className={styles['page-container']}>
      <HeaderNav 
        title="Información bancaria" 
        backDirect={!isProfileEntry}
        onBack={handleBack}
      />
      {!isProfileEntry && <ApplySteps steps={[
        { key: 'workInfo', label: 'Laboral' },
        { key: 'contactInfo', label: 'Contactos' },
        { key: 'personalInfo', label: 'Personal' },
        { key: 'identityInfo', label: 'Identidad' },
        { key: 'faceInfo', label: 'Facial' },
        { key: 'bankInfo', label: 'Bancaria' }
      ]} current="bankInfo" />}
      
      <Card className={styles['form-card']}>
        <div className={styles['section-header']}>
          <div className={styles['section-title']}>Información Bancaria</div>
          <div className={styles['section-subtitle']}>Cuenta para recibir el préstamo</div>
        </div>
        
        <Space direction="vertical" block style={{ '--gap': '24px' }}>
          {/* 银行类型选择 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Tipo de cuenta</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {bankTypes.map(item => {
                const isActive = form.bankTypeTitle === item.deicide
                return (
                  <div 
                    key={item.shoddy}
                    onClick={() => handleTypeSelect(item)}
                    style={{
                      border: isActive ? '2px solid #26a69a' : '1px solid #cfd8dc',
                      borderRadius: 12,
                      padding: '12px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: isActive ? '#e0f2f1' : '#ffffff',
                      position: 'relative',
                      transition: 'all 0.3s',
                      boxShadow: isActive ? '0 4px 12px rgba(38, 166, 154, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {isActive && (
                      <div style={{ position: 'absolute', top: 4, right: 4, color: '#26a69a' }}>
                         <CheckIcon />
                      </div>
                    )}
                    {item.adapted && (
                      <img 
                        src={item.adapted} 
                        alt={item.deicide} 
                        style={{ width: 40, height: 40, marginBottom: 8, objectFit: 'contain' }}
                      />
                    )}
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#333', textAlign: 'center', lineHeight: 1.2 }}>
                      {item.deicide}
                    </div>
                    {item.ontogeny && (
                      <div style={{ fontSize: 12, color: '#90a4ae', marginTop: 4, textAlign: 'center' }}>
                        {item.ontogeny}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 银行名称选择 (仅当类型为银行卡时显示) */}
          {form.bankType === 1 && (
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre del banco</label>
              <div 
                className={styles['input-wrapper']} 
                onClick={() => setBankPickerVisible(true)}
              >
                <BankcardOutline className={styles['input-icon']} />
                <div className={styles['input-content']} style={{ color: form.bankName ? '#333333' : '#cccccc' }}>
                  {form.bankName || 'Seleccione el banco'}
                </div>
                <RightOutline color="#cccccc" />
              </div>
              <BankListPopup
                visible={bankPickerVisible}
                onClose={() => setBankPickerVisible(false)}
                onSelect={(bank) => {
                  setForm(prev => ({
                    ...prev,
                    bankCode: bank.code,
                    bankName: bank.name
                  }))
                }}
              />
            </div>
          )}

          {/* 银行账号输入 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>
              {form.bankType === 1 ? 'Número de cuenta' : 'Número de celular'}
            </label>
            <div className={styles['input-wrapper']}>
              <UserOutline className={styles['input-icon']} />
              <Input
                placeholder={form.bankType === 1 ? 'Número de cuenta' : 'Número de celular'}
                value={form.bankAccount}
                onChange={val => setForm(prev => ({ ...prev, bankAccount: val }))}
                style={{ '--font-size': '16px', flex: 1 }}
                clearable
                type="number"
              />
            </div>
          </div>
          
          <div style={{ height: 40 }}></div>
        </Space>
      </Card>

      <div className={styles['submit-bar']}>
        <Button 
          className={styles['submit-btn']}
          block 
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}

// 简单的勾选图标组件
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 24L20 34L38 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
