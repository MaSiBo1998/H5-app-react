import type { ReactElement } from "react"
import type { StatusData } from "../types"
import styles from './ExamineReject.module.css'
import AuditPending from "../AuditPending/AuditPending"
import { CloseCircleOutline, ClockCircleOutline } from "antd-mobile-icons"

interface ExamineRejectProps {
  data: StatusData
  onRefresh?: (showLoading?: boolean) => void
}

export default function ExamineReject({ data, onRefresh }: ExamineRejectProps): ReactElement {
  // 审核被拒展示页面样式：0审核中，1原始被拒页面，2被拒可再次申请页面
  // return this.appProductData?.valour?.scuzzy.medibank ?? this.appProductData?.scuzzy.medibank;
  const status = data.atony?.[0]?.valour?.scuzzy?.medibank ?? data.atony?.[0]?.scuzzy?.medibank ?? 1
  
  // Date for RejectAllowAgain
  // 再次申请的日期
  const date = data.atony?.[0]?.valour?.scuzzy?.essonite ?? data.atony?.[0]?.scuzzy?.essonite

  if (status === 0) {
    return <AuditPending data={data} onRefresh={onRefresh} />
  }

  if (status === 2) {
    return (
      <div className={styles.container}>
        <div className={styles['header-card']}>
          <div className={styles['header-bg-pattern']}></div>
          <div className={styles['header-content']}>
            <div className={styles['status-icon']}>
               <CloseCircleOutline fontSize={48} color="#ffffff" />
            </div>
            <div className={styles['header-title']}>
              Falló la solicitud
            </div>
          </div>
        </div>

        <div className={styles['main-card']}>
          <div className={styles['simple-message']} style={{ marginBottom: 24 }}>
            Lo sentimos, su préstamo en línea no ha sido aprobado y las razones por
            las que no es elegible temporalmente son las siguientes. Mantenga su
            cuenta activa, continuaremos trabajando arduamente para brindarle el mejor
            préstamo, intente nuevamente después de la siguiente fecha.
          </div>
          
          <div className={styles['tips-box']}>
            <div className={styles['reasons-title']}>Posibles motivos de rechazo:</div>
            <ul className={styles.list}>
              <li className={styles['list-item']}>Datos que proporcionados no válidos/incorrectos</li>
              <li className={styles['list-item']}>Puntaje de crédito bajo o deuda alta</li>
              <li className={styles['list-item']}>Mal historial de pagos, etc</li>
            </ul>
          </div>

          {date && (
            <div className={styles['date-box']}>
              Tiempo para solicitud próximo: {date}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 默认: 状态 1 (原始拒绝)
  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['status-icon']}>
             <ClockCircleOutline fontSize={48} color="#ffffff" />
          </div>
          <div className={styles['header-title']}>
            En revisión
          </div>
          <div className={styles['header-subtitle']}>
            ¡Enviado con éxito! ¡Por favor, tenga paciencia!
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['simple-message']}>
           Información incorrecta, por favor vuelva a subir.
        </div>
      </div>
    </div>
  )
}
