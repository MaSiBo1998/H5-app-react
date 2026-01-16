import { request } from '@/services/http'
import { getCookie } from '@/utils/cookie'
import { getStorage, StorageKeys } from '@/utils/storage'
import { decodeNautch, safeBtoa } from '@/utils/encryption'

export interface SubmitOrderParams {
  loanNumber?: string
  appName: string
  chooseAmount: number
  limitDay: number
  fiefdom: number
  golden: number
  gaucho: number
  neophron: number
  single?: string
  deviceInfo: any
}

export interface UploadAuthorDocumentParams {
    deviceInfo: any
}

// 授权文件上传
export const toUploadAuthorDocument = <T = unknown>(data: UploadAuthorDocumentParams) => {
    const bewail = {
        fugate: null,
        acetated: null,
        bourne: safeBtoa(JSON.stringify({
            userAgent: navigator.userAgent,
            adjustId: null,
            info: null,
            fbp: getCookie('_fbp'),
            fbc: getCookie('_fbc'),
            deviceId: getStorage<string>(StorageKeys.UUID) || ''
        }))
    }

    return request<unknown>('/laurie/spongin', {
        method: 'POST',
        body: {
            toise: 2,
            intently: [],
            blastous: safeBtoa(JSON.stringify(data.deviceInfo)),
            bewail: bewail
        }
    }).then(decodeNautch<T>)
}

// 申贷
export const toSubmitOrder = <T = unknown>(data: SubmitOrderParams) => {
    // Construct bewail object (simplified for web)
    const bewail = {
        fugate: null,
        acetated: null,
        bourne: safeBtoa(JSON.stringify({
            userAgent: navigator.userAgent,
            adjustId: null, // Web doesn't have Adjust usually
            info: null,
            fbp: getCookie('_fbp'),
            fbc: getCookie('_fbc'),
            deviceId: getStorage<string>(StorageKeys.UUID) || ''
        }))
    }

    const body = {
        gain: data.loanNumber,
        baiza: data.appName,
        laterite: data.chooseAmount,
        fistic: data.limitDay,
        fiefdom: data.fiefdom,
        golden: data.golden,
        gaucho: data.gaucho,
        neophron: data.neophron,
        single: data.single,
        blastous: safeBtoa(JSON.stringify(data.deviceInfo)),
        bewail: bewail
    }

    return request<unknown>('/thor/mantid/snig', { 
        method: 'POST', 
        isLoading: true,
        body
    }).then(decodeNautch<T>)
}


