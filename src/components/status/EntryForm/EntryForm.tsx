import type { ReactElement } from "react"
import { useMemo, useState, useEffect } from "react"
import { Slider, Toast } from "antd-mobile"
import { PayCircleOutline, CheckCircleOutline, ClockCircleOutline } from "antd-mobile-icons"
import { useNavigate } from "react-router-dom"
import type { StatusData, StatusItem } from "../types"
import styles from './EntryForm.module.css'
import getNowAndNextStep from "@/pages/apply/progress"

export default function EntryForm({ data }: { data: StatusData }): ReactElement {
  const navigate = useNavigate()
  // 获取第一条额度数据
  const first: StatusItem | undefined = Array.isArray(data?.atony) ? data!.atony![0] : undefined
  const maxAmount = first?.shammash
  const minAmount = first?.bindwood
  const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

  const min = typeof minAmount === 'number' ? minAmount : 0
  const max = typeof maxAmount === 'number' ? maxAmount : 0
  // 是否有效
  const valid = max > min
  // 默认金额
  const defaultAmount = useMemo(() => (valid ? max : 0), [max, valid])
  // 金额状态
  const [amount, setAmount] = useState<number>(defaultAmount)
  // 期限状态
  const [days, setDays] = useState<number>(180)
  // 当前日期
  const today = useMemo(() => new Date(), [])
  const fmtDate = (d: Date) => new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: '2-digit' }).format(d)
  // 到期日期
  const dueDate = useMemo(() => new Date(today.getTime() + days * 24 * 60 * 60 * 1000), [today, days])
  const step = 5000
  // 快捷金额选项
  const quickValues = useMemo(() => {
    if (!valid) return [] as number[]
    const ps = [0.25, 0.5, 0.75, 1]
    return ps.map(p => Math.round(min + (max - min) * p))
  }, [min, max, valid])

  const termOptions = [
    { label: '90 días', value: 90 },
    { label: '120 días', value: 120 },
    { label: '180 días', value: 180 },
  ]
  // 当前路径
  const [nowPath, setNowPath] = useState('')

  // 初始化获取状态
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { nowPath, nextPath } = await getNowAndNextStep()
        if (nowPath) {
          console.log('nowPath:', nowPath)
          console.log('Next path:', nextPath)
          setNowPath(nowPath)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchStatus()
  }, [])

  // 跳转申请
  const goEntry = async () => {
    if (nowPath) {
      navigate(nowPath)
      return
    }
    
    Toast.show({
      icon: 'loading',
      content: 'Cargando...',
      duration: 0,
    })
    
    try {
      const { nowPath } = await getNowAndNextStep()
      Toast.clear()
      if (nowPath) {
        navigate(nowPath)
      } 
    } catch (e) {
      Toast.clear()
    }
  }

  return (
    <div className={styles.container}>
      {/* 头部卡片 */}
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['header-top']}>
            <div className={styles['header-title']}>
              <PayCircleOutline /> Límite disponible
            </div>
            <div className={styles['max-badge']}>Crédito Premium</div>
          </div>
          <div className={styles['limit-amount']}>${fmt(maxAmount)}</div>
          <div className={styles['limit-range']}>Rango: ${fmt(minAmount)} - ${fmt(maxAmount)}</div>
        </div>
      </div>

      {/* 主要交互卡片 */}
      <div className={styles['main-card']}>

        {/* 金额选择部分 */}
        <div className={styles['section-label']}>¿Cuánto dinero necesitas?</div>

        <div className={styles['amount-display-wrapper']}>
          <span className={styles['currency-symbol']}>$</span>
          <span className={styles['current-amount']}>{fmt(amount)}</span>
        </div>

        <div className={styles['slider-container']}>
          <Slider
            min={min}
            max={max}
            step={step}
            value={amount}
            onChange={val => setAmount(val as number)}
            disabled={!valid}
          />
        </div>

        {valid && (
          <div className={styles['quick-options']}>
            {quickValues.map((v, i) => {
              const isMax = i === quickValues.length - 1
              const label = isMax ? 'Máximo' : `${(i + 1) * 25}%`
              return (
                <div
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`${styles['quick-chip']} ${amount === v ? styles['quick-chip-active'] : ''}`}
                >
                  {label}
                </div>
              )
            })}
          </div>
        )}

        {/* 期限选择部分 */}
        <div className={styles['section-label']} style={{ marginTop: 32 }}>Plazo de pago</div>
        <div className={styles['term-selector']}>
          <div className={styles['term-options']}>
            {termOptions.map(opt => (
              <div
                key={opt.value}
                className={`${styles['term-card']} ${days === opt.value ? styles['term-card-active'] : ''}`}
                onClick={() => setDays(opt.value)}
              >
                <span className={styles['term-value']}>{opt.value}</span>
                <span className={styles['term-label']}>días</span>
              </div>
            ))}
          </div>
        </div>

        {/* 摘要部分 */}
        <div className={styles['summary-box']}>
          <div className={styles['summary-row']}>
            <div className={styles['summary-label']}>
              <PayCircleOutline fontSize={16} /> Fecha de desembolso
            </div>
            <div className={styles['summary-value']}>{fmtDate(today)}</div>
          </div>
          <div className={styles['summary-row']}>
            <div className={styles['summary-label']}>
              <ClockCircleOutline fontSize={16} /> Fecha de pago
            </div>
            <div className={`${styles['summary-value']} ${styles['highlight-value']}`}>{fmtDate(dueDate)}</div>
          </div>
        </div>

      </div>

      {/* 底部固定按钮 */}
      <div className={styles['footer-fixed']}>
        <button onClick={goEntry} className={styles['submit-btn']}>
          Solicitar ahora
        </button>
        <div className={styles['benefits-row']}>
          <div className={styles['benefit-tag']}><CheckCircleOutline /> Aprobación rápida</div>
          <div className={styles['benefit-tag']}><CheckCircleOutline /> Seguro y confiable</div>
        </div>
      </div>
    </div>
  )
}
