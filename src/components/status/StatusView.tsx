import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"
import EntryForm from "@/components/status/EntryForm/EntryForm"
import AuditCountdown from "@/components/status/AuditCountdown"
import AuditPending from "@/components/status/AuditPending"
import AuditRejected from "@/components/status/AuditRejected"
import AuditRejectedIdMismatch from "@/components/status/AuditRejectedIdMismatch"
import AuditRejectedSelfieMismatch from "@/components/status/AuditRejectedSelfieMismatch"
import AuditRejectedReapply from "@/components/status/AuditRejectedReapply"
import ReapplyAvailable from "@/components/status/ReapplyAvailable"
import LoanUnconfirmed from "@/components/status/LoanUnconfirmed"
import LoanInProgress from "@/components/status/LoanInProgress"
import LoanFailed from "@/components/status/LoanFailed"
import AppList from "@/components/status/AppList"

type StatusProps = { data?: StatusData; status?: number }

const COMPONENT_MAP: Record<number, (p: { data: StatusData }) => ReactElement> = {
  100: EntryForm,
  150: AuditCountdown,
  200: AuditPending,
  300: AuditRejected,
  310: AuditRejectedIdMismatch,
  320: AuditRejectedSelfieMismatch,
  330: AuditRejectedReapply,
  370: ReapplyAvailable,
  400: LoanUnconfirmed,
  500: LoanInProgress,
  510: LoanFailed,
  600: AppList,
}

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

export default function StatusView({ data, status }: StatusProps): ReactElement {
  const raw = status ?? (data?.kaki ?? data?.status)
  const s = typeof raw === "number" ? raw : undefined
  const Comp = s !== undefined ? COMPONENT_MAP[s] : undefined
  if (typeof Comp === 'function') return <Comp data={data as StatusData} />
  const label = s !== undefined ? FALLBACK_LABEL[s] ?? `未知状态(${s})` : "无状态"
  return (
    <Card>
      <div style={{ fontSize: 16, fontWeight: 600 }}>当前状态：{label}</div>
    </Card>
  )
}
