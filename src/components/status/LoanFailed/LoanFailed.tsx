import type { ReactElement } from "react"
import { CloseCircleFill } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './LoanFailed.module.css'

interface LoanFailedProps {
  data: StatusData
  onRefresh?: () => void
}

export default function LoanFailed({ data, onRefresh }: LoanFailedProps): ReactElement {
  const handleEdit = () => {
    // "修改银行账户"的逻辑
    // 通常跳转到银行绑定页面
    console.log("Edit bank info")
  }

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['status-icon']}>
             <CloseCircleFill fontSize={48} color="#ffffff" />
          </div>
          <div className={styles['header-title']}>
            Falla en el envío de dinero
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['tips-box']}>
          La información de su tarjeta bancaria es incorrecta, por favor modifíquela.
        </div>
        
        <button className={styles['submit-btn']} onClick={handleEdit}>
          Modificar cuenta bancaria
        </button>
      </div>
    </div>
  )
}
