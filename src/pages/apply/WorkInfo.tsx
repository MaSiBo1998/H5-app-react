import type { ReactElement } from 'react'
import { Card, Space, Button, Input, Cascader, Picker, DatePicker, Toast } from 'antd-mobile'
import {
  RightOutline,
  UserOutline,
  PayCircleOutline,
  CalendarOutline,
  ClockCircleOutline,
  AppOutline,
  PhoneFill,
  LocationOutline
} from 'antd-mobile-icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import HeaderNav from '@/components/common/HeaderNav'
import ApplySteps from '@/pages/Apply/components/ApplySteps'
import { getStepConfigInfo, getAddressList, saveWorkInfo } from '@/services/api/apply'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'
import styles from './ApplyPublic.module.css'
import getNextStep from './progress'
import { useRiskTracking } from '@/hooks/useRiskTracking'

export default function WorkInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isProfileEntry = searchParams.get('entry') === 'profile'
  
  const [loading, setLoading] = useState(false)
  // 选项配置
  const [options, setOptions] = useState({
    workType: [] as Array<{ label: string; value: string | number }>,
    salaryRange: [] as Array<{ label: string; value: string | number }>,
    workYears: [] as Array<{ label: string; value: string | number }>,
    payFreq: [] as Array<{ label: string; value: string | number }>,
  })
  // 表单信息
  const [form, setForm] = useState({
    workType: undefined as string | number | undefined,
    salaryRange: undefined as string | number | undefined,
    workYears: undefined as string | number | undefined,
    payFreq: undefined as string | number | undefined,
    companyName: '',
    companyPhone: '',
    companyDetail: '',
    companyAddr: '' as string,
    payDate: ''
  })
  const [addrVisible, setAddrVisible] = useState(false)
  const [addrOptions, setAddrOptions] = useState<any[]>([])
  const [payFreqModeMap, setPayFreqModeMap] = useState<Record<string | number, 'no' | 'weekly' | 'biweekly' | 'monthly'>>({})
  
  // 显示状态控制
  const [workTypeVisible, setWorkTypeVisible] = useState(false)
  const [salaryRangeVisible, setSalaryRangeVisible] = useState(false)
  const [workYearsVisible, setWorkYearsVisible] = useState(false)
  const [payFreqVisible, setPayFreqVisible] = useState(false)
  const [weeklyVisible, setWeeklyVisible] = useState(false)
  const [noFixedVisible, setNoFixedVisible] = useState(false)
  const [biweeklyFirstVisible, setBiweeklyFirstVisible] = useState(false)
  const [biweeklySecondVisible, setBiweeklySecondVisible] = useState(false)
  const [monthlyVisible, setMonthlyVisible] = useState(false)
  const [nextPath, setNextPath] = useState('')
  const [startTime,setStartTime] = useState(0)
  const isWorker = form.workType == 1 || form.workType == 2

  // 埋点 Hook
  const { toSetRiskInfo, toSubmitRiskPoint } = useRiskTracking()

  // 埋点相关 Refs
  const pageStartTime = useRef(Date.now())
  const inputData = useRef({
    companyName: { startTime: 0, inputType: 1 },
    companyPhone: { startTime: 0, inputType: 1 },
    companyDetail: { startTime: 0, inputType: 1 }
  })
  const pickerStartTime = useRef(0)



  // Input Handlers
  const handleInputFocus = (field: 'companyName' | 'companyPhone' | 'companyDetail') => {
    inputData.current[field].startTime = Date.now()
    inputData.current[field].inputType = 1
  }

  const handlePaste = (field: 'companyName' | 'companyPhone' | 'companyDetail') => {
    inputData.current[field].inputType = 2
  }

  const handleInputBlur = (field: 'companyName' | 'companyPhone' | 'companyDetail') => {
    const data = inputData.current[field]
    if (data.startTime) {
      const duration = Date.now() - data.startTime
      let timeKey = '', typeKey = ''
      if (field === 'companyName') { timeKey = '12'; typeKey = '11' }
      else if (field === 'companyPhone') { timeKey = '14'; typeKey = '13' }
      else if (field === 'companyDetail') { timeKey = '17'; typeKey = '16' }

      toSetRiskInfo('000004', timeKey, duration)
      toSetRiskInfo('000004', typeKey, data.inputType)
      data.startTime = 0
    }
  }

  // Picker Handlers
  const handlePickerOpen = (type: string) => {
    pickerStartTime.current = Date.now()
    switch (type) {
      case 'workType': setWorkTypeVisible(true); break;
      case 'salaryRange': setSalaryRangeVisible(true); break;
      case 'workYears': setWorkYearsVisible(true); break;
      case 'payFreq': setPayFreqVisible(true); break;
      case 'noFixed': setNoFixedVisible(true); break;
      case 'weekly': setWeeklyVisible(true); break;
      case 'biweeklyFirst': setBiweeklyFirstVisible(true); break;
      case 'biweeklySecond': setBiweeklySecondVisible(true); break;
      case 'monthly': setMonthlyVisible(true); break;
      case 'companyAddr': setAddrVisible(true); break;
    }
  }

  const handlePickerClose = (type: string, _isConfirm: boolean = false) => {
    if (pickerStartTime.current) {
      const duration = Date.now() - pickerStartTime.current
      const keyMap: Record<string, string> = {
        workType: '1', salaryRange: '2', payFreq: '3',
        noFixed: '4', weekly: '5', biweeklyFirst: '6', biweeklySecond: '7', monthly: '8',
        workYears: '9', companyAddr: '15'
      }
      if (keyMap[type]) {
        toSetRiskInfo('000004', keyMap[type], duration)
      }
      pickerStartTime.current = 0
    }
    switch (type) {
      case 'workType': setWorkTypeVisible(false); break;
      case 'salaryRange': setSalaryRangeVisible(false); break;
      case 'workYears': setWorkYearsVisible(false); break;
      case 'payFreq': setPayFreqVisible(false); break;
      case 'noFixed': setNoFixedVisible(false); break;
      case 'weekly': setWeeklyVisible(false); break;
      case 'biweeklyFirst': setBiweeklyFirstVisible(false); break;
      case 'biweeklySecond': setBiweeklySecondVisible(false); break;
      case 'monthly': setMonthlyVisible(false); break;
      case 'companyAddr': setAddrVisible(false); break;
    }
  }

  // 初始化
  useEffect(() => {
    setStartTime(new Date().getTime())
    console.log('WorkInfo', 'startTime', startTime)
    try {
      (async () => {
        const { nextPath } = await getNextStep('/work')
        setNextPath(nextPath ?? '')
      })()
    } catch (error) {
    }
    const extractSpec = (data: any, code: number): Array<{ label: string; value: string | number }> => {
      if (!Array.isArray(data)) return []
      const hit = data.find((it: any) => it && Number(it.calices) === code)
      const arr = Array.isArray(hit?.sawback) ? hit.sawback : []
      return arr.map((x: any) => ({ label: String(x?.deicide ?? ''), value: (x?.shoddy as string | number) }))
    }
    const init = async () => {
      let cached: any = null
      try {
        cached = getStorage(StorageKeys.APPLY_STEP_CONFIG)
      } catch { }
      
      try {
        let data = cached
        if (!data || (Array.isArray(data) && data.length === 0)) {
           try {
             data = await getStepConfigInfo({})
             if (data) setStorage(StorageKeys.APPLY_STEP_CONFIG, data)
           } catch (e) {
             console.error('Fetch config failed', e)
           }
        }
        
        // Fallback to empty array if still null
        data = data || []
        
        const workType = extractSpec(data, 1)
        const salaryRange = extractSpec(data, 2)
        const workYears = extractSpec(data, 3)
        const payFreq = extractSpec(data, 4)
        setOptions({
          workType,
          salaryRange,
          workYears,
          payFreq
        })
        const normalize = (s: string): string => s.trim().toLowerCase()
        const modeMap: Record<string | number, 'no' | 'weekly' | 'biweekly' | 'monthly'> = {}
        ; (payFreq.length ? payFreq : [
          { label: 'no arreglado', value: 'no' },
          { label: 'salario semanal', value: 'weekly' },
          { label: 'salario quincenal', value: 'biweekly' },
          { label: 'salario mensual', value: 'monthly' },
        ]).forEach(opt => {
          const l = normalize(opt.label)
          if (l.includes('no arreglado')) modeMap[opt.value] = 'no'
          else if (l.includes('semanal')) modeMap[opt.value] = 'weekly'
          else if (l.includes('quincenal')) modeMap[opt.value] = 'biweekly'
          else if (l.includes('mensual')) modeMap[opt.value] = 'monthly'
        })
        setPayFreqModeMap(modeMap)
      } catch { }
      
      try {
        const res: any = await getAddressList({})
        const arr = Array.isArray(res.subscibe) ? res.subscibe : []
        const fmt = arr.map((p: any) => ({
          label: p.willis,
          value: p.willis,
          children: Array.isArray(p.cityList) ? p.cityList.map((c: any) => ({
            label: c.oversing,
            value: c.oversing
          })) : []
        }))
        setAddrOptions(fmt)
      } catch { }
    }
    init()

    return () => {
      // 页面卸载时埋点
      const duration = Date.now() - pageStartTime.current
      toSetRiskInfo('000005', '2', duration)
      toSubmitRiskPoint()
    }
  }, [])

  // 提交表单
  const onSubmit = async () => {
    if (!form.workType || !form.salaryRange || (isWorker && (!form.workYears || !form.payFreq))) {
      Toast.show({ content: 'Por favor complete la información requerida' })
      toSetRiskInfo('000005', '8', '1')
      return
    }
    setLoading(true)
    try {
      const payload = {
        phytin: form.workType,
        osteoid: form.salaryRange,
        sprucy: isWorker ? form.payFreq: '',
        trillion: isWorker ? form.companyName: '',
        mouse: isWorker ? form.companyPhone: '',
        currie: isWorker ? form.companyDetail: '',
        blewits: isWorker ? form.companyAddr: '',
        reval: isWorker ? form.payDate : '',
        coxswain:startTime
      }
      await saveWorkInfo(payload)
      toSetRiskInfo('000005', '9', '1')
      await toSubmitRiskPoint()
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(nextPath || '/')
      }
    } catch {
      Toast.show({ content: 'Envío fallido' })
      toSetRiskInfo('000005', '9', '0')
    }
    setLoading(false)
  }

  // 计算当前发薪模式
  const curMode: 'no' | 'weekly' | 'biweekly' | 'monthly' | undefined = (() => {
    const key = form.payFreq as any
    const m = payFreqModeMap[key]
    if (m) return m
    if (typeof key === 'string') return key as any
    return undefined
  })()
  const showNoFixed = curMode === 'no'
  const showWeekly = curMode === 'weekly'
  const showBiweekly = curMode === 'biweekly'
  const showMonthly = curMode === 'monthly'
  const weekOptions = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 7 },
  ]
  const dayOptions = useMemo(() => Array.from({ length: 31 }).map((_, i) => {
    const v = String(i + 1).padStart(2, '0')
    return { label: v, value: v }
  }), [])

  const monthOptions = useMemo(() => [
    { label: 'Enero', value: '01' },
    { label: 'Febrero', value: '02' },
    { label: 'Marzo', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Mayo', value: '05' },
    { label: 'Junio', value: '06' },
    { label: 'Julio', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Septiembre', value: '09' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
  ], [])

  return (
    <div className={styles['page-container']}>
      <HeaderNav
        title="Información laboral"
        onBack={isProfileEntry ? () => navigate('/my-info') : undefined}
        backDirect={!isProfileEntry}
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
          current="work"
        />
      )}
      <Card className={styles['form-card']}>
        <div className={styles['section-header']}>
          <div className={styles['section-title']}>Información Laboral</div>
          <div className={styles['section-subtitle']}>Completa los detalles de tu empleo actual</div>
        </div>
        <Space direction="vertical" block>
          {/* 工作类型 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Tipo de trabajo</label>
            <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('workType')}>
              <UserOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.workType ? '#333333' : '#cccccc' }}>
                {(() => {
                  const it = options.workType.find(o => o.value === form.workType)
                  return it ? it.label : 'Seleccionar tipo de trabajo'
                })()}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {/* 薪资范围 */}
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Rango salarial</label>
            <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('salaryRange')}>
              <PayCircleOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.salaryRange ? '#333333' : '#cccccc' }}>
                {(() => {
                  const it = options.salaryRange.find(o => o.value === form.salaryRange)
                  return it ? it.label : 'Seleccionar rango salarial'
                })()}
              </div>
              <RightOutline color="#cccccc" />
            </div>
          </div>

          {isWorker && (<>
            {/* 发薪频率 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Frecuencia de pago</label>
              <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('payFreq')}>
                <CalendarOutline className={styles['input-icon']} />
                <div className={styles['input-content']} style={{ color: form.payFreq ? '#333333' : '#cccccc' }}>
                  {(() => {
                    const it = options.payFreq.find(o => o.value === form.payFreq)
                    return it ? it.label : 'Seleccionar frecuencia de pago'
                  })()}
                </div>
                <RightOutline color="#cccccc" />
              </div>
            </div>
            {/* 不固定 */}
            {showNoFixed && (
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Fecha de pago</label>
                <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('noFixed')}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: form.payDate ? '#333333' : '#cccccc' }}>
                    {form.payDate || 'Seleccionar fecha de pago'}
                  </div>
                  <RightOutline color="#cccccc" />
                </div>
              </div>
            )}

            {/* 单周 */}
            {showWeekly && (
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Día de la semana</label>
                <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('weekly')}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: form.payDate ? '#333333' : '#cccccc' }}>
                    {form.payDate ? (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][Number(form.payDate) - 1] || 'Seleccionar día de la semana') : 'Seleccionar día de la semana'}
                  </div>
                  <RightOutline color="#cccccc" />
                </div>
              </div>
            )}

            {/* 双周 */}
            {showBiweekly && (<>

              <div className={styles['form-group']} style={{ flex: 1 }}>
                <label className={styles['form-label']}>Primer día</label>
                <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('biweeklyFirst')}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: (form.payDate || '').split('###')[0] ? '#333333' : '#cccccc' }}>
                    {(form.payDate || '').split('###')[0] || 'Seleccionar primero'}
                  </div>
                </div>
              </div>
              <div className={styles['form-group']} style={{ flex: 1 }}>
                <label className={styles['form-label']}>Segundo día</label>
                <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('biweeklySecond')}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: (form.payDate || '').split('###')[1] ? '#333333' : '#cccccc' }}>
                    {(form.payDate || '').split('###')[1] || 'Seleccionar segundo'}
                  </div>
                </div>
              </div>
            </>
            )}

            {/* 月薪 */}
            {showMonthly && (
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Día del mes</label>
                <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('monthly')}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: form.payDate ? '#333333' : '#cccccc' }}>
                    {form.payDate ? `Cada mes día ${String(form.payDate).padStart(2, '0')}` : 'Seleccionar día de pago'}
                  </div>
                  <RightOutline color="#cccccc" />
                </div>
              </div>
            )}
            {/* 工作年限 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Años de trabajo</label>
              <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('workYears')}>
                <ClockCircleOutline className={styles['input-icon']} />
                <div className={styles['input-content']} style={{ color: form.workYears ? '#333333' : '#cccccc' }}>
                  {(() => {
                    const it = options.workYears.find(o => o.value === form.workYears)
                    return it ? it.label : 'Seleccionar años de trabajo'
                  })()}
                </div>
                <RightOutline color="#cccccc" />
              </div>
            </div>
            {/* 公司名称 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Nombre de la empresa</label>
              <div className={styles['input-wrapper']}>
                <AppOutline className={styles['input-icon']} />
                <Input
                  value={form.companyName}
                  onChange={v => setForm({ ...form, companyName: v })}
                  onFocus={() => handleInputFocus('companyName')}
                  onBlur={() => handleInputBlur('companyName')}
                  onPaste={() => handlePaste('companyName')}
                  placeholder="Ingresa el nombre de la empresa"
                  clearable
                  style={{ '--font-size': '16px', flex: 1 }}
                />
              </div>
            </div>
            {/* 公司电话 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Teléfono de la empresa</label>
              <div className={styles['input-wrapper']}>
                <PhoneFill className={styles['input-icon']} />
                <Input
                  value={form.companyPhone}
                  onChange={v =>{
                    if(v.length >10){
                      setForm({ ...form, companyPhone: v.slice(0, 10) })
                    }else{
                      setForm({ ...form, companyPhone: v })
                    }
                  } }
                  onFocus={() => handleInputFocus('companyPhone')}
                  onBlur={() => handleInputBlur('companyPhone')}
                  onPaste={() => handlePaste('companyPhone')}
                  placeholder="Ingresa el teléfono de la empresa"
                  type="tel"
                  clearable
                  style={{ '--font-size': '16px', flex: 1 }}
                />
              </div>
            </div>
            {/* 公司地址 */}
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>Dirección de la empresa</label>
              <div className={styles['input-wrapper']} onClick={() => handlePickerOpen('companyAddr')}>
              <LocationOutline className={styles['input-icon']} />
              <div className={styles['input-content']} style={{ color: form.companyAddr ? '#333333' : '#cccccc' }}>
                {form.companyAddr || 'Seleccionar dirección'}
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
                  value={form.companyDetail}
                  onChange={v => setForm({ ...form, companyDetail: v })}
                  onFocus={() => handleInputFocus('companyDetail')}
                  onBlur={() => handleInputBlur('companyDetail')}
                  onPaste={() => handlePaste('companyDetail')}
                  placeholder="Ingresa el detalle de la dirección (opcional)"
                  clearable
                  style={{ '--font-size': '16px', flex: 1 }}
                />
              </div>
            </div>
          </>)}
          <div style={{ height: 68 }}></div>
        </Space>
      </Card>
      {/* 工作类型 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[options.workType.map(o => ({ label: o.label, value: o.value }))]} visible={workTypeVisible} onClose={() => handlePickerClose('workType')} onConfirm={(vals) => { setForm({ ...form, workType: vals[0] as any }); handlePickerClose('workType', true) }} />
      {/* 薪资范围  */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[options.salaryRange.map(o => ({ label: o.label, value: o.value }))]} visible={salaryRangeVisible} onClose={() => handlePickerClose('salaryRange')} onConfirm={(vals) => { setForm({ ...form, salaryRange: vals[0] as any }); handlePickerClose('salaryRange', true) }} />
      {/* 工作年限 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[options.workYears.map(o => ({ label: o.label, value: o.value }))]} visible={workYearsVisible} onClose={() => handlePickerClose('workYears')} onConfirm={(vals) => { setForm({ ...form, workYears: vals[0] as any }); handlePickerClose('workYears', true) }} />
      {/*  */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[options.payFreq.map(o => ({ label: o.label, value: o.value }))]} visible={payFreqVisible} onClose={() => handlePickerClose('payFreq')} onConfirm={(vals) => {
        const sel = vals[0] as any
        const mode = payFreqModeMap[sel] ?? (typeof sel === 'string' ? (sel as any) : undefined)
        setForm({ ...form, payFreq: sel, payDate: mode === 'no' ? '' : '' })
        handlePickerClose('payFreq', true)
      }} />
      {/* 不固定 - 选择日期和月份 */}
      <DatePicker
        visible={noFixedVisible}
        onClose={() => handlePickerClose('noFixed')}
        precision="day"
        className={styles.noYearDatePicker}
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        min={new Date(new Date().getFullYear(), 0, 1)}
        max={new Date(new Date().getFullYear(), 11, 31)}
        renderLabel={(type, data) => {
          if (type === 'month') {
            return monthOptions[data - 1]?.label || data
          }
          return data
        }}
        value={(() => {
          if (form.payDate && form.payDate.includes('/')) {
            const [d, m] = form.payDate.split('/')
            const now = new Date()
            return new Date(now.getFullYear(), parseInt(m) - 1, parseInt(d))
          }
          return new Date()
        })()}
        onConfirm={(val) => {
          const d = String(val.getDate()).padStart(2, '0')
          const m = String(val.getMonth() + 1).padStart(2, '0')
          setForm({ ...form, payDate: `${d}/${m}` })
          handlePickerClose('noFixed', true)
        }}
      />
      {/* 单周新 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[weekOptions]} visible={weeklyVisible} onClose={() => handlePickerClose('weekly')} onConfirm={(vals) => { setForm({ ...form, payDate: String(vals[0]) }); handlePickerClose('weekly', true) }} />
      {/* 第一周 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[dayOptions]} visible={biweeklyFirstVisible} onClose={() => handlePickerClose('biweeklyFirst')} onConfirm={(vals) => {
        const val = vals[0] as string
        const parts = (form.payDate || '').split('###')
        const second = parts[1] || ''
        setForm({ ...form, payDate: `${val}###${second}` })
        handlePickerClose('biweeklyFirst', true)
      }} />
      {/* 第二周 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[dayOptions]} visible={biweeklySecondVisible} onClose={() => handlePickerClose('biweeklySecond')} onConfirm={(vals) => {
        const val = vals[0] as string
        const first = (form.payDate || '').split('###')[0] || ''
        setForm({ ...form, payDate: `${first}###${val}` })
        handlePickerClose('biweeklySecond', true)
      }} />
      {/*月薪 */}
      <Picker closeOnMaskClick={false} confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>} cancelText={<span style={{ color: '#999999' }}>Cancelar</span>} columns={[dayOptions]} visible={monthlyVisible} onClose={() => handlePickerClose('monthly')} onConfirm={(vals) => { setForm({ ...form, payDate: String(vals[0]) }); handlePickerClose('monthly', true) }} />
      {/* 地址 */}
      <Cascader
        title="Seleccionar dirección"
        confirmText={<span style={{ color: '#26a69a' }}>Confirmar</span>}
        cancelText={<span style={{ color: '#999999' }}>Cancelar</span>}
        placeholder="Seleccionar"
        options={addrOptions}
        visible={addrVisible}
        onClose={() => handlePickerClose('companyAddr')}
        onConfirm={(val) => {
          setForm({ ...form, companyAddr: val.join('-') })
          handlePickerClose('companyAddr', true)
        }}
      />
      <div className={styles['submit-bar']}>
        <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
      </div>
    </div>
  )
}
