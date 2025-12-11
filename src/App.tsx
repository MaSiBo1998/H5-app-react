import { Suspense, useEffect } from 'react'
import type { ReactElement } from 'react'
import { ConfigProvider } from 'antd-mobile'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { collectDeviceInfo } from '@/utils/device'
import { getStepConfigInfo } from '@/services/api/apply'
import { getConfigInfo } from '@/services/api/home'

export default function App(): ReactElement {
  // 初始化设备信息
  useEffect(() => {
    // Initialize device info collection on app startup
    collectDeviceInfo().then(info => {
      console.log('Device info collected:', info)
    }).catch(err => {
      console.error('Failed to collect device info:', err)
    })
  }, [])

  // 初始化配置信息
  useEffect(() => {
    const loginInfo = localStorage.getItem('loginInfo')
    if (!loginInfo) return

    ;(async () => {
      // 获取认证步骤配置
      try {
        const cfg = await getStepConfigInfo({})
        localStorage.setItem('applyStepConfig', JSON.stringify(cfg))
      } catch {
        void 0
      }
      // 获取通用配置
      try {
        const commonCfg = await getConfigInfo()
        localStorage.setItem('commonConfig', JSON.stringify(commonCfg))
      } catch {
        void 0
      }
    })()
  }, [])

  return (
    <Suspense fallback={<div style={{ padding: 16 }}></div>}>
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </Suspense>
  )
}
