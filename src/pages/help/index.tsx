import type { ReactElement } from "react";
import HeaderNav from "@/components/common/HeaderNav";
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import helpPayImg from '@/assets/status/help-pay.png'

export default function Help(): ReactElement {
    const navigate = useNavigate()
    const goBackPage = () => {
        navigate(-1)
    }
    return (
        <div>
            <HeaderNav title="How to pay?" onBack={goBackPage} />
            <div className={styles.content}>
                <div className={styles['help-container']}>
                    <div className={styles['help-title']}>How to pay?</div>
                    <img
                        className={styles['help-img']}
                        src={helpPayImg}
                        alt="How to pay illustration"
                    />
                    <div className={styles['help-subtitle']}>Check your mobile banking app</div>
                    <div className={styles['help-desc']}>
                        You will receive a text message indicating that a payment has been accepted through Transfiya. If you have not received the message, check directly in the app of the bank where you have your Transfiya active.
                    </div>
                </div>
            </div>
        </div>
    )
}
