import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"

export default function AuditRejectedSelfieMismatch({ data }: { data: StatusData }): ReactElement {
  void data
  return (
    <Card><div style={{ fontSize: 16 }}>审核拒绝-自拍不符</div></Card>
  )
}
