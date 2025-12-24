import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
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
import { toLogOut, type UserDetail} from '@/services/api/user'
import { getStorage, removeStorage, StorageKeys } from '@/utils/storage'
import '@/pages/profile/profile.modules.css'
import { getHomeData } from '@/services/api/home'
import type { StatusData } from '@/components/status/types'

// 手机号脱敏处理
function maskPhone(raw: string | null): string {
  if (!raw) return 'Invitado'
  // 脱敏处理
  return raw.replace(/(\d{2})\d{6}(\d{4})/, '$1******$2')
}

export default function Profile(): ReactElement {
  const [homeInfo, setHomeInfo] = useState<StatusData>()
  // 获取个人信息
  useEffect(() =>{
    (async () => {
      try {
        const res = await getHomeData()
        if (res) {
          console.log(res)
          setHomeInfo(res)
        }
      } catch (e) {
        console.error(e)
      }
    })()
  },[])
  const navigate = useNavigate()
  // 获取上次登录的手机号
  const lastPhone = ((): string | null => {
    const userPhone = getStorage<string>(StorageKeys.USER_PHONE)
    if (userPhone) return userPhone

    try {
      const byLoginInfo = getStorage<{ phone?: string }>(StorageKeys.LOGIN_INFO)
      if (byLoginInfo && typeof byLoginInfo.phone === 'string') return byLoginInfo.phone
    } catch {
      void 0
    }
    const lp = getStorage<string>(StorageKeys.LAST_PHONE)
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
              removeStorage(StorageKeys.LOGIN_INFO)
              removeStorage(StorageKeys.USER_PHONE)
              removeStorage(StorageKeys.MOBILE)
              navigate('/login')
            }
          }
        }
      ]]
    })
  }
  
  const fining = homeInfo?.fining ?? 0

  // 菜单点击处理
  const todo = (label: string) =>{
    switch (label) {
      case 'Mi perfil':
        navigate('/my-info')
        break
      case 'Mi préstamo':
        navigate('/my-order')
        break
      case 'Cambiar contraseña':
        if (fining === 1) {
          navigate('/check-mobile?type=userEditPass')
        } else {
          navigate('/set-password')
        }
        break
      case 'Establecer contraseña':
        navigate('/set-password?type=userEditPass')
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
    { 
      label: fining === 0 ? 'Establecer contraseña' : 'Cambiar contraseña', 
      icon: <UserOutline />, 
      action: () => todo(fining === 0 ? 'Establecer contraseña' : 'Cambiar contraseña') 
    },
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
