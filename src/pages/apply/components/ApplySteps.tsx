import { type ReactElement, Fragment } from 'react'
import { CheckOutline } from 'antd-mobile-icons'

type ApplyStepsProps = {
  // 步骤条配置，包含key和label
  steps?: Array<{ key: string; label: string }>
  // 当前步骤的key
  current?: string
}

export default function ApplySteps({ steps, current }: ApplyStepsProps): ReactElement | null {
  if (!steps || steps.length === 0) return null
  // 获取当前步骤的索引
  const idx = steps.findIndex(s => s.key === current)
  return (
    <div style={{ 
      padding: '16px 20px', 
      background: '#ffffff', 
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 45,
      zIndex: 990
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {steps.map((s, i) => {
          // 判断步骤状态：done(已完成), doing(进行中), todo(未开始)
          const state = i < idx ? 'done' : (i === idx ? 'doing' : 'todo')
          const isLast = i === steps.length - 1
          
          const base: React.CSSProperties = {
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.3s ease-in-out',
            flexShrink: 0,
            zIndex: 2,
            position: 'relative',
          }
          
          let style: React.CSSProperties = { ...base }
          // 根据状态设置样式
          if (state === 'done') {
            style = { 
              ...style, 
              background: '#e0f2f1', 
              color: '#00897b', 
              border: '1px solid #00897b' 
            }
          } else if (state === 'doing') {
            style = { 
              ...style, 
              background: '#00897b', 
              color: '#ffffff', 
              boxShadow: '0 4px 10px rgba(0, 137, 123, 0.3)', 
              transform: 'scale(1.1)', 
              border: 'none' 
            }
          } else {
            style = { 
              ...style, 
              background: '#f5f5f5', 
              color: '#b0bec5', 
              border: '1px solid #eceff1' 
            }
          }

          const lineStyle: React.CSSProperties = {
            flex: 1,
            height: 3,
            background: i < idx ? '#80cbc4' : '#eceff1',
            margin: '0 6px',
            maxWidth: 40,
            minWidth: 10,
            borderRadius: 1.5,
            transition: 'background 0.3s ease-in-out'
          }

          return (
            <Fragment key={s.key}>
              <div style={style}>
                {state === 'done' ? <CheckOutline fontSize={16} /> : i + 1}
              </div>
              {!isLast && <div style={lineStyle} />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
