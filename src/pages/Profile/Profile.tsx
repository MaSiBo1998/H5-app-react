import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { Button, Toast, Dialog } from 'antd-mobile'
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
import { toLogOut } from '@/services/api/user'
import '@/pages/profile/profile.modules.css'

// 手机号脱敏处理
function maskPhone(raw: string | null): string {
  if (!raw) return 'Invitado'
  // 脱敏处理
  return raw.replace(/(\d{2})\d{6}(\d{4})/, '$1******$2')
}

export default function Profile(): ReactElement {
  const navigate = useNavigate()
  // 获取上次登录的手机号
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
  // 缓存脱敏后的手机号
  const masked = useMemo(() => maskPhone(lastPhone), [lastPhone])
  // 退出登录
  const handleLogout = () => {
    Dialog.show({
      content: '¿Estás seguro de que quieres cerrar sesión?',
      closeOnAction: true,
      actions: [[
        {
          key: 'cancel',
          text: 'Cancelar',
          style: { color: '#999999' }
        },
        {
          key: 'confirm',
          text: 'Confirmar',
          style: { color: '#26a69a', fontWeight: 'bold' },
          onClick: async () => {
            try {
              await toLogOut()
            } catch (e) {
              console.error(e)
            } finally {
              localStorage.removeItem('loginInfo')
              localStorage.removeItem('userPhone')
              localStorage.removeItem('mobile')
              navigate('/login')
            }
          }
        }
      ]]
    })
  }
  
  // 菜单点击处理
  const todo = (label: string) =>{
    switch (label) {
      case 'Mi perfil':
        navigate('/my-info')
        break
      case 'Mi préstamo':
        navigate('/my-order')
        break
      default:
        Toast.show({ content: `${label}: En desarrollo` })
        break
    }
  }

  // 菜单配置
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
          {
            <Button className="login-btn" onClick={handleLogout} block>
              CERRAR SESIÓN
            </Button>
          }
        </div>
      </div>
    </div>
  )
}
