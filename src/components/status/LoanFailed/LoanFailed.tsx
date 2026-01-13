import type { ReactElement } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CloseCircleFill } from "antd-mobile-icons"
import styles from './LoanFailed.module.css'


export default function LoanFailed({ data }: { data?: any }): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const isFirstLoan = !location.pathname.includes('/status')
  // data 可能直接是 item，也可能是 StatusData (包含 atony 数组)
  const gain = data?.gain || data?.atony?.[0]?.gain || ''
  const appName = data?.lima || data?.atony?.[0]?.lima || ''

  console.log('LoanFailed data:', data, 'gain:', gain)
  const handleEdit = () => {
    navigate(`/bank?entry=${isFirstLoan?'fistEdit':'reEdit'}`, { state: { gain, isFirstLoan, appName } })
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
            Fallo de pago
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['tips-box']}>
          Lo sentimos, ocurrió un error de su cuenta bancaria cuando le hicimos la transferencia. Por favor, modifique su cuenta bancaria o consulte con el banco para resolver este problema.
        </div>
        
        <button className={styles['submit-btn']} onClick={handleEdit}>
          Rehacer
        </button>
      </div>
    </div>
  )
}
