import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Initialize the agent at application startup.
const fpPromise = FingerprintJS.load()

export interface DeviceInfo {
  amidol: {
    daybreak: string // device_id
    uuid: string
    drmid: string
    gaid: string
    grating: string // deviceModel
    indium: string // deviceBrand
    rivage: string | null // longitude
    required: string | null // latitude
    dangly: string | null // wifi ssid
    conger: string | null // wifi mac
    doeth: string | null // local ip
    trouser: string | null // public ip
    suite: string | null // package name
    aiie: string // appVersion
  }
  showily: {
    sappy: number // screenWidth
    osculum: number // screenHeight
    reciter: string // deviceBrand
    roomette: string // osVersion
    tartar: string // deviceModel
    eighty: number | null // cpu count
  }
  decree: {
    charka: string | null // RAM
    nineveh: string | null // max memory
    korai: string | null // available memory
  }
  sediment: {
    suzhou: number // uptime (ms) excluding sleep
    kasolite: number // uptime (ms) including sleep
    prentice: string | null // network type
    disport: boolean | null // is emulator
    jejunely: string | null // android id
    endville: string // timezone
    calking: string // country code
    mild: string // language (e.g., en_US)
  }
  azoturia: {
    // Battery info
  }
}

// Helper to get or generate UUID
export const getUUID = async (): Promise<string> => {
  let uuid = localStorage.getItem('uuid')
  if (!uuid) {
    const fp = await fpPromise
    const result = await fp.get()
    const timestamp = Date.now()
    uuid = `${result.visitorId}-${timestamp}`
    localStorage.setItem('uuid', uuid)
  }
  return uuid
}

// Helper to detect iPhone model (basic approximation based on screen size/pixel ratio)
// Since exact model detection is limited in web, we return 'iPhone' or specific models if distinguishable
const detectIPhoneModel = (): string => {
  const { width, height } = window.screen
  if (width === 375 && height === 812) return 'iPhone X/XS/11 Pro'
  if (width === 414 && height === 896) return 'iPhone XS Max/XR/11/11 Pro Max'
  if (width === 390 && height === 844) return 'iPhone 12/13/14'
  if (width === 428 && height === 926) return 'iPhone 12/13/14 Pro Max'
  return 'iPhone'
}

// Helper to get location
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

// Helper to get network type
const getNetworkType = (): string | null => {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  return conn ? conn.effectiveType : null
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
    deviceBrand = 'Android' // Browser doesn't give exact brand reliably
    const match = userAgent.match(/Android\s([0-9.]+)/)
    osVersion = match ? match[1] : 'Unknown'
    // Try to extract model from UA (e.g., "Pixel 5")
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
      dangly: null, // Web API limitation
      conger: null, // Web API limitation
      doeth: null, // Web API limitation
      trouser: null, // Web API limitation
      suite: null, // Web API limitation
      aiie: '1.0.0', // Hardcoded or from env
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
      charka: null, // Web API limitation
      nineveh: null, // Web API limitation
      korai: null, // Web API limitation
    },
    sediment: {
      suzhou: uptime,
      kasolite: uptime, // Cannot distinguish sleep time easily in web
      prentice: getNetworkType(),
      disport: null, // Hard to detect emulator reliably in web
      jejunely: null, // Web API limitation
      endville: Intl.DateTimeFormat().resolvedOptions().timeZone,
      calking: language.split('-')[1] || language,
      mild: language,
    },
    azoturia: {},
  }

  // Save location to local storage if available
  if (location.longitude && location.latitude) {
    localStorage.setItem('location', JSON.stringify(location))
  } else {
      // Try to load from local storage if current fetch failed
      const savedLoc = localStorage.getItem('location')
      if (savedLoc) {
          const parsed = JSON.parse(savedLoc)
          info.amidol.rivage = parsed.longitude
          info.amidol.required = parsed.latitude
      }
  }

  // Persist full device info
  localStorage.setItem('deviceInfo', JSON.stringify(info))
  
  return info
}
