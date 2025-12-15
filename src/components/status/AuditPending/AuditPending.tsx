import { useEffect, type ReactElement } from "react"
import { ClockCircleFill } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from "./AuditPending.module.css"

// 扩展类型定义以匹配 Vue 组件中使用的数据结构
interface ExtendedStatusData extends StatusData {
  valour?: {
    scuzzy?: {
      smut?: number // 自动刷新间隔 (秒)
    }
  }
}

interface AuditPendingProps {
  data: StatusData
  onRefresh?: () => void
}

export default function AuditPending({ data, onRefresh }: AuditPendingProps): ReactElement {
  const extData = data as ExtendedStatusData
  
  // 自动刷新逻辑
  useEffect(() => {
    const intervalSeconds = extData.valour?.scuzzy?.smut
    
    if (intervalSeconds && intervalSeconds !== -1 && onRefresh) {
      const timer = setInterval(() => {
        onRefresh()
      }, intervalSeconds * 1000)
      
      return () => clearInterval(timer)
    }
  }, [extData.valour?.scuzzy?.smut, onRefresh])

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['status-icon']}>
             <ClockCircleFill fontSize={48} color="#ffffff" />
          </div>
          <div className={styles['header-title']}>
            ¡Enviado con éxito!
          </div>
          <div className={styles['header-subtitle']}>
            En revisión
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['tips-box']}>
          <div className={styles['tips-text']}>
            Por favor, espere, estamos verificando su solicitud y la revisión se completará en 3 minutos.
            <br /><br />
            Una vez aprobada su solicitud, se lo notificaremos por SMS. Cuando reciba el SMS, haga clic en "Confirmar" en la solicitud y su préstamo se abonará en breve.
          </div>
        </div>
        
        <div className={styles['info-text']}>
          Nuestro horario de atención es: 9:00~18:00
        </div>
        
        <button className={styles['submit-btn']} onClick={handleRefresh}>
          Rehacer
        </button>
      </div>
    </div>
  )
}
