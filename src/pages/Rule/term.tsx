import { type ReactElement } from 'react'
import HeaderNav from "@/components/common/HeaderNav"
import styles from './Term.module.css'

export default function Term(): ReactElement {
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
