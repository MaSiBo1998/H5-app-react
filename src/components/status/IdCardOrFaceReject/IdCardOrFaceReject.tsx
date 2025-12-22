import type { ReactElement } from "react"
import { CloseCircleFill, BankcardOutline, UserOutline } from "antd-mobile-icons"
import type { StatusData } from "../types"
import styles from './IdCardOrFaceReject.module.css'
import { useNavigate } from "react-router-dom"

interface IdCardOrFaceRejectProps {
  data: StatusData
  onRefresh?: () => void
}

export default function IdCardOrFaceReject({ data, onRefresh }: IdCardOrFaceRejectProps): ReactElement {
  const status = data.kaki
  const orderId = data.atony?.[0]?.gain
  const navigate = useNavigate()

  const isIdReject = status === 310
  
  const handleEdit = () => {
    // "重新上传"的逻辑
    console.log("Re-upload ID/Face",status)
    if(status === 310) {
      navigate(`/id?entry=homeEdit&orderId=${orderId || ''}`)
    } else if(status === 320) {
      navigate(`/face-capture?entry=homeEdit&orderId=${orderId || ''}`)
    }
  }

  return (
    <div className={styles.container}>
      <div className={`${styles['header-card']} ${isIdReject ? styles['header-id'] : styles['header-face']}`}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
          <div className={styles['status-icon']}>
            {isIdReject ? (
               <BankcardOutline fontSize={48} color="#ffffff" />
            ) : (
               <UserOutline fontSize={48} color="#ffffff" />
            )}
            <div className={styles['error-badge']}>
              <CloseCircleFill fontSize={24} color="#ff4d4f" style={{ background: '#fff', borderRadius: '50%' }} />
            </div>
          </div>
          <div className={styles['header-title']}>
            {isIdReject ? 'Error en Identificación' : 'Error en Selfie'}
          </div>
        </div>
      </div>

      <div className={styles['main-card']}>
        <div className={styles['tips-box']}>
          {isIdReject
            ? "La foto de su identificación es borrosa o no válida. Por favor, asegúrese de que la información sea legible."
            : "La verificación facial falló. Por favor, asegúrese de tener buena iluminación y que su rostro sea claramente visible."}
        </div>

        <button className={styles['submit-btn']} onClick={handleEdit}>
          {isIdReject ? 'Volver a subir Identificación' : 'Volver a tomar Selfie'}
        </button>
      </div>
    </div>
  )
}
