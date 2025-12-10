import type { ReactElement } from "react"
import { Card } from "antd-mobile"
import type { StatusData } from "./types"

export default function LoanInProgress({ data }: { data: StatusData }): ReactElement {
  const phone = data?.atony?.[0]?.heavy
  return (
    <Card><div style={{ fontSize: 16 }}>首贷-放款中 {phone ? `(${phone})` : ""}</div></Card>
  )
}
