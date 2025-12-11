export interface LoginFormState {
  // 手机号（不含前缀）
  phoneRest: string
  // 验证码
  code: string
  // 邀请码
  invite: string
  // 验证码倒计时（秒）
  timeLeft: number
  // 是否同意协议
  accepted: boolean
}
