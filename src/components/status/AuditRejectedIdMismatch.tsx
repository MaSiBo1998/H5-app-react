import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"

export default function AuditRejectedIdMismatch({ data }: { data: StatusData }): ReactElement {
  void data
  return (
    <Card><div style={{ fontSize: 16 }}>审核拒绝-身份证不符</div></Card>
  )
}
