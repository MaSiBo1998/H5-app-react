import type { ReactElement } from "react"
import type { StatusData } from "../types"
import styles from './LoanInProgress.module.css'
import { ClockCircleOutline } from "antd-mobile-icons"

export default function LoanInProgress({ data }: { data: StatusData }): ReactElement {
  // Vue对应逻辑: appProductData.scuzzy.yell
  // 数据源: data.atony[0].scuzzy.yell
  const loanInfo = data.atony?.[0]?.scuzzy?.yell
  
  const amount = loanInfo?.laterite
  const days = loanInfo?.fistic
  const account = loanInfo?.antidote

  const maskedAccount = account && account.length > 4 
    ? `************${account.substring(account.length - 4)}` 
    : account
  
  const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['status-icon']}>
             <ClockCircleOutline fontSize={48} color="#ffffff" />
          </div>
          <div className={styles['header-title']}>
            Está dando el préstamo
          </div>
          <div className={styles['header-subtitle']}>
            Hay retraso bancario en el proceso del envío de dinero, le avisaremos
            por SMS cuando la transferencia sea exitosa.
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['detail-list']}>
          <div className={styles['detail-item']}>
            <div className={styles['detail-label']}>Monto del préstamo</div>
            <div className={`${styles['detail-value']} ${styles.highlight}`}>${fmt(amount)}</div>
          </div>
          <div className={styles['detail-item']}>
            <div className={styles['detail-label']}>Plazo del préstamo</div>
            <div className={styles['detail-value']}>{days} días</div>
          </div>
          <div className={styles['detail-item']}>
            <div className={styles['detail-label']}>Cuenta bancaria</div>
            <div className={styles['detail-value']}>{maskedAccount}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
