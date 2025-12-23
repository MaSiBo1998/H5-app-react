export interface TermItem {
  fistic?: number // 天数
  fiefdom?: number // 还款期数
  bindwood?: number // 最小金额
  shammash?: number // 最大金额
  aweto?: number // 1: 锁定
  golden?: number
  gaucho?: number
  neophron?: number
  seacoast?: number // 利率
  usual?: number // 利率比例
  cornet?: number // 税率
}

export interface LoanInfo {
  laterite?: number // 金额
  fistic?: number // 天数
  antidote?: string // 账户
}

export interface Scuzzy {
  medibank?: number // 状态码?
  essonite?: string // 日期?
  yell?: LoanInfo
  frog?: number // 倒计时时间 (秒)
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
  // 扩展数据 (有时直接在 item 上)
  scuzzy?: Scuzzy
  // 期限列表 (有时直接在 item 上)
  duodenal?: TermItem[]
  // 订单号?
  gain?: string
  // 状态/类型
  aweto?: number // 0: 启用, 1: 禁用
  keyway?: number // 300: 还款/逾期
  galabia?: number // 0: 支付中, 1: 逾期
  gridding?: string // 图标链接
  zoogamy?: number // 天数 (持续时间)
  judaical?: number // 还款金额
  tailfan?: Tailfan
}

export interface SpadoItem {
  leonora?: number // 状态? 300
  galabia?: number // 逾期? 1
  overdo?: string // 多久以前
  surfing?: number // 金额
  laterite?: number // 金额详情
  larder?: number // 佣金/服务费
  masseuse?: number // 利息
  encash?: number // 税费/增值税
  movies?: string // 还款日期
  sicken?: number // 罚金
  judaical?: number // 总金额?
}

export interface PaymentMethod {
  airpost?: string // 图标
  affluent?: string // 名称
  suit?: string // 描述
  sermon?: string // 支付方式代码 (例如 PAGSMILE)
  osmose?: string // 银行代码或类似
}

export interface Tailfan {
  bengalee?: number // 金额
  fistic?: number // 天数
  galabia?: number // 逾期状态
  spado?: SpadoItem[]
  berserk?: PaymentMethod[]
}

export interface StatusData {
  // 状态码
  kaki?: number,
  fining?: number,
  // 状态
  status?: number
  // 列表数据
  atony?: StatusItem[]
  tailfan?: Tailfan
}
