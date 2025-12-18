import React, { useState, useEffect, ReactElement } from 'react'
import { Toast } from 'antd-mobile'
import styles from './TestTools.module.css'

interface TestToolsProps {
  onRefresh?: () => void
}

export default function TestTools({ onRefresh }: TestToolsProps): ReactElement | null {
  const [showTools, setShowTools] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [applyNum, setApplyNum] = useState('')
  const [repayMoney, setRepayMoney] = useState<number>(100)
  const [overdueDays, setOverdueDays] = useState<number>(1)

  useEffect(() => {
    checkTestEnv()
  }, [])

  const checkTestEnv = () => {
    try {
      const host = window.location.host
      const isDev = import.meta.env.DEV ||
        host.includes('localhost') ||
        host.includes('127.0.0.1')
      setShowTools(isDev)
    } catch (e) {
      console.error('Check test env failed:', e)
    }
  }

  const togglePanel = () => {
    setIsExpanded(!isExpanded)
  }

  const clearApplyNum = () => {
    setApplyNum('')
    Toast.show({
      content: '已清空',
      icon: 'success',
      duration: 1000,
    })
  }

  const handleOverdueDaysInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setOverdueDays(val ? parseInt(val) : 1)
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      window.location.reload()
    }
  }

  const callRiskCallback = async (creditResult: number, refuseId: string | number = '', refuseStage: string | number = '') => {
    if (!applyNum) {
      Toast.show({ content: '请先输入申请号' })
      return
    }

    Toast.show({ icon: 'loading', content: '请求中...', duration: 0 })

    try {
      const data = {
        applyNum: applyNum,
        creditResult: creditResult.toString(),
        refuseId: refuseId,
        refuseStage: refuseStage.toString(),
        needManualReview: '0',
        msg: '',
      }

      const response = await fetch('https://api-co1.zeropointch.net/server-external/testRiskResultCallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const resData = await response.json()

      Toast.clear()
      Toast.show({
        content: creditResult === 2 ? '审核通过成功' : '审核拒绝成功',
        icon: 'success',
      })

      setTimeout(handleRefresh, 1500)
    } catch (error: any) {
      Toast.clear()
      Toast.show({
        content: '调用失败: ' + (error.message || '未知错误'),
      })
      console.error('审核回调失败:', error)
    }
  }

  const callLoanCallback = async (result: boolean) => {
    if (!applyNum) {
      Toast.show({ content: '请先输入订单号' })
      return
    }

    Toast.show({ icon: 'loading', content: '请求中...', duration: 0 })

    try {
      const appChannel = 'Rapid Credito'
      const url = `https://api-co1.zeropointch.net/server-external/testToLoanCallback?appChannel=${appChannel}&orderNum=${applyNum}&result=${result}`

      await fetch(url)

      Toast.clear()
      Toast.show({
        content: result ? '打款成功' : '打款失败',
        icon: 'success',
      })

      setTimeout(handleRefresh, 1500)
    } catch (error: any) {
      Toast.clear()
      Toast.show({
        content: '调用失败: ' + (error.message || '未知错误'),
      })
      console.error('打款回调失败:', error)
    }
  }

  const callRepayCallback = async () => {
    if (!applyNum) {
      Toast.show({ content: '请先输入订单号' })
      return
    }

    if (!repayMoney || repayMoney <= 0) {
      Toast.show({ content: '请输入有效的还款金额' })
      return
    }

    Toast.show({ icon: 'loading', content: '请求中...', duration: 0 })

    try {
      const appChannel = 'Rapid Credito'
      const url = `https://api-co1.zeropointch.net/server-external/testReLoanCallback?appChannel=${appChannel}&orderNum=${applyNum}&money=${repayMoney}`

      await fetch(url)

      Toast.clear()
      Toast.show({
        content: `还款${repayMoney}成功`,
        icon: 'success',
      })

      setTimeout(handleRefresh, 1500)
    } catch (error: any) {
      Toast.clear()
      Toast.show({
        content: '调用失败: ' + (error.message || '未知错误'),
      })
      console.error('还款回调失败:', error)
    }
  }

  const callUserClean = async () => {
    if (!applyNum) {
      Toast.show({ content: '请先输入订单号' })
      return
    }

    Toast.show({ icon: 'loading', content: '请求中...', duration: 0 })

    try {
      const url = `https://api-co1.zeropointch.net/server-external/testUserClean?orderNum=${applyNum}`
      await fetch(url)

      Toast.clear()
      Toast.show({
        content: '重置成功',
        icon: 'success',
      })

      setTimeout(handleRefresh, 1500)
    } catch (error: any) {
      Toast.clear()
      Toast.show({
        content: '调用失败: ' + (error.message || '未知错误'),
      })
      console.error('重置用户失败:', error)
    }
  }

  const callSetOverdue = async () => {
    if (!applyNum) {
      Toast.show({ content: '请先输入订单号' })
      return
    }

    if (!overdueDays || overdueDays <= 0) {
      Toast.show({ content: '请输入有效的逾期天数' })
      return
    }

    Toast.show({ icon: 'loading', content: '请求中...', duration: 0 })

    try {
      const url = `https://api-co1.zeropointch.net/server-external/testToOverdue?orderNum=${applyNum}&overdueDays=${overdueDays}`
      await fetch(url)

      Toast.clear()
      Toast.show({
        content: `设置逾期${overdueDays}天成功`,
        icon: 'success',
      })

      setTimeout(handleRefresh, 1500)
    } catch (error: any) {
      Toast.clear()
      Toast.show({
        content: '调用失败: ' + (error.message || '未知错误'),
      })
      console.error('设置逾期失败:', error)
    }
  }

  if (!showTools) return null

  return (
    <div className={styles['test-tools']}>
      {/* 折叠按钮 */}
      <div className={styles['toggle-btn']} onClick={togglePanel}>
        <span>{isExpanded ? '收起' : '测试工具'}</span>
      </div>

      {/* 遮罩层 */}
      {isExpanded && <div className={styles.overlay} onClick={togglePanel}></div>}

      {/* 测试面板 */}
      {isExpanded && (
        <div className={styles['tools-panel']}>
          <div className={styles['panel-header']}>
            <span className={styles.title}>测试工具面板</span>
            <div className={styles['close-btn']} onClick={togglePanel}>×</div>
          </div>

          {/* 申请号/订单号输入 */}
          <div className={styles['input-group']}>
            <span className={styles.label}>申请号/订单号:</span>
            <input
              className={styles.input}
              value={applyNum}
              onChange={(e) => setApplyNum(e.target.value)}
              type="text"
              placeholder="请输入申请号/订单号"
            />
            <button className={`${styles['test-btn']} ${styles['clear-btn']}`} onClick={clearApplyNum}>
              清空
            </button>
          </div>

          {/* 审核回调 */}
          <div className={styles.section}>
            <span className={styles['section-title']}>审核回调</span>
            <div className={styles['btn-group']}>
              <button className={`${styles['test-btn']} ${styles.success}`} onClick={() => callRiskCallback(2)}>
                审核通过
              </button>
              <button className={`${styles['test-btn']} ${styles.danger}`} onClick={() => callRiskCallback(1)}>
                审核拒绝
              </button>
            </div>
            <div className={styles['btn-group']} style={{ marginTop: '8px' }}>
              <button className={`${styles['test-btn']} ${styles.danger}`} onClick={() => callRiskCallback(1, 40100, 5)}>
                身份证不符
              </button>
              <button className={`${styles['test-btn']} ${styles.danger}`} onClick={() => callRiskCallback(1, 40200, 5)}>
                自拍不符
              </button>
            </div>
          </div>

          {/* 打款接口 */}
          <div className={styles.section}>
            <span className={styles['section-title']}>打款接口</span>
            <div className={styles['btn-group']}>
              <button className={`${styles['test-btn']} ${styles.success}`} onClick={() => callLoanCallback(true)}>
                打款成功
              </button>
              <button className={`${styles['test-btn']} ${styles.danger}`} onClick={() => callLoanCallback(false)}>
                打款失败
              </button>
            </div>
          </div>

          {/* 还款接口 */}
          <div className={styles.section}>
            <span className={styles['section-title']}>还款接口</span>
            <div className={styles['input-row']}>
              <input
                className={`${styles.input} ${styles.small}`}
                value={repayMoney}
                onChange={(e) => setRepayMoney(Number(e.target.value))}
                type="number"
                placeholder="金额"
              />
              <button className={`${styles['test-btn']} ${styles.primary}`} onClick={callRepayCallback}>
                还款
              </button>
            </div>
          </div>

          {/* 其他操作 */}
          <div className={styles.section}>
            <span className={styles['section-title']}>其他操作</span>
            <div className={styles['btn-group']}>
              <button className={`${styles['test-btn']} ${styles.warning}`} onClick={callUserClean}>
                重置至倒计时
              </button>
            </div>
            <div className={styles['input-row']} style={{ marginTop: '8px' }}>
              <input
                className={`${styles.input} ${styles.small}`}
                value={overdueDays}
                onChange={handleOverdueDaysInput}
                type="text"
                placeholder="逾期天数"
              />
              <button className={`${styles['test-btn']} ${styles.danger}`} onClick={callSetOverdue}>
                设置逾期
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
