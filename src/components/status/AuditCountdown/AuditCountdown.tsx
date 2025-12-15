import type { ReactElement } from "react"
import { useState, useEffect, useRef } from "react"
import type { StatusData } from "../types"
import styles from './AuditCountdown.module.css'

interface AuditCountdownProps {
  data: StatusData
  onRefresh?: () => void
}

export default function AuditCountdown({ data, onRefresh }: AuditCountdownProps): ReactElement {
  // 从 data 中获取倒计时时间，Vue 中是 appProductData.scuzzy.frog
  // data.atony[0].scuzzy.frog
  const initialTime = (data.atony?.[0]?.scuzzy as any)?.frog ?? 0
  const [time, setTime] = useState(initialTime > 0 ? initialTime : 60) // 默认 60s 防止 0

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 倒计时逻辑
    const startCount = () => {
      timerRef.current = setInterval(() => {
        setTime((prevTime: number) => {
          if (prevTime <= 1) {
            // 倒计时结束，刷新
            if (timerRef.current) clearInterval(timerRef.current)
            onRefresh?.()
            return 0
          }
          
          // 每 5 秒刷新一次数据（参考 Vue 逻辑）
          if (prevTime % 5 === 0 && onRefresh) {
            onRefresh()
          }

          return prevTime - 1
        })
      }, 1000)
    }

    startCount()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [onRefresh])

  return (
    <div className={styles.container}>
      <div className={styles['header-card']}>
        <div className={styles['header-bg-pattern']}></div>
        <div className={styles['header-content']}>
           <div className={styles['header-title']}>Evaluación de riesgos</div>
        </div>
      </div>
      
      <div className={styles.main-card}>
        <div className={styles['countdown-wrapper']}>
          <span className={styles['time-text']}>{time}</span>
          <span className={styles.unit}>s</span>
        </div>

        <div className={styles.description}>
          Estamos evaluando su solicitud, por favor espere un momento...
        </div>
      </div>
    </div>
  )
}
