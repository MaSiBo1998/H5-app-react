import { type FC } from 'react'
import { createPortal } from 'react-dom'
import styles from './RetentionModal.module.css'
import { BillOutline } from 'antd-mobile-icons'

interface RetentionModalProps {
  visible: boolean
  onConfirm: () => void // 确认退出 (Sí)
  onCancel: () => void // 取消退出 (No)
}

const RetentionModal: FC<RetentionModalProps> = ({ visible, onConfirm, onCancel }) => {
  if (!visible) return null

  return createPortal(
    <div className={styles['modal-mask']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-icon']}>
           <BillOutline fontSize={48} />
        </div>
        <div className={styles['modal-text']}>
          ¿Está seguro de que no necesite el préstamo financiero? Sólo unos pasos
        </div>
        <div className={styles['button-group']}>
           {/* Sí 退出 */}
          <button className={`${styles.btn} ${styles['btn-cancel']}`} onClick={onConfirm}>
            Sí
          </button>
           {/* No 留下 */}
          <button className={`${styles.btn} ${styles['btn-confirm']}`} onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RetentionModal
