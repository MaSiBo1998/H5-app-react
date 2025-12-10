import type { ReactElement } from "react"
import { Card, List } from "antd-mobile"
import type { StatusData, StatusItem } from "./types"

export default function AppList({ data }: { data: StatusData }): ReactElement {
  const items: Array<{ name: string }> = Array.isArray(data?.atony)
    ? data.atony.map((x: StatusItem) => ({ name: x?.lima ?? "App" }))
    : []
  return (
    <Card>
      <div style={{ fontSize: 16, marginBottom: 8 }}>展示 app 列表</div>
      <List>
        {items.length === 0 ? (
          <List.Item>暂无应用</List.Item>
        ) : (
          items.map((it, idx) => <List.Item key={idx}>{it.name}</List.Item>)
        )}
      </List>
    </Card>
  )
}
