import { useMemo, useState, useEffect } from 'react'
import { Popup } from 'antd-mobile'
import { RightOutline } from 'antd-mobile-icons'
import styles from './LoanDetailPopup.module.css'

interface LoanDetailPopupProps {
  visible: boolean
  onClose: () => void
  productData: any
  amount: number
  loanStartDate?: string // DD/MM/YYYY
}

export default function LoanDetailPopup({
  visible,
  onClose,
  productData,
  amount,
  loanStartDate,
}: LoanDetailPopupProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Reset expanded index when opened
  useEffect(() => {
    if (visible) {
      setExpandedIndex(0)
    }
  }, [visible])

  const formatAmount = (num: number) => {
    return Number(num).toFixed(2)
  }

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return new Date()
    const parts = dateStr.split('/')
    if (parts.length !== 3) return new Date()
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const loanList = useMemo(() => {
    if (!productData || !productData.fiefdom) {
      return []
    }

    const periods = productData.fiefdom // 总期数
    const totalDays = productData.fistic // 总天数
    const daysPerPeriod = Math.floor(totalDays / periods) // 每期天数

    const startDate = parseDate(loanStartDate)
    const result = []

    // Rate and Fee extraction (Default to 0 if missing)
    // Assuming productData has these fields from backend as in Vue example
    const seacoast = productData.seacoast || 0 // Interest Rate
  
    // Principal (using user selected amount)
    const principalTotal = amount

    for (let i = 1; i <= periods; i++) {
      // Calculate repayment date
      const currentRepayDate = new Date(startDate)
      currentRepayDate.setDate(startDate.getDate() + daysPerPeriod * i)
      const repayDateStr = formatDate(currentRepayDate)

      // Calculate amounts per period
      const principalPerPeriod = principalTotal / periods
      
      // 利息: (本金 * 利率 * 天数) / 期数
    // Vue 逻辑: (obj.shammash * obj.seacoast * obj.fistic) / obj.fiefdom
    const interestPerPeriod = (amount * seacoast * totalDays) / periods
    
    // 还款额: 本金 + 利息
    // Vue 逻辑: (obj.shammash + obj.shammash * obj.seacoast * obj.fistic) / obj.fiefdom
    // 似乎 Vue 逻辑没有将服务费或税费加到 'repayment' 字段，
    // 但 'repayment' 通常意味着应还总额。
    // 再次检查 Vue：
    // repayment: (obj.shammash + obj.shammash * obj.seacoast * obj.fistic) / obj.fiefdom
    // 它只包含本金 + 利息。
    // 但是显示的详情有服务费？
    // Vue 模板显示：本金，利息，日期。
    // 等等，Vue 模板有："Incluyendo principal", "Interés", "Fecha de reembolso"。
    // 它在提供的模板展开详情中并没有显示服务费或税费！
    // 但是 processLoanToArray 计算了它们。
    // 我将遵循模板：本金 + 利息。
    
    const repaymentPerPeriod = principalPerPeriod + interestPerPeriod

      result.push({
        period: i,
        repayDate: repayDateStr,
        principal: principalPerPeriod,
        interest: interestPerPeriod,
        repayment: repaymentPerPeriod
      })
    }

    return result
  }, [productData, amount, loanStartDate])

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{ borderRadius: '24px 24px 0 0' }}
    >
      <div className={styles['dialog-top']}>
        <div className={styles['dialog-title']}>Plan de reembolso</div>
      </div>
      <div className={styles['dialog-content']}>
        {loanList.map((item, index) => (
          <div
            key={index}
            className={`${styles['loan-item']} ${expandedIndex === index ? styles.expanded : ''}`}
          >
            <div className={styles['loan-header']} onClick={() => toggleExpand(index)}>
              <div className={styles['header-left']}>
                <span className={styles.period}>Período {item.period}</span>
              </div>
              <div className={styles['header-right']}>
                <span className={styles.date}>{formatAmount(item.repayment)}</span>
                <RightOutline
                  className={`${styles.arrow} ${expandedIndex === index ? styles.rotated : ''}`}
                />
              </div>
            </div>
            {expandedIndex === index && (
              <div className={styles['loan-detail']}>
                <div className={styles['detail-item']}>
                  <div className={styles['detail-label']}>Incluyendo principal</div>
                  <div className={styles['detail-value']}>{formatAmount(item.principal)} pesos</div>
                </div>
                <div className={styles['detail-item']}>
                  <div className={styles['detail-label']}>Interés</div>
                  <div className={styles['detail-value']}>{formatAmount(item.interest)} pesos</div>
                </div>
                <div className={styles['detail-item']}>
                  <div className={styles['detail-label']}>Fecha de reembolso</div>
                  <div className={styles['detail-value']}>{item.repayDate}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        {loanList.length === 0 && (
           <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
             No hay información del plan de pagos.
           </div>
        )}
      </div>
    </Popup>
  )
}
