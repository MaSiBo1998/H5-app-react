import type { ReactElement } from "react"
import { useNavigate } from "react-router-dom"
import { InformationCircleOutline } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './AppList.module.css'
import { useHomeContext } from "@/pages/Home/Home"
import { useStatusContext } from "@/pages/Status"
export default function AppList({ data }: { data: StatusData }): ReactElement {
  const homeCtx = useHomeContext()
  const statusCtx = useStatusContext()
  // 优先使用存在的 Context
  const { homeData, refresh } = homeCtx || statusCtx || { homeData: {}, refresh: () => { } }
  const navigate = useNavigate()
  // 启用产品列表 -> item.aweto == 0
  const enableProductList = (data.atony || []).filter((item: any) => item.aweto === 0)
  // 未启用产品列表 -> item.aweto == 1
  const unenableProductList = (data.atony || []).filter((item: any) => item.aweto === 1)

  const handleApply = (item: any) => {
    console.log("Apply", item)
    // 跳转到详情页
    navigate(`/status?appName=${item.lima}`)
  }

  const handlePayment = (item: any) => {
    console.log("Payment", item)
    // 跳转到详情页
    navigate(`/status?appName=${item.lima}`)
  }

  const fmt = (n: number | undefined) => n !== undefined ? new Intl.NumberFormat('es-CO').format(n) : '-'

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['header-title']}>Préstamos populares</div>
          <div className={styles['header-subtitle']}>
             <InformationCircleOutline className={styles['info-icon']} />
             ¡Un buen historial de crédito le dará un mejor límite de préstamo!
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        {/* 启用产品列表 */}
        {enableProductList.map((item: any, index: number) => {
          // 判断是否处于还款期/逾期 (keyway == 300)
          const isRepaymentState = item.keyway === 300
          // galabia: 0 = in-payment, 1 = over-payment
          const isOverdue = item.galabia === 1
          
          const statusClass = isRepaymentState 
            ? (isOverdue ? styles['over-payment'] : styles['in-payment'])
            : ''

          return (
            <div key={index} className={styles['product-item']}>
              {isRepaymentState ? (
                // 列表展示处于还款期/逾期
                <div className={`${styles['product-card-box']} ${statusClass}`}>
                   <div className={styles['content-top']}>
                      <div className={styles['top-left']}>
                        <img src={item.gridding} alt="" className={styles['app-icon']} />
                        <span>{item.lima}</span>
                      </div>
                   </div>

                   <div className={styles['loan-info']}>
                      <div className={styles.left}>
                        <div className={`${styles.title} ${!isOverdue ? styles['in-color'] : styles['over-color']}`}>
                           {item.zoogamy}días
                        </div>
                        <div className={styles.info}>Duración</div>
                      </div>
                      <div className={styles.right}>
                        <div className={`${styles.title} ${!isOverdue ? styles['in-color'] : styles['over-color']}`}>
                           ${fmt(item.judaical)}
                        </div>
                        <div className={styles.info}>Monto a reembolsar</div>
                      </div>
                   </div>

                   <button className={styles['to-payment']} onClick={() => handlePayment(item)}>
                      Ir a reembolsar
                   </button>

                   {isOverdue && (
                      <div className={styles['card-bottom-tips']}>
                        Por favor, reembolse lo antes posible
                      </div>
                   )}
                </div>
              ) : (
                // 列表展示不处于还款期/逾期 (申请状态)
                <div className={styles['product-card-box']}>
                   <div className={styles['content-top']}>
                      <div className={styles['top-left']}>
                        <img src={item.gridding} alt="" className={styles['app-icon']} />
                        <span>{item.lima}</span>
                      </div>
                      <button className={styles.btn} onClick={() => handleApply(item)}>
                        Aplicar
                      </button>
                   </div>

                   <div className={styles['loan-info']}>
                      <div className={styles.left}>
                        <div className={styles.title}>{item.rainworm}días</div>
                        <div className={styles.info}>interés</div>
                      </div>
                      <div className={styles.right}>
                        <div className={styles.title}>${fmt(item.shammash)}</div>
                        <div className={styles.info}>Importe máximo($)</div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )
        })}

        {/* 未启用产品列表 */}
        {unenableProductList.length > 0 && (
          <>
             <div className={styles.partition}>
                ¡El reembolso a tiempo desbloquea más productos!
             </div>
             {unenableProductList.map((item: any, index: number) => (
               <div key={`unenable-${index}`} className={`${styles['product-item']} ${styles['img-gray']}`}>
                  <div className={`${styles['product-card-box']} ${styles['bg-gray']}`}>
                     <div className={`${styles['content-top']} ${styles['color-title']}`}>
                        <div className={styles['top-left']}>
                          <img src={item.gridding} alt="" className={`${styles['app-icon']} ${styles['img-gray']}`} />
                          <span>{item.lima}</span>
                        </div>
                        <button className={`${styles.btn} ${styles.bg}`} disabled>
                          Aplicar
                        </button>
                     </div>

                     <div className={styles['loan-info']}>
                        <div className={styles.left}>
                          <div className={`${styles.title} ${styles['color-title']}`}>
                             {item.zoogamy}días
                          </div>
                          <div className={`${styles.info} ${styles['color-info']}`}>Duración</div>
                        </div>
                        <div className={styles.right}>
                          <div className={`${styles.title} ${styles['color-title']}`}>
                             ${fmt(item.judaical)}
                          </div>
                          <div className={`${styles.info} ${styles['color-info']}`}>Importe máximo($)</div>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </>
        )}
      </div>
    </div>
  )
}
