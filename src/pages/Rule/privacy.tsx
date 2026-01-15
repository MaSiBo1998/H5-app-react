import { type ReactElement, useEffect, useRef } from 'react'
import HeaderNav from "@/components/common/HeaderNav"
import styles from './Privacy.module.css'
import { useReduxRiskTracking } from '@/hooks/useReduxRiskTracking'

export default function Privacy(): ReactElement {
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
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            const duration = Date.now() - startTime.current
            
            // 直接追加时长和阅读状态 (不累加，不覆盖)
            toSetRiskInfo('000022', '2', duration)
            toSetRiskInfo('000022', '3', isBottomReached.current ? 1 : 2)
        }
    }, [])

    return (
        <div className={styles['content']}>
            <HeaderNav title="Política de Privacidad" />
            
            <div className={styles['content-main']}>
                <div className={styles['section']}>
                    <div className={styles['article-title']}>Responsable de los Datos Personales</div>
                    <div className={styles['paragraph']}>
                        KARSHMARKET S.A.S (en adelante, el "Responsable" o "Rapid Credito", de forma intercambiable), con dirección en CL 145 A 53 B 03 Bogotá, D.C., se compromete a proteger la privacidad de los clientes y cumple seriamente con la obligación de proteger los datos personales. Por lo tanto, cuando recopilamos sus datos personales (definidos más adelante), usted es responsable del uso y protección de sus datos personales.
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Recopilación de Datos Personales</div>
                    <div className={styles['paragraph']}>
                        Recopilamos información del dispositivo móvil que utiliza y la combinamos con la información de los diferentes dispositivos que use. Puede comunicarse con nuestro centro de servicio al cliente en cualquier momento para solicitar la eliminación de su información personal.
                    </div>
                    <div className={styles['paragraph']}>
                        La información que recopilamos del dispositivo incluye:
                    </div>
                    <div className={styles['sub-section']}>
                        <div className={styles['paragraph']}>Información de identidad: podemos recopilar su nombre, dirección de correo electrónico, número de teléfono, número de celular, dirección postal, fecha de nacimiento, etc.</div>
                        <div className={styles['paragraph']}>Información financiera: deberá vincular una cuenta bancaria u otra cuenta relacionada para completar el proceso de préstamo, por lo que deberá proporcionarnos su información bancaria u otro método de pago relevante.</div>
                    </div>
                    <div className={styles['paragraph']}>
                        Para evaluar su elegibilidad y ayudarle a completar el pago del préstamo más rápidamente, necesitamos ciertos permisos para acceder a su teléfono. Puede cancelar la autorización en la configuración del sistema en cualquier momento. Cuando solicita un préstamo, necesitamos acceder a los siguientes permisos relacionados con su dispositivo:
                    </div>
                    <div className={styles['sub-section']}>
                        <div className={styles['paragraph']}>SMS: Durante el uso de Rapid Credito, Rapid Credito accederá al contenido no privado de sus mensajes (incluyendo números de SMS, contenido, estado de lectura, etc.). Esta información será cifrada y nunca será compartida con terceros. Cuando cierre nuestra aplicación, ya no podremos acceder a sus mensajes.</div>
                        <div className={styles['paragraph']}>Información básica del dispositivo: Información básica del dispositivo utilizado, como tipo, modelo, fabricante, entre otros, con el fin de conocer la compatibilidad del dispositivo y brindar una mejor experiencia de uso.</div>
                        <div className={styles['paragraph']}>Cámara: Autoriza el acceso a la cámara o captura de fotos/videos. Durante el proceso de solicitud de préstamo, deberá tomarse una fotografía y capturar una imagen de su documento de identidad para verificar su identidad y acelerar el proceso.</div>
                        <div className={styles['paragraph']}>Calendario: Si autoriza el acceso al calendario, lo utilizaremos para recordarle sus fechas de pago y evitar demoras que afecten su crédito.</div>
                        <div className={styles['paragraph']}>Ubicación: Si durante el uso de Rapid Credito autoriza la función de ubicación, recopilaremos la ubicación aproximada de su dispositivo para tomar mejores decisiones de riesgo.</div>
                        <div className={styles['paragraph']}>Información de contacto: Solo recopilaremos su contacto de emergencia para verificación, gestión de riesgos y control antifraude. Puede completar manualmente esta información. No compartiremos sus datos con terceros sin su permiso. Los datos serán subidos y almacenados en nuestros servidores mediante conexión segura (https://www.rapidcredito.co).</div>
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Motivos para usar su información personal</div>
                    <div className={styles['paragraph']}>
                        Recopilamos datos para brindarle un mejor servicio, verificar su identidad y crear modelos de calificación crediticia para determinar las condiciones del préstamo disponibles para usted. También utilizamos estos datos con fines de reporte crediticio y cobranza.
                    </div>
                    <div className={styles['paragraph']}>
                        Los datos recopilados se almacenarán en los servidores de Rapid Credito (https://www.rapidcredito.co) usando SSL y almacenamiento cifrado. Protegeremos estrictamente la seguridad de sus datos. No compartiremos ningún dato personal sin su autorización; con su consentimiento, podremos compartir información con terceros únicamente para los servicios necesarios.
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Transferencia de Datos Personales</div>
                    <div className={styles['paragraph']}>
                        Rapid Credito podrá transferir y/o enviar datos a:
                    </div>
                    <div className={styles['sub-section']}>
                        <div className={styles['paragraph']}>La compañía matriz, subsidiarias o afiliadas de Rapid Credito para protección, control, análisis estadísticos, evaluación, mejora y diseño de productos.</div>
                        <div className={styles['paragraph']}>Entidades administrativas, judiciales o gubernamentales, y centrales de información crediticia de acuerdo con órdenes judiciales o requerimientos legales.</div>
                        <div className={styles['paragraph']}>Terceros según lo establecido en esta política, quienes asumirán las mismas obligaciones y responsabilidades que Rapid Credito.</div>
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Tecnologías de seguimiento</div>
                    <div className={styles['paragraph']}>
                        Rapid Credito informa que en su sitio web, programa y plataformas tecnológicas utiliza tecnologías de seguimiento para monitorear el comportamiento del usuario y mejorar el servicio y experiencia.
                    </div>
                    <div className={styles['paragraph']}>
                        Las tecnologías utilizadas incluyen cookies y web beacons. Las cookies son archivos automáticos almacenados en el dispositivo que permiten recordar configuración, preferencias, nombre de usuario o contraseña.
                    </div>
                    <div className={styles['paragraph']}>
                        La mayoría de los navegadores aceptan cookies por defecto. El usuario puede configurarlo para rechazarlas. Desactivar cookies puede deshabilitar varias funciones de Rapid Credito o mostrarlas incorrectamente.
                    </div>
                    <div className={styles['paragraph']}>
                        Los web beacons son imágenes incrustadas que monitorean acciones del usuario como dirección IP, tiempo de permanencia y tipo de navegador.
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Sus derechos</div>
                    <div className={styles['paragraph']}>
                        Tiene derecho a acceder, corregir, eliminar u oponerse al tratamiento de sus datos personales, y en algunos casos limitar su tratamiento. También tiene el derecho de oponerse al uso de sus datos con fines de mercadeo.
                    </div>
                    <div className={styles['paragraph']}>
                        Si el tratamiento se basa en su consentimiento, puede retirarlo en cualquier momento sin afectar la legalidad previa al retiro. Puede hacerlo en su perfil, en nuestro sitio web o contactándonos.
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Cambios en esta política</div>
                    <div className={styles['paragraph']}>
                        Podemos actualizar esta política ocasionalmente, por lo que debería revisarla periódicamente. Si realizamos cambios importantes, le notificaremos antes de que sean efectivos.
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Consentimiento</div>
                    <div className={styles['paragraph']}>
                        Al crear una cuenta en Rapid Credito, usted acepta que procesemos, usemos y compartamos los datos proporcionados por usted y nuestros aliados de acuerdo con esta política. Si no está de acuerdo o desea retirar su consentimiento, escriba a: rapid2@rapidcredito.co
                    </div>
                </div>

                <div className={styles['section']}>
                    <div className={styles['article-title']}>Contáctenos</div>
                    <div className={styles['paragraph']}>
                        Si tiene dudas o desea información relacionada con el tratamiento de datos personales, puede escribir a: rapid2@rapidcredito.co
                    </div>
                    <div className={styles['info-item']}>
                        <div className={styles['label']}>Horario:</div>
                        <div className={styles['text']}>Lunes a Viernes de 9:00 a 18:00 y Sábado de 9:00 a 15:00</div>
                    </div>
                    <div className={styles['info-item']}>
                        <div className={styles['label']}>Sitio web:</div>
                        <div className={styles['text']}>www.rapidcredito.co</div>
                    </div>
                    <div className={styles['info-item']}>
                        <div className={styles['label']}>Dirección:</div>
                        <div className={styles['text']}>CL 145 A 53 B 03 Bogotá, D.C.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
