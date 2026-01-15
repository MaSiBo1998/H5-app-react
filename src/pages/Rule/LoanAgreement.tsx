import { type ReactElement, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import HeaderNav from "@/components/common/HeaderNav"
import styles from './LoanAgreement.module.css'
import { useReduxRiskTracking } from '@/hooks/useReduxRiskTracking'

export default function LoanAgreement(): ReactElement {
  const location = useLocation()
  const { eventCode } = (location.state as { eventCode?: string }) || {}
  
  const { toSetRiskInfo, getRiskValue } = useReduxRiskTracking()
  const startTime = useRef(Date.now())
  const isBottomReached = useRef(false)

  useEffect(() => {
    if (!eventCode) return

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
    handleScroll()

    return () => {
        window.removeEventListener('scroll', handleScroll)
        const duration = Date.now() - startTime.current
        
        // Accumulate duration (Key 7)
        const currentTotal = Number(getRiskValue(eventCode, '7') || 0)
        toSetRiskInfo(eventCode, '7', currentTotal + duration)
        
        // Update read status (Key 8). 1 = finished, 2 = not finished.
        const currentStatus = getRiskValue(eventCode, '8')
        const newStatus = isBottomReached.current ? '1' : (currentStatus === '1' ? '1' : '2')
        toSetRiskInfo(eventCode, '8', newStatus)
    }
  }, [eventCode, getRiskValue, toSetRiskInfo])

  return (
    <div className={styles['loan-agreement']}>
      <HeaderNav title="Acuerdo de Préstamo" />
      
      <div className={styles['content-main']}>
        <div className={styles['section']}>
          <div className={styles['paragraph']}>
            Este contrato de préstamo se firmará en la fecha en que la plataforma Rapidcredito acepte la solicitud del prestatario tras completar el proceso de aprobación (en adelante, la "Fecha de Aprobación"), y se le notificará al prestatario por SMS.
          </div>
          <div className={styles['paragraph']}>
            "Nombre del Prestatario" se refiere a un ciudadano colombiano residente en el Número de Identificación Nacional, provincia o ciudad de Colombia, o, en este caso, a su propio nombre, que se registra en la Plataforma y almacena información sobre el beneficiario del préstamo, incluyendo datos físicos y otros datos de identificación (en adelante, Rapidcredito y el Prestatario, cada uno denominado la "Parte" y colectivamente las "Partes"), e incluirá a sus sucesores, cesionarios y representantes autorizados, según lo permita el contexto.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['section-title']}>Monto, Plazo, Comisiones y Cargos:</div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Límite del Préstamo:</span>
            <span className={styles['text']}>COP$500.000 a COP$2.500.000</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Plazo del Préstamo:</span>
            <span className={styles['text']}>91 a 180 días</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Tasa de Interés Anual Máxima:</span>
            <span className={styles['text']}>24% anual (24%/365 = 0,06% diario)</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Otras Comisiones:</span>
            <span className={styles['text']}>0</span>
          </div>
          <div className={styles['info-item']}>
            <span className={styles['label']}>Impuesto al Valor Agregado (IVA):</span>
            <span className={styles['text']}>De acuerdo con las políticas y leyes colombianas, se aplica un IVA del 19% sobre las comisiones.</span>
          </div>
        </div>

        <div className={`${styles['section']} ${styles['example-section']}`}>
          <div className={styles['section-subtitle']}>Ejemplo de Cálculo:</div>
          <div className={styles['paragraph']}>
            Un préstamo con un plazo de 91 días (3 meses) y un capital de COP$100.000 tendría una tasa de interés anual del 22,6% y una tasa de interés diaria del 0,06%.
          </div>
          <div className={styles['calculation']}>
            <div className={styles['calc-line']}>Interés total: 100.000 * 0,06% * 91 = 5.460</div>
            <div className={styles['calc-line']}>IVA: 5.460 * 19% = 1.037,4</div>
            <div className={`${styles['calc-line']} ${styles['total']}`}>Reembolso total: 100.000 + 5.460 + 1.037,4 = 106.497,4</div>
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['section-title']}>Descripción</div>
          <div className={styles['paragraph']}>● Rapidcredito se dedica a otorgar pequeños préstamos a particulares y cuenta con licencia para operar en Colombia.</div>
          <div className={styles['paragraph']}>● Los usuarios solicitan préstamos personales a través de Rapidcredito y proporcionan información básica, que Rapidcredito verifica, autentica y utiliza para la aprobación del préstamo.</div>
          <div className={styles['paragraph']}>● El prestatario es una persona física que desea utilizar los servicios de préstamo de Rapidcredito y certifica que nunca ha sido declarado insolvente.</div>
          <div className={styles['paragraph']}>● Rapidcredito ofrece servicios de calificación de riesgo, que se utilizan para otorgar futuros préstamos. Rapidcredito declara además que el prestatario ha acordado proporcionarle financiamiento de acuerdo con los siguientes términos y condiciones.</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 1 Definiciones e Interpretación</div>
          <div className={styles['paragraph']}>1.1 Salvo que se indique expresamente lo contrario, todos los términos definidos en este Acuerdo tienen los siguientes significados:</div>
          <div className={styles['paragraph']}>1.2 "Cuenta del Prestatario" significa la cuenta personal registrada por el Prestatario en la Plataforma Rapidcredito para solicitar un préstamo.</div>
          <div className={styles['paragraph']}>1.3 Presentar una Solicitud de Préstamo y poder presentar una nueva Solicitud de Préstamo tras la amortización de un Préstamo anterior.</div>
          <div className={styles['paragraph']}>1.4 Cargar los documentos requeridos y proporcionar otra información necesaria para la presentación de una Solicitud de Préstamo.</div>
          <div className={styles['paragraph']}>1.5 Comprender los términos y el calendario de amortización del Préstamo deseado y el monto del Préstamo pendiente.</div>
          <div className={styles['paragraph']}>1.6 "Solicitud de Préstamo" significa la Solicitud de Préstamo, que es la información del préstamo presentada por el Prestatario a Rapidcredito en virtud de este Acuerdo.</div>
          <div className={styles['paragraph']}>1.7 "Plazo del Préstamo" se refiere al período durante el cual el Prestatario obtiene el Producto en la Plataforma Rapidcredito: mínimo 91 días y máximo 180 días.</div>
          <div className={styles['paragraph']}>1.8 "Tasa del Préstamo" se refiere a la tasa de interés anual que cobra el Prestatario por obtener el Producto en la Plataforma Rapidcredito. Tasa de Interés Anual (Máxima) 24%, sin cargos administrativos adicionales.</div>
          <div className={styles['paragraph']}>1.9 "Fecha de Vencimiento del Préstamo" se calcula como el primer día en que el Prestatario obtiene el Producto en la plataforma Rapidcredito, y la Fecha de Vencimiento se determina con base en el "Plazo del Préstamo".</div>
          <div className={styles['paragraph']}>1.10 "Afiliados" se refiere a los directores, empleados, gerentes, accionistas y asociados de Rapidcredito.</div>
          <div className={styles['paragraph']}>1.11 "Solicitud de Asistencia" se refiere a una llamada al número de emergencia del Prestatario, proporcionado por este o según lo descrito en la Política de Privacidad.</div>
          <div className={styles['paragraph']}>1.12 "Plataforma" se refiere al portal y al software de la aplicación móvil creados, propiedad de y operados por Rapidcredito.</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 2: Préstamos</div>
          <div className={styles['paragraph']}>2.1 Rapidcredito se compromete a proporcionar al Prestatario un importe, en adelante denominado el "Importe del Préstamo", y el Prestatario se compromete a reembolsar dicho importe a Rapidcredito, junto con el Porcentaje de la Tasa de Interés y el Porcentaje de la Comisión por Servicio.</div>
          <div className={styles['paragraph']}>2.2 Los Préstamos Reembolsables no incluyen los impuestos aplicables. El Prestatario está obligado a pagar los impuestos correspondientes al Préstamo Reembolsable en la fecha de vencimiento y deberá abonar una penalización prorrateada por demora en el pago.</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 3: Uso de los Fondos del Préstamo</div>
          <div className={styles['paragraph']}>
            Siempre que el Prestatario no infrinja las leyes y regulaciones colombianas vigentes y acepte que el propósito del préstamo no infringe las normas internacionales contra el lavado de activos (ALD), utilizará el monto total del préstamo y no lo utilizará para financiar el terrorismo ni ninguna actividad que, directa o indirectamente, constituya una violación de las normas ALD.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 4: Reembolso del Préstamo</div>
          <div className={styles['paragraph']}>
            El Prestatario deberá reembolsar el monto total del préstamo, incluidos los intereses, antes de la fecha de vencimiento. Si el Prestatario no reembolsa el préstamo dentro del plazo especificado, Rapidcredito podrá iniciar acciones legales para recuperar el monto pendiente (incluido el préstamo y los intereses adeudados).
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 5: Reembolso Anticipado</div>
          <div className={styles['paragraph']}>
            El Prestatario podrá reembolsar el monto total del préstamo en cualquier momento antes del vencimiento del plazo del préstamo. Si el préstamo se reembolsa anticipadamente, podrá solicitar un monto mayor para el siguiente pedido.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 6: Derechos y Obligaciones de las Partes</div>
          <div className={styles['paragraph']}>Los derechos y obligaciones de las partes de este Acuerdo son los siguientes:</div>
          <div className={styles['sub-section']}>
            <div className={styles['section-subtitle']}>1. Derechos del Prestatario:</div>
            <div className={styles['paragraph']}>Presentar una solicitud de préstamo a través de la Plataforma en cualquier momento y rechazarla o cancelarla en cualquier momento si no se recibe el préstamo.</div>
          </div>
          <div className={styles['sub-section']}>
            <div className={styles['section-subtitle']}>2. Obligaciones del Prestatario:</div>
            <div className={styles['paragraph']}>3. Contar con un empleo fijo y la capacidad financiera para pagar el préstamo solicitado.</div>
            <div className={styles['paragraph']}>4. Pagar el préstamo y toda la financiación relacionada puntualmente en la fecha de vencimiento, de acuerdo con los términos de este Acuerdo.</div>
            <div className={styles['paragraph']}>5. Pagar todos los montos adeudados en virtud de este Acuerdo, incluyendo montos del préstamo, comisiones por servicios, impuestos, multas, intereses, etc., en caso de demora en el reembolso.</div>
            <div className={styles['paragraph']}>6. Utilizar los fondos del préstamo emitidos por Rapidcredito para fines legítimos.</div>
            <div className={styles['paragraph']}>7. Cumplir con todas las políticas de la plataforma de Rapidcredito.</div>
            <div className={styles['paragraph']}>8. Los usuarios deben proporcionar a Rapidcredito la información solicitada. Los usuarios aceptan que la información proporcionada a Rapidcredito es precisa y completa.</div>
            <div className={styles['paragraph']}>9. Los usuarios no podrán ceder la totalidad o parte de sus derechos, intereses y obligaciones derivados de este contrato a ningún tercero.</div>
          </div>
          <div className={styles['sub-section']}>
            <div className={styles['section-subtitle']}>10. Derechos de Rapidcredito:</div>
            <div className={styles['paragraph']}>11. Los usuarios aceptan expresamente que, si incumplen los términos y condiciones del contrato de préstamo antes o durante su vigencia, Rapidcredito se reserva el derecho de tomar las medidas correspondientes.</div>
            <div className={styles['paragraph']}>12. Si un préstamo está en trámite, será rechazado de plano.</div>
            <div className={styles['paragraph']}>13. Si un préstamo ha sido aprobado, será cancelado y el usuario será responsable del importe total del préstamo.</div>
            <div className={styles['paragraph']}>14. El importe del préstamo, los intereses y los gastos de gestión se cobrarán al prestatario de conformidad con este Acuerdo.</div>
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 7: Compromiso</div>
          <div className={styles['paragraph']}>El prestatario se compromete a:</div>
          <div className={styles['paragraph']}>● Poder reembolsar el préstamo solicitado</div>
          <div className={styles['paragraph']}>● Se compromete a proporcionar información correcta, veraz y válida</div>
          <div className={styles['paragraph']}>● Cumplir con las leyes y regulaciones pertinentes</div>
          <div className={styles['paragraph']}>● Reembolsar el préstamo en su totalidad y a tiempo</div>
          <div className={styles['paragraph']}>● No proporcionar información engañosa a Rapidcredito</div>
          <div className={styles['paragraph']}>● Cumplir con los términos y condiciones de este Acuerdo</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 8: Consentimiento para la Divulgación</div>
          <div className={styles['paragraph']}>
            El Prestatario se compromete expresamente a procesar y utilizar, a su entera discreción, los Datos Personales, la información y demás documentos relacionados con el Préstamo que proporcione a Rapidcredito o que Rapidcredito obtenga o a los que acceda legítimamente, con el fin de hacer cumplir los términos del presente Contrato.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 9: Casos de Incumplimiento</div>
          <div className={styles['paragraph']}>Cualquiera de los siguientes supuestos constituirá un incumplimiento del contrato por parte del Prestatario:</div>
          <div className={styles['paragraph']}>● Una o más de la información proporcionada sea falsa, inexacta o incompleta</div>
          <div className={styles['paragraph']}>● El Prestatario utilice el préstamo de manera ilegal</div>
          <div className={styles['paragraph']}>● El Prestatario se declara en quiebra</div>
          <div className={styles['paragraph']}>● El Prestatario cede sus derechos y obligaciones a otra parte</div>
          <div className={styles['paragraph']}>● El Prestatario incumple el préstamo y otras obligaciones financieras</div>
          <div className={styles['paragraph']}>● El Prestatario incumple una o más disposiciones de este Acuerdo</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 10: Consecuencias del Incumplimiento</div>
          <div className={styles['paragraph']}>
            En caso de incumplimiento del contrato o de que el Prestatario no realice un pago dentro de los 14 días posteriores a la fecha de vencimiento, Rapidcredito podrá, a su entera discreción, tomar las siguientes medidas:
          </div>
          <div className={styles['paragraph']}>● Agilizar el pago de las obligaciones</div>
          <div className={styles['paragraph']}>● Enviar personal para cobrar las deudas</div>
          <div className={styles['paragraph']}>● Contactar al número de emergencia del Prestatario</div>
          <div className={styles['paragraph']}>● Iniciar un proceso civil ante un tribunal competente</div>
          <div className={styles['paragraph']}>● Denunciar al Prestatario ante las autoridades gubernamentales</div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 11: Decisiones, Terminación y Rescisión</div>
          <div className={styles['paragraph']}>
            Si el Prestatario incumple alguna disposición de este contrato o proporciona información falsa a Rapidcredito, Rapidcredito tendrá derecho a rescindir unilateralmente este contrato y recuperar la deuda. Si el Prestatario no paga el préstamo a tiempo, este se considerará vencido y estará sujeto al cargo por mora establecido.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 12: Ley aplicable y jurisdicción</div>
          <div className={styles['paragraph']}>
            El presente contrato se regirá por las leyes de los Estados Unidos de Colombia.
          </div>
        </div>

        <div className={styles['section']}>
          <div className={styles['article-title']}>Artículo 13: Disposiciones generales</div>
          <div className={styles['paragraph']}>13.1 El presente contrato se celebra electrónicamente y es vinculante para ambas partes.</div>
          <div className={styles['paragraph']}>13.2 El presente Acuerdo entrará en vigor a partir de la fecha de aprobación y será vinculante para ambas partes hasta su vencimiento o hasta que el Prestatario haya cumplido con todas sus obligaciones de pago.</div>
          <div className={styles['paragraph']}>13.3 Todos los términos y condiciones del presente Acuerdo permanecerán en pleno vigor y efecto, independientemente de cualquier otro término. Si alguna disposición del presente Acuerdo se declara inválida o inaplicable en cualquier momento, las demás disposiciones del presente Acuerdo no se verán afectadas.</div>
        </div>
      </div>
    </div>
  )
}
