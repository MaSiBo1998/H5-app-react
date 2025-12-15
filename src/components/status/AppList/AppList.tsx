import type { ReactElement } from "react"
import { InformationCircleOutline } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './AppList.module.css'

export default function AppList({ data }: { data: StatusData }): ReactElement {
  // Vue: appProductData.catty
  // data.atony[0].catty
  const productList = data.atony?.[0]?.catty || []

  const handleApply = (item: any) => {
    console.log("Apply", item)
    // TODO: Implement jump logic
  }

  const handlePayment = (item: any) => {
    console.log("Payment", item)
    // TODO: Implement jump logic
  }

  const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['header-title']}>Productos populares</div>
          <div className={styles['header-subtitle']}>
             <InformationCircleOutline className={styles['info-icon']} />
             Múltiples productos, múltiples límites.
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        {productList.map((item: any, index: number) => {
          // logic from Vue: 
          // class: { 'in-payment': item.baggy === 80, 'over-payment': item.baggy === 90 }
          const isRepayment = item.baggy === 80 || item.baggy === 90
          const statusClass = item.baggy === 80 ? styles['in-payment'] : (item.baggy === 90 ? styles['over-payment'] : '')
          
          return (
            <div key={index} className={styles['product-item']}>
              <div className={`${styles['product-card-box']} ${statusClass}`}>
                <div className={styles['content-top']}>
                  <div className={styles['top-left']}>
                    <img src={item.logo} alt="" className={styles['app-icon']} />
                    <span>{item.name}</span>
                  </div>
                  {!isRepayment && (
                    <button className={styles.btn} onClick={() => handleApply(item)}>
                      Solicitar
                    </button>
                  )}
                </div>

                <div className={styles['loan-info']}>
                  <div className={styles.left}>
                    <div className={`${styles.title} ${item.baggy === 80 ? styles['in-color'] : (item.baggy === 90 ? styles['over-color'] : '')}`}>
                      ${fmt(item.amount)}
                    </div>
                    <div className={styles.info}>
                      {isRepayment ? 'Monto a pagar' : 'Monto del préstamo'}
                    </div>
                  </div>
                  <div className={styles.right}>
                     {/* If not repayment, show term days? Vue doesn't show term in this card explicitly but maybe it should? 
                         Vue template shows: item.term + ' días' if not repayment? 
                         Wait, looking at the Vue code snippet provided in my memory (or inferring):
                         The original code had `item.term` in `detail-value`. 
                         Let's assume we show term if not repayment.
                     */}
                     {!isRepayment ? (
                        <>
                          <div className={styles.title}>{item.term} días</div>
                          <div className={styles.info}>Plazo</div>
                        </>
                     ) : (
                        <>
                           <div className={`${styles.title} ${item.baggy === 80 ? styles['in-color'] : (item.baggy === 90 ? styles['over-color'] : '')}`}>
                             {item.baggy === 80 ? 'Pendiente' : 'Vencido'}
                           </div>
                           <div className={styles.info}>Estado</div>
                        </>
                     )}
                  </div>
                </div>

                {isRepayment && (
                  <>
                    <button className={styles['to-payment']} onClick={() => handlePayment(item)}>
                      Ir a pagar
                    </button>
                    {item.baggy === 90 && (
                      <div className={styles['card-bottom-tips']}>
                        Su préstamo está vencido, pague lo antes posible para evitar cargos por mora.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
