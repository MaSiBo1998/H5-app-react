import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { Button, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import {
  UserOutline,
  MessageOutline,
  PhoneFill,
  PayCircleOutline,
  AppOutline,
  CheckCircleOutline,
  RightOutline
} from 'antd-mobile-icons'
import '@/pages/profile/profile.modules.css'

function maskPhone(raw: string | null): string {
  if (!raw) return 'Invitado'
  return raw
}

export default function Profile(): ReactElement {
  const navigate = useNavigate()
  const lastPhone = ((): string | null => {
    const userPhone = localStorage.getItem('userPhone')
    if (userPhone) return userPhone

    try {
      const byLoginInfo = localStorage.getItem('loginInfo')
      if (byLoginInfo) {
        let obj: { phone?: string } | null = null
        try {
          obj = JSON.parse(byLoginInfo) as { phone?: string }
        } catch {
          obj = null
        }
        if (obj && typeof obj.phone === 'string') return obj.phone
      }
    } catch {
      void 0
    }
    const lp = localStorage.getItem('lastPhone')
    return lp
  })()
  const masked = useMemo(() => maskPhone(lastPhone), [lastPhone])

  const goLogin = () => navigate('/login')
  const todo = (label: string) =>{
    switch (label) {
      case 'Mi perfil':
        navigate('/my-info')
        break
      default:
        Toast.show({ content: `${label}: En desarrollo` })
        break
    }
  }

  const menuItems = [
    { label: 'Mi perfil', icon: <UserOutline />, action: () => todo('Mi perfil') },
    { label: 'Cupones', icon: <AppOutline />, action: () => todo('Cupones') },
    { label: 'Mi préstamo', icon: <PayCircleOutline />, action: () => todo('Mi préstamo') },
    { label: 'Protocolo de privacidad', icon: <CheckCircleOutline />, action: () => todo('Protocolo de privacidad') },
    { label: 'Cambiar contraseña', icon: <UserOutline />, action: () => todo('Cambiar contraseña') },
    // { label: 'Sobre nosotros', icon: <QuestionCircleOutline />, action: () => todo('Sobre nosotros') },
    // { label: 'Actualización', icon: <ClockCircleOutline />, action: () => todo('Actualización') },
  ]

  return (
    <div className="profile-page">
      <div className="header">
        <div className="header-bg-pattern"></div>
        <div className="top-actions">
          <div className="action-btn" onClick={() => todo('Mensajes')}><MessageOutline /></div>
          <div className="action-btn" onClick={() => todo('Contacto')}><PhoneFill /></div>
        </div>
        <div className="user-info">
          <div className="avatar">
            <UserOutline />
          </div>
          <div className="info-text">
            <div className="phone">{masked || 'Bienvenido'}</div>
            <div className="status-badge">
              <CheckCircleOutline fontSize={14} /> Usuario verificado
            </div>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="menu-card">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-item" onClick={item.action}>
              <div className="item-icon">{item.icon}</div>
              <div className="item-content">{item.label}</div>
              <div className="item-arrow"><RightOutline /></div>
            </div>
          ))}
        </div>

        <div className="login-container">
          <Button className="login-btn" onClick={goLogin} block>
            INICIAR SESIÓN
          </Button>
        </div>
      </div>
    </div>
  )
}
