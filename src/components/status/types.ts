export interface TermItem {
  fistic?: number // days
  fiefdom?: number // payments count
  bindwood?: number // min amount
  shammash?: number // max amount
  aweto?: number // 1: locked
  golden?: number
  gaucho?: number
  neophron?: number
  seacoast?: number // interest rate
  usual?: number // interest ratio
  cornet?: number // tax ratio
}

export interface LoanInfo {
  laterite?: number // amount
  fistic?: number // days
  antidote?: string // account
}

export interface Scuzzy {
  medibank?: number // status code?
  essonite?: string // date?
  yell?: LoanInfo
  frog?: number // countdown time (seconds)
}

export interface Valour {
  scuzzy?: Scuzzy
  duodenal?: TermItem[]
}

export interface StatusItem {
  // 应用名称
  lima?: string
  // 手机号
  heavy?: string
  // 最大金额
  shammash?: number
  // 最小金额
  bindwood?: number
  // 最大期限
  rainworm?: number
  // 扩展数据
  valour?: Valour
  // 扩展数据 (direct on item sometimes?)
  scuzzy?: Scuzzy
  // 期限列表 (direct on item sometimes?)
  duodenal?: TermItem[]
  // 订单号?
  gain?: string
  // 状态/类型
  aweto?: number // 0: enabled, 1: disabled
  keyway?: number // 300: repayment/overdue
  galabia?: number // 0: in payment, 1: overdue
  gridding?: string // icon url
  zoogamy?: number // days (duration)
  judaical?: number // repayment amount
  tailfan?: Tailfan
}

export interface SpadoItem {
  leonora?: number // status? 300
  galabia?: number // overdue? 1
  overdo?: string // time ago
  surfing?: number // amount
  laterite?: number // amount detail
  larder?: number // commission
  masseuse?: number // interest
  encash?: number // tax/IVA
  movies?: string // repayment date
  sicken?: number // penalty
  judaical?: number // total amount?
}

export interface PaymentMethod {
  airpost?: string // icon
  affluent?: string // name
  suit?: string // desc
  sermon?: string // payment method code (e.g. PAGSMILE)
  osmose?: string // bank code or similar
}

export interface Tailfan {
  bengalee?: number // amount
  fistic?: number // days
  galabia?: number // overdue status
  spado?: SpadoItem[]
  berserk?: PaymentMethod[]
}

export interface StatusData {
  // 状态码
  kaki?: number
  // 状态
  status?: number
  // 列表数据
  atony?: StatusItem[]
  tailfan?: Tailfan
}
