import { request } from '../http'
import { decodeNautch } from '../../utils/encryption'

export interface PayMoneyParams {
  appName: string
  payName: string
  money: number
  bankCode?: string | null
}

export interface PayMoneyResponse {
  otology: string // 支付链接
}

export const toPayMoney = (data: PayMoneyParams) => {
  return request<PayMoneyResponse>('/vieta/sicilia', {
    method: 'POST',
    isLoading: true,
    body: {
      enfant: data.appName,
      eutrophy: data.payName,
      gardyloo: data.money,
      manned: data.bankCode,
    }
  }).then(decodeNautch<PayMoneyResponse>)
}
