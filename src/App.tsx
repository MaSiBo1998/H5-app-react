import { Suspense, useEffect } from 'react'
import type { ReactElement } from 'react'
import { ConfigProvider } from 'antd-mobile'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { collectDeviceInfo } from '@/utils/device'
import { getStepConfigInfo } from '@/services/api/apply'
import { getConfigInfo } from '@/services/api/home'
import TestTools from '@/components/TestTools/TestTools'
import { getStorage, setStorage, StorageKeys } from '@/utils/storage'

export default function App(): ReactElement {
  // 初始化设备信息及第三方 SDK
  useEffect(() => {
    // @ts-ignore
    const Adjust = window.Adjust

    // 应用启动时初始化设备信息收集
    collectDeviceInfo().then(info => {
      console.log('Device info collected:', info)
    }).catch(err => {
      console.error('Failed to collect device info:', err)
    })

    // Adjust SDK 初始化
    try {
      const handleAdjustReferrer = () => {
        try {
          const queryString = window.location.search
          const urlParams = new URLSearchParams(queryString)
          const adjustReferrer = urlParams.get('adjust_referrer')
          if (adjustReferrer) {
            const referrerParams = new URLSearchParams(adjustReferrer)
            const clickId = referrerParams.get('adjust_external_click_id')

            if (clickId) {
              const value = `adjust_external_click_id%3D${clickId}`
              // @ts-ignore
              if (Adjust.setReferrer) {
                 // @ts-ignore
                 Adjust.setReferrer(value)
              }
            }
          }
        } catch (e) {
          console.error('Error handling adjust referrer:', e)
        }
      }

      handleAdjustReferrer()

      Adjust.initSdk({
        appToken: 'cqp3ptmfzmdc',
        environment: 'production',
        logLevel: 'verbose',
        attributionCallback: function (_e: any, attribution: any) {
          setStorage('adjustInfo', attribution)
          // firstOpenUpload().then(() => {})
        },
      })
    } catch (e) {
      console.error('Adjust init failed:', e)
    }

    // 金果 (FingerPrint) 初始化
    // 注意: 需要在 index.html 中引入 FingerPrint SDK 脚本
    try {
      // @ts-ignore
      if (typeof window.FingerPrint !== 'undefined') {
        // @ts-ignore
        const client = new window.FingerPrint(
          "https://us.mobilebene.com/w",
          import.meta.env.VITE_APP_JG_KEY
        )
        // @ts-ignore
        client.getDeviceId().then((res: any) => {
          console.log(res, "JG-DeviceId")
          setStorage("JG-DeviceId", res)
        })
      }
    } catch (e) {
      console.error('FingerPrint init failed:', e)
    }

  }, [])

  // 初始化配置信息
  useEffect(() => {
    const loginInfo = getStorage(StorageKeys.LOGIN_INFO)
    if (!loginInfo) return

    ;(async () => {
      // 获取认证步骤配置
      try {
        const cfg = await getStepConfigInfo({})
        setStorage(StorageKeys.APPLY_STEP_CONFIG, cfg)
      } catch {
        void 0
      }
      // 获取通用配置
      try {
        const commonCfg = await getConfigInfo()
        setStorage(StorageKeys.COMMON_CONFIG, commonCfg)
      } catch {
        void 0
      }
    })()
  }, [])

  return (
    <Suspense fallback={<div style={{ padding: 16 }}></div>}>
      <ConfigProvider>
        <RouterProvider router={router} />
        <TestTools />
      </ConfigProvider>
    </Suspense>
  )
}
