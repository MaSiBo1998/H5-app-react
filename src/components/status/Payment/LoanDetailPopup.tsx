import type { ReactElement } from 'react'
import { useState, useEffect } from 'react'
import { Popup } from 'antd-mobile'
import { RightOutline } from 'antd-mobile-icons'
import styles from './LoanDetailPopup.module.css'
import type { SpadoItem } from '../types'
import { addDayToDateStr } from '@/utils/date'

interface Props {
  visible: boolean
  onClose: () => void
  items?: SpadoItem[]
}

export default function LoanDetailPopup({ visible, onClose, items = [] }: Props): ReactElement {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  useEffect(() => {
    if (visible) {
      setExpandedIndex(0)
    }
  }, [visible])

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  const getItemClass = (item: SpadoItem) => {
    if (item.galabia === 1) return styles['over-box']
    if (item.leonora === 300) return styles['padding-box']
    return styles['already-box']
  }

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
    >
      <div className={styles['popup-content']}>
        <div className={styles.header}>
          Detalles del pedido
        </div>
        <div className={styles['scroll-content']}>
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`${styles['loan-item']} ${getItemClass(item)} ${expandedIndex === index ? styles.expanded : ''}`}
            >
              <div className={styles['item-header']} onClick={() => toggleExpand(index)}>
                <div className={styles['header-left']}>
                  <span className={styles.date}>{item.overdo} Ago</span>
                </div>
                <div className={styles['header-right']}>
                  <span className={styles.amount}>${item.judaical}</span>
                  <RightOutline 
                    className={`${styles.arrow} ${expandedIndex === index ? styles.rotated : ''}`} 
                  />
                </div>
              </div>
              
              {expandedIndex === index && (
                <div className={styles['item-detail']}>
                  <div className={styles['detail-row']}>
                    <span className={styles.label}>Monto</span>
                    <span className={styles.value}>${item.laterite}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles.label}>Comisión</span>
                    <span className={styles.value}>${item.larder}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles.label}>Interés</span>
                    <span className={styles.value}>${item.masseuse}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles.label}>IVA</span>
                    <span className={styles.value}>${item.encash}</span>
                  </div>
                  <div className={styles['detail-row']}>
                    <span className={styles.label}>Fecha de reembolso</span>
                    <span className={styles.value}>{addDayToDateStr(item.movies || '')}</span>
                  </div>
                  {(item.sicken || 0) > 0 && (
                    <div className={`${styles['detail-row']} ${styles['over-color']}`}>
                      <span className={styles.label}>Multa vencida</span>
                      <span className={styles.value}>${item.sicken}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Popup>
  )
}
