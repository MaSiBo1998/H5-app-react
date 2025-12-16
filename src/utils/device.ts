import { getStorage, setStorage, StorageKeys } from './storage'

// 获取网络类型辅助函数
const getNetworkType = (): string | null => {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  return conn ? conn.effectiveType : null
}

// FingerprintJS promise (loaded once)
const fpPromise = import('@fingerprintjs/fingerprintjs')
  .then(FingerprintJS => FingerprintJS.load())

export interface DeviceInfo {
  amidol: {
    daybreak: string // 设备ID
    uuid: string
    drmid: string
    gaid: string
    grating: string // 设备型号
    indium: string // 设备品牌
    rivage: string | null // 经度
    required: string | null // 纬度
    dangly: string | null // wifi ssid
    conger: string | null // wifi mac
    doeth: string | null // 局域网 ip
    trouser: string | null // 公网 ip
    suite: string | null // 包名
    aiie: string // 应用版本
  }
  showily: {
    sappy: number // 屏幕宽度
    osculum: number // 屏幕高度
    reciter: string // 设备品牌
    roomette: string // 系统版本
    tartar: string // 设备型号
    eighty: number | null // CPU 核心数
  }
  decree: {
    charka: string | null // 内存
    nineveh: string | null // 最大内存
    korai: string | null // 可用内存
  }
  sediment: {
    suzhou: number // 运行时间(ms) 不含休眠
    kasolite: number // 运行时间(ms) 含休眠
    prentice: string | null // 网络类型
    disport: boolean | null // 是否模拟器
    jejunely: string | null // android id
    endville: string // 时区
    calking: string // 国家代码
    mild: string // 语言 (如: en_US)
  }
  azoturia: {
    // 电池信息
  }
}

// 获取或生成 UUID 辅助函数
export const getUUID = async (): Promise<string> => {
  let uuid = getStorage<string>(StorageKeys.UUID)
  if (!uuid) {
    const fp = await fpPromise
    const result = await fp.get()
    const timestamp = Date.now()
    uuid = `${result.visitorId}-${timestamp}`
    setStorage(StorageKeys.UUID, uuid)
  }
  return uuid
}

// 检测 iPhone 型号辅助函数 (基于屏幕尺寸/像素比的粗略近似)
// 由于 Web 端精确检测型号受限，我们返回 'iPhone' 或可区分的具体型号
const detectIPhoneModel = (): string => {
  const { width, height } = window.screen
  if (width === 375 && height === 812) return 'iPhone X/XS/11 Pro'
  if (width === 414 && height === 896) return 'iPhone XS Max/XR/11/11 Pro Max'
  if (width === 390 && height === 844) return 'iPhone 12/13/14'
  if (width === 428 && height === 926) return 'iPhone 12/13/14 Pro Max'
  return 'iPhone'
}

// 获取位置信息辅助函数
const getLocation = (): Promise<{ longitude: string | null; latitude: string | null }> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ longitude: null, latitude: null })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          longitude: position.coords.longitude.toString(),
          latitude: position.coords.latitude.toString(),
        })
      },
      () => {
        resolve({ longitude: null, latitude: null })
      },
      { timeout: 10000 }
    )
  })
}



export const collectDeviceInfo = async (): Promise<DeviceInfo> => {
  const uuid = await getUUID()
  const location = await getLocation()
  const userAgent = navigator.userAgent
  const isAndroid = /Android/i.test(userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const language = navigator.language
  
  let deviceModel = 'Unknown'
  let deviceBrand = 'Unknown'
  let osVersion = 'Unknown'

  if (isAndroid) {
    deviceBrand = 'Android' // 浏览器无法可靠获取确切品牌
    const match = userAgent.match(/Android\s([0-9.]+)/)
    osVersion = match ? match[1] : 'Unknown'
    // 尝试从 UA 中提取型号 (如: "Pixel 5")
    const modelMatch = userAgent.match(/\)\s+([\w\s]+)\s+Build/)
    deviceModel = modelMatch ? modelMatch[1] : 'Android Device'
  } else if (isIOS) {
    deviceBrand = 'Apple'
    deviceModel = detectIPhoneModel()
    const match = userAgent.match(/OS\s([\w]+)\s+like/)
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown'
  } else {
    deviceBrand = 'Web'
    deviceModel = 'Browser'
    osVersion = navigator.platform
  }

  const uptime = performance.now()

  const info: DeviceInfo = {
    amidol: {
      daybreak: uuid,
      uuid: uuid,
      drmid: uuid,
      gaid: uuid,
      grating: deviceModel,
      indium: deviceBrand,
      rivage: location.longitude,
      required: location.latitude,
      dangly: null, // Web API 限制
      conger: null, // Web API 限制
      doeth: null, // Web API 限制
      trouser: null, // Web API 限制
      suite: null, // Web API 限制
      aiie: '1.0.0', // 硬编码或从环境变量获取
    },
    showily: {
      sappy: screenWidth,
      osculum: screenHeight,
      reciter: deviceBrand,
      roomette: osVersion,
      tartar: deviceModel,
      eighty: navigator.hardwareConcurrency || null,
    },
    decree: {
      charka: null, // Web API 限制
      nineveh: null, // Web API 限制
      korai: null, // Web API 限制
    },
    sediment: {
      suzhou: uptime,
      kasolite: uptime, // Web 端难以区分休眠时间
      prentice: getNetworkType(),
      disport: null, // Web 端难以可靠检测模拟器
      jejunely: null, // Web API 限制
      endville: Intl.DateTimeFormat().resolvedOptions().timeZone,
      calking: language.split('-')[1] || language,
      mild: language,
    },
    azoturia: {},
  }

  // 如果可用，保存位置到本地存储
  if (location.longitude && location.latitude) {
    setStorage(StorageKeys.LOCATION, location)
  } else {
      // 如果本次获取失败，尝试从本地存储加载
      const savedLoc = getStorage<{ longitude: string, latitude: string }>(StorageKeys.LOCATION)
      if (savedLoc) {
          info.amidol.rivage = savedLoc.longitude
          info.amidol.required = savedLoc.latitude
      }
  }

  // 持久化完整设备信息
  setStorage(StorageKeys.DEVICE_INFO, info)
  
  return info
}
