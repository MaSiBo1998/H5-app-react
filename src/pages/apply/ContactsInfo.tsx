import { useEffect, useState, type ReactElement } from 'react'
import { Card, Space, Input, Picker, Button, Toast } from 'antd-mobile'
// import { useNavigate } from 'react-router-dom'
import getNowAndNextStep from '@/pages/apply/progress'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/apply/components/ApplySteps'
import styles from './ApplyPublic.module.css'
import { CalendarOutline, PhonebookOutline, RightOutline, UserOutline } from 'antd-mobile-icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveContactInfo } from '@/services/api/apply'
export default function ContactsInfo(): ReactElement {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 是否从个人中心进入
  const isProfileEntry = searchParams.get('entry') === 'profile'

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

  // 初始化
  useEffect(() => {
    setForm({...form,coxswain:new Date().getTime()})
    // 获取下一步直接跳转的路径
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {

    }
    // 获取配置项
    try {
      const stepConfig: Array<any> = JSON.parse(localStorage.getItem('applyStepConfig') || '[]')
      if (stepConfig) {
        const contactStep = stepConfig.find(item => item.calices == 11)
        if (contactStep) {
          setOptions(prev => ({
            ...prev,
            relation: (contactStep.sawback || []).map((item: any) => ({ deicide: item.deicide, shoddy: item.shoddy }))
          }))
        }
      }
    } catch (error) {

    }
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
  const onSubmit = () => {
    // 校验逻辑
    for (let i = 0; i < form.deedy.length; i++) {
      const item = form.deedy[i]
      const isMandatory = i < 3
      const hasAny = item.verdure || item.decile || item.jacobin
      const hasAll = item.verdure && item.decile && item.jacobin

      if (isMandatory) {
        if (!hasAll) {
          Toast.show(`Por favor complete la información del contacto ${i + 1}`)
          return
        }
      } else {
        // 选填项，如果填写了任意一项，则必须全部填写
        if (hasAny && !hasAll) {
          Toast.show(`Por favor complete toda la información del contacto ${i + 1}`)
          return
        }
      }
    }

    setLoading(true)
    // 提交前给手机号添加57前缀，并过滤掉空数据
    const submitForm = {
      ...form,
      deedy: form.deedy
        .filter(item => item.verdure || item.decile || item.jacobin)
        .map(item => ({
          ...item,
          verdure: item.verdure ? `57${item.verdure}` : item.verdure
        }))
    }
    saveContactInfo(submitForm).then(() => {
        setLoading(false)
        if (isProfileEntry) {
          navigate('/my-info')
        } else {
          navigate(nextPath)
        }
      }).catch(() => {
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
                            let val = v.replace(/\D/g, '')
                            if (val.length > 10) val = val.slice(0, 10)
                            setForm({ ...form, deedy: form.deedy.map((item, i) => i === index ? { ...item, verdure: val } : item) })
                          }}
                          placeholder={'300 123 456' + index}
                          clearable
                          type='number'
                          style={{ '--font-size': '16px', flex: 1 }}
                        />
                      </div>
                    </div>
                    {/* 联系人关系 */}
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Relación{index + 1} {index > 2 ? '(opcional)' : ''}</label>
                      <div className={styles['input-wrapper']} onClick={() => {
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
                          onChange={v => setForm({ ...form, deedy: form.deedy.map((item, i) => i === index ? { ...item, jacobin: v } : item) })}
                          placeholder='jack maray'
                          clearable
                          style={{ '--font-size': '16px', flex: 1 }}
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
            confirmText="Confirmar"
            cancelText="Cancelar"
            columns={[options.relation.map(o => ({ label: o.deicide, value: o.shoddy }))]}
            visible={relationVisible}
            onClose={() => setRelationVisible(false)}
            onConfirm={(vals) => {
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
