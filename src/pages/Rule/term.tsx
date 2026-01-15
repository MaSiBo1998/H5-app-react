import { type ReactElement, useEffect, useRef } from 'react'
import HeaderNav from "@/components/common/HeaderNav"
import styles from './Term.module.css'
import { useReduxRiskTracking } from '@/hooks/useReduxRiskTracking'

export default function Term(): ReactElement {
  const { toSetRiskInfo } = useReduxRiskTracking()
  const startTime = useRef(Date.now())
  const isBottomReached = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (isBottomReached.current) return
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const clientHeight = window.innerHeight || document.documentElement.clientHeight
      const scrollHeight = document.documentElement.scrollHeight

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        isBottomReached.current = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    // Check initially in case content is short
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      
      const duration = Date.now() - startTime.current
      
      // 直接追加时长和阅读状态
      toSetRiskInfo('000021', '2', duration)
      toSetRiskInfo('000021', '3', isBottomReached.current ? 1 : 2)
    }
  }, [])

  return (
    <div className={styles['content']}>
        <HeaderNav title="Términos y Condiciones" />
        
        <div className={styles['content-main']}>
            <div className={styles['info']}>
                1. El cupón es solo para productos Rapidcredito y no se puede canjear
            </div>
            <div className={`${styles['info']} ${styles['title']}`}>
                2. Este cupón solo está disponible para este tipo sin intereses/aumento
            </div>
            <div className={styles['info']}>
                2.1 los cupones sin interés son aquellos que alcanzan un cierto límite para la reducción de la fase
                Intereses devengados, sin cobrar intereses correspondientes<br/>
                2.2 un cupón de aumento significa aumentar una cierta línea de préstamo, aumentar El escenario de uso del cupón solo se puede usar el préstamo, la página de pago no Capaz de usar
            </div>
            <div className={`${styles['info']} ${styles['title']}`}>
                3. Este cupón no se puede disfrutar de otros cupones superpuestos al mismo tiempo
            </div>
            <div className={`${styles['info']} ${styles['title']}`}>
                4. Los derechos de interpretación son propiedad de la compañía
            </div>
        </div>
    </div>
  );
}
