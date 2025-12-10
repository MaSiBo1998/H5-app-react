import { Input } from 'antd-mobile'
import type { ReactElement } from 'react'
import styles from '../Login.module.css'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function PhoneInput({ value, onChange }: Props): ReactElement {
  return (
    <div className={styles['form-group']}>
      <label className={styles['form-label']}>Número de celular</label>
      <div className={styles['input-wrapper']}>
        <div className={styles['phone-prefix']}>
          <div className={styles['prefix-flag']}>🇨🇴</div>
          <span className={styles['prefix-code']}>+57</span>
        </div>
        <Input
          value={value}
          onChange={(v) => {
            const digits = v.replace(/\D/g, '')
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
