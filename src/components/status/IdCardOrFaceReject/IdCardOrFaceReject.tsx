import type { ReactElement } from "react"
import { CloseCircleFill } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './IdCardOrFaceReject.module.css'

interface IdCardOrFaceRejectProps {
  data: StatusData
  onRefresh?: () => void
}

export default function IdCardOrFaceReject({ data, onRefresh }: IdCardOrFaceRejectProps): ReactElement {
  const status = data.atony?.[0]?.valour?.scuzzy?.medibank ?? data.atony?.[0]?.scuzzy?.medibank

  const handleEdit = () => {
    // Logic for "Volver a subir"
    console.log("Re-upload ID/Face")
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
            Falló la solicitud
          </div>
        </div>
      </div>
      
      <div className={styles['main-card']}>
        <div className={styles['tips-box']}>
          {status === 310 
            ? "La foto de su identificación es demasiado borrosa, por favor vuelva a subirla." 
            : "Su reconocimiento facial no coincide, por favor vuelva a intentarlo."}
        </div>
        
        <button className={styles['submit-btn']} onClick={handleEdit}>
          Volver a subir
        </button>
      </div>
    </div>
  )
}
