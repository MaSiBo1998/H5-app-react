import type { ReactElement } from "react"
import { useState, useMemo, useEffect } from "react"
import { Slider, Toast } from "antd-mobile"
import { CheckCircleFill, CheckCircleOutline, BillOutline, PayCircleOutline } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './LoanUnconfirmed.module.css'

export default function LoanUnconfirmed({ data }: { data: StatusData }): ReactElement {
  
  // Data extraction logic
  const productDataList = useMemo(() => {
    return data?.atony?.[0]?.valour?.duodenal ?? data?.atony?.[0]?.duodenal ?? []
  }, [data])

  const [limitIndex, setLimitIndex] = useState(0)
  const productData = useMemo(() => productDataList[limitIndex] || {}, [productDataList, limitIndex])

  const min = productData.bindwood || 0
  const max = productData.shammash || 0
  const step = 5000 
  const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

  const [amount, setAmount] = useState(min)
  const [isAgree, setIsAgree] = useState(true)

  useEffect(() => {
    if (min > 0) setAmount(min)
  }, [min])

  // Calculated values
  const repayAmount = amount // Simplified
  const repayDate = useMemo(() => {
      if (!productData.fistic) return ''
      const date = new Date()
      date.setDate(date.getDate() + (productData.fistic - 1))
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }, [productData.fistic])

  const handleSubmit = () => {
    if (!isAgree) return
    Toast.show({
        icon: 'loading',
        content: 'Procesando...',
    })
    setTimeout(() => {
        Toast.clear()
        Toast.show({
            icon: 'success',
            content: 'Solicitud enviada',
        })
    }, 1000)
  }

  if (productDataList.length === 0) {
      return <div>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['header-title']}>Confirmar Préstamo</div>
        </div>
      </div>
      
      {/* Main Card */}
      <div className={styles['main-card']}>
        
        {/* Amount Section */}
        <div className={styles['section-label']}>Importe del préstamo($COP)</div>
        
        <div className={styles['amount-display-wrapper']}>
          <span className={styles['currency-symbol']}>$</span>
          <span className={styles['current-amount']}>{fmt(amount)}</span>
        </div>

        {min !== max && (
            <div className={styles['slider-container']}>
                <Slider 
                    min={min} 
                    max={max} 
                    step={step} 
                    value={amount} 
                    onChange={(val) => setAmount(val as number)}
                />
                <div className={styles['slider-nums']}>
                    <span>${fmt(min)}</span>
                    <span>${fmt(max)}</span>
                </div>
            </div>
        )}

        {/* Term Section */}
        <div className={styles['section-label']} style={{ marginTop: 32 }}>Duración</div>
        <div className={styles['term-options']}>
            {productDataList.map((item: any, index: number) => (
                <div 
                    key={index} 
                    className={`${styles['term-card']} ${limitIndex === index ? styles['term-card-active'] : ''}`}
                    onClick={() => setLimitIndex(index)}
                >
                    <span className={styles['term-value']}>{item.fistic}</span>
                    <span className={styles['term-label']}>días</span>
                </div>
            ))}
        </div>

        {/* Details List */}
        <div className={styles['detail-list']}>
            <div className={styles['detail-item']}>
                <div className={styles['detail-label']}>Monto de Préstamo</div>
                <div className={styles['detail-value']}>${fmt(amount)}</div>
            </div>
            <div className={styles['detail-item']}>
                <div className={styles['detail-label']}>Monto a Pagar</div>
                <div className={styles['detail-value']}>${fmt(repayAmount)}</div>
            </div>
            <div className={styles['detail-item']}>
                <div className={styles['detail-label']}>
                    <BillOutline style={{ marginRight: 4 }} />
                    Fecha de pago
                </div>
                <div className={styles['detail-value']}>{repayDate}</div>
            </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className={styles['footer-fixed']}>
        <button 
            className={styles['submit-btn']}
            disabled={!isAgree}
            onClick={handleSubmit}
        >
            Confirmar
        </button>

        <div className={styles.agreement}>
             <div className={styles.checkbox} onClick={() => setIsAgree(!isAgree)}>
                 {isAgree ? <CheckCircleFill /> : <CheckCircleOutline style={{ color: '#ccc' }} />}
             </div>
             <span>
                 He leído y acepto los <span style={{ color: '#26a69a', marginLeft: 4 }}>Acuerdo de préstamo</span>
             </span>
        </div>
      </div>
    </div>
  )
}
