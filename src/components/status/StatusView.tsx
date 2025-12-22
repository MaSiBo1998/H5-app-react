import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"
import EntryForm from "@/components/status/EntryForm/EntryForm"
import AuditCountdown from "@/components/status/AuditCountdown/AuditCountdown"
import AuditPending from "@/components/status/AuditPending/AuditPending"
import ExamineReject from "@/components/status/ExamineReject/ExamineReject"
import IdCardOrFaceReject from "@/components/status/IdCardOrFaceReject/IdCardOrFaceReject"
import LoanUnconfirmed from "@/components/status/LoanUnconfirmed/LoanUnconfirmed"
import LoanInProgress from "@/components/status/LoanInProgress/LoanInProgress"
import LoanFailed from "@/components/status/LoanFailed/LoanFailed"
import AppList from "@/components/status/AppList/AppList"

type StatusProps = { data?: StatusData; status?: number; onRefresh?: (showLoading?: boolean) => void }

// 状态码对应的组件映射
const COMPONENT_MAP: Record<number, (p: { data: StatusData, onRefresh?: (showLoading?: boolean) => void }) => ReactElement> = {
  100: EntryForm,
  150: AuditCountdown,
  200: AuditPending,
  300: ExamineReject,
  310: IdCardOrFaceReject,
  320: IdCardOrFaceReject,
  370: EntryForm, // 370 uses newLoanToStep in Vue
  400: LoanUnconfirmed,
  500: LoanInProgress,
  510: LoanFailed,
  600: AppList,
}

// 状态码对应的描述文本（用于降级显示）
const FALLBACK_LABEL: Record<number, string> = {
  100: "未授信-展示进件页面",
  150: "首贷-审核倒计时",
  200: "首贷-审核中",
  300: "首贷-审核拒绝",
  310: "首贷-审核拒绝-身份证不符",
  320: "首贷-审核拒绝-自拍不符",
  330: "账号注销后重新进件审核拒绝",
  370: "可再次申请，调用申贷接口",
  400: "首贷-未确认",
  500: "首贷-放款中",
  510: "首贷-放款失败",
  600: "展示 app 列表",
}

export default function StatusView({ data, status, onRefresh }: StatusProps): ReactElement {
  // 获取状态码
  const raw = status ?? (data?.kaki ?? data?.status)
  const s = typeof raw === "number" ? raw : undefined
  // 根据状态码获取组件
  const Comp = s !== undefined ? COMPONENT_MAP[s] : undefined
  if (typeof Comp === 'function') return <Comp data={data as StatusData} onRefresh={onRefresh} />
  // 降级显示
  const label = s !== undefined ? FALLBACK_LABEL[s] ?? `未知状态(${s})` : "无状态"
  return (
    <Card>
      <div style={{ fontSize: 16, fontWeight: 600 }}>当前状态：{label}</div>
    </Card>
  )
}
