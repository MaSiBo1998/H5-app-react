import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"

export default function LoanUnconfirmed({ data }: { data: StatusData }): ReactElement {
  void data
  return (
    <Card><div style={{ fontSize: 16 }}>首贷-未确认</div></Card>
  )
}
