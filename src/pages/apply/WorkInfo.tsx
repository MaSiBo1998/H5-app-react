import type { ReactElement } from 'react'
import { Card, Space, Button, Input, Cascader, DatePicker, Picker, Toast } from 'antd-mobile'
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
import ApplySteps from '@/pages/apply/components/ApplySteps'
import { getStepConfigInfo, getAddressList, saveWorkInfo } from '@/services/api/apply'
import { useEffect, useMemo, useState } from 'react'
import styles from './ApplyPublic.module.css'
import getNowAndNextStep from './progress'

export default function WorkInfo(): ReactElement {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isProfileEntry = searchParams.get('entry') === 'profile'
  
  const [loading, setLoading] = useState(false)
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
  let startTime: number = 0
  const isWorker = form.workType == 1 || form.workType == 2
  useEffect(() => {
    startTime = new Date().getTime()
    console.log('EntryForm', 'startTime', startTime)
    try {
      (async () => {
        const { nextPath } = await getNowAndNextStep()
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
        const s = localStorage.getItem('applyStepConfig')
        cached = s ? JSON.parse(s) : null
      } catch { }
      try {
        const data = cached ?? await getStepConfigInfo({})
        if (!cached) localStorage.setItem('applyStepConfig', JSON.stringify(data))
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
  }, [])

  const onSubmit = async () => {
    if (!form.workType || !form.salaryRange || (isWorker && (!form.workYears || !form.payFreq))) {
      Toast.show({ content: 'Por favor complete la información requerida' })
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
      if (isProfileEntry) {
        navigate('/my-info')
      } else {
        navigate(nextPath)
      }
    } catch {
      Toast.show({ content: 'Envío fallido' })
    }
    setLoading(false)
  }

  const openAddr = async () => {
    setAddrVisible(true)
  }

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
            <div className={styles['input-wrapper']} onClick={() => setWorkTypeVisible(true)}>
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
            <div className={styles['input-wrapper']} onClick={() => setSalaryRangeVisible(true)}>
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
              <div className={styles['input-wrapper']} onClick={() => setPayFreqVisible(true)}>
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
                <div className={styles['input-wrapper']} onClick={() => setNoFixedVisible(true)}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: form.payDate ? '#333333' : '#cccccc' }}>
                    {form.payDate || 'Seleccionar fecha de pago'}
                  </div>
                  <RightOutline color="#cccccc" />
                </div>
              </div>
            )}

            {/* 单周新 */}
            {showWeekly && (
              <div className={styles['form-group']}>
                <label className={styles['form-label']}>Día de la semana</label>
                <div className={styles['input-wrapper']} onClick={() => setWeeklyVisible(true)}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: form.payDate ? '#333333' : '#cccccc' }}>
                    {form.payDate ? (['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][Number(form.payDate) - 1] || 'Seleccionar día de la semana') : 'Seleccionar día de la semana'}
                  </div>
                  <RightOutline color="#cccccc" />
                </div>
              </div>
            )}

            {/* 双周新 */}
            {showBiweekly && (<>

              <div className={styles['form-group']} style={{ flex: 1 }}>
                <label className={styles['form-label']}>Primer día</label>
                <div className={styles['input-wrapper']} onClick={() => setBiweeklyFirstVisible(true)}>
                  <CalendarOutline className={styles['input-icon']} />
                  <div className={styles['input-content']} style={{ color: (form.payDate || '').split('###')[0] ? '#333333' : '#cccccc' }}>
                    {(form.payDate || '').split('###')[0] || 'Seleccionar primero'}
                  </div>
                </div>
              </div>
              <div className={styles['form-group']} style={{ flex: 1 }}>
                <label className={styles['form-label']}>Segundo día</label>
                <div className={styles['input-wrapper']} onClick={() => setBiweeklySecondVisible(true)}>
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
                <div className={styles['input-wrapper']} onClick={() => setMonthlyVisible(true)}>
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
              <div className={styles['input-wrapper']} onClick={() => setWorkYearsVisible(true)}>
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
                  onChange={v => setForm({ ...form, companyPhone: v })}
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
              <div className={styles['input-wrapper']} onClick={openAddr}>
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
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[options.workType.map(o => ({ label: o.label, value: o.value }))]} visible={workTypeVisible} onClose={() => setWorkTypeVisible(false)} onConfirm={(vals) => { setForm({ ...form, workType: vals[0] as any }); setWorkTypeVisible(false) }} />
      {/* 薪资范围  */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[options.salaryRange.map(o => ({ label: o.label, value: o.value }))]} visible={salaryRangeVisible} onClose={() => setSalaryRangeVisible(false)} onConfirm={(vals) => { setForm({ ...form, salaryRange: vals[0] as any }); setSalaryRangeVisible(false) }} />
      {/* 工作年限 */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[options.workYears.map(o => ({ label: o.label, value: o.value }))]} visible={workYearsVisible} onClose={() => setWorkYearsVisible(false)} onConfirm={(vals) => { setForm({ ...form, workYears: vals[0] as any }); setWorkYearsVisible(false) }} />
      {/*  */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[options.payFreq.map(o => ({ label: o.label, value: o.value }))]} visible={payFreqVisible} onClose={() => setPayFreqVisible(false)} onConfirm={(vals) => {
        const sel = vals[0] as any
        const mode = payFreqModeMap[sel] ?? (typeof sel === 'string' ? (sel as any) : undefined)
        setForm({ ...form, payFreq: sel, payDate: mode === 'no' ? '' : '' })
        setPayFreqVisible(false)
      }} />
      {/* 不固定 */}
      <DatePicker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" precision="day" visible={noFixedVisible} onClose={() => setNoFixedVisible(false)} onConfirm={(val) => {
        const mm = String((val.getMonth() + 1)).padStart(2, '0')
        const dd = String(val.getDate()).padStart(2, '0')
        setForm({ ...form, payDate: `${dd}/${mm}` })
        setNoFixedVisible(false)
      }} />
      {/* 单周新 */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[weekOptions]} visible={weeklyVisible} onClose={() => setWeeklyVisible(false)} onConfirm={(vals) => { setForm({ ...form, payDate: String(vals[0]) }); setWeeklyVisible(false) }} />
      {/* 第一周 */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[dayOptions]} visible={biweeklyFirstVisible} onClose={() => setBiweeklyFirstVisible(false)} onConfirm={(vals) => {
        const val = vals[0] as string
        const parts = (form.payDate || '').split('###')
        const second = parts[1] || ''
        setForm({ ...form, payDate: `${val}###${second}` })
        setBiweeklyFirstVisible(false)
      }} />
      {/* 第二周 */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[dayOptions]} visible={biweeklySecondVisible} onClose={() => setBiweeklySecondVisible(false)} onConfirm={(vals) => {
        const val = vals[0] as string
        const first = (form.payDate || '').split('###')[0] || ''
        setForm({ ...form, payDate: `${first}###${val}` })
        setBiweeklySecondVisible(false)
      }} />
      {/*月薪 */}
      <Picker closeOnMaskClick={false} confirmText="Confirmar" cancelText="Cancelar" columns={[dayOptions]} visible={monthlyVisible} onClose={() => setMonthlyVisible(false)} onConfirm={(vals) => { setForm({ ...form, payDate: String(vals[0]) }); setMonthlyVisible(false) }} />
      {/* 地址 */}
      <Cascader
        confirmText="Confirmar"
        cancelText="Cancelar"
        options={addrOptions}
        visible={addrVisible}
        placeholder="Seleccionar dirección"
        onClose={() => setAddrVisible(false)}
        onConfirm={(val) => {
          setForm({ ...form, companyAddr: val.join('-') })
        }}
      />
      <div className={styles['submit-bar']}>
        <Button color="primary" loading={loading} onClick={onSubmit} block className={styles['submit-btn']}>Continuar</Button>
      </div>
    </div>
  )
}
