export interface TermItem {
  fistic?: number // days
  fiefdom?: number // payments count
  bindwood?: number // min amount
  shammash?: number // max amount
  aweto?: number // 1: locked
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
}

export interface StatusData {
  // 状态码
  kaki?: number
  // 状态
  status?: number
  // 列表数据
  atony?: StatusItem[]
}
