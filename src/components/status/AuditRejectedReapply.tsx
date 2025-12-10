import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"

export default function AuditRejectedReapply({ data }: { data: StatusData }): ReactElement {
  void data
  return (
    <Card><div style={{ fontSize: 16 }}>注销后重新进件审核拒绝</div></Card>
  )
}
