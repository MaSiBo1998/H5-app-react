import HeaderNav from "@/components/common/HeaderNav";
import { Tabs } from "antd-mobile";
import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrderList } from '@/services/api/myOrder'
export default function MyOrder(): ReactElement {
  const navigate = useNavigate()
  // 激活index
  const [activeKey, setActiveKey] = useState<string>('padding')
  // 订单列表
  const [orderList, setOrderList] = useState<any[]>([])
  // 返回个人中心
  const goBack = () => {
    navigate('/profile')
  }
  const tabList: { title: string, key: string }[] = [
    { title: 'Orden actual', key: 'padding' },
    { title: 'Pedidos históricos', key: 'already' }
  ]
  useEffect(() => {
    getOrderList(activeKey)
  }, [])

  const handleTabChange = (key: string) => {
    setActiveKey(key)
    getOrderList(key)
  }
  const getOrderList = async (type:string) => {
    try {
        const res = await getMyOrderList({ gamin: type === 'padding' ? 1 : 2 }) as any
        const list = Array.isArray(res) ? res : []
        setOrderList(list)
      } catch (error) {
        console.error(error)
      }
  }
  return (
    <div>
      <HeaderNav title="Mi orden" onBack={() => goBack} />
      <Tabs onChange={handleTabChange}>
        {tabList.map(item => {
          return <Tabs.Tab title={item.title} key={item.key}>{item.title}</Tabs.Tab>
        })}
      </Tabs>
      {activeKey === 'padding' && orderList.map((item: any, index: number) => {
        return <div key={index}></div>
      })}
      {activeKey === 'already' && <></>}
    </div>
  )
}