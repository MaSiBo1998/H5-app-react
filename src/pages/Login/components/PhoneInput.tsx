import { Input } from 'antd-mobile'
import type { ReactElement } from 'react'
import styles from '../Login.module.css'

interface Props {
  // 手机号值
  value: string
  // 值改变回调
  onChange: (v: string) => void
}

export default function PhoneInput({ value, onChange }: Props): ReactElement {
  return (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Número de celular</label>
      <div className={styles['input-wrapper']}>
        {/* 手机号前缀部分 */}
        <div className={styles['phone-prefix']}>
          <div className={styles['prefix-flag']}>🇨🇴</div>
          <span className={styles['prefix-code']}>+57</span>
        </div>
        {/* 手机号输入框 */}
        <Input
          value={value}
          onChange={(v) => {
            // 仅允许输入数字
            const digits = v.replace(/\D/g, '')
            // 限制长度为10位
            onChange(digits.slice(0, 10))
          }}
          maxLength={10}
          placeholder="300 123 4567"
          clearable
          type="tel"
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16 }}
        />
      </div>
    </div>
  )
}
