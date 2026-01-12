import { useState, useEffect } from 'react'
import { Popup, IndexBar, List, Loading, NavBar } from 'antd-mobile'
import { getBankList } from '@/services/api/apply'

export interface BankItem {
  name: string
  code: string
}

 interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (bank: BankItem) => void
}

export default function BankListPopup({ visible, onClose, onSelect }: Props) {
  const [loading, setLoading] = useState(false)
  const [bankMap, setBankMap] = useState<Record<string, BankItem[]>>({})
  const [indexList, setIndexList] = useState<string[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (visible && !hasLoaded) {
      fetchData()
    }
  }, [visible])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getBankList({}) as any
      // 处理响应结构: { booky: [...] }
      // 或者如果 getBankList 直接返回解码后的对象
      let rawList: any[] = []
      if (res && Array.isArray(res.booky)) {
        rawList = res.booky
      } else if (Array.isArray(res)) {
        rawList = res
      } else if (res && Array.isArray(res.list)) {
        rawList = res.list
      }

      const map: Record<string, BankItem[]> = {}
      
      rawList.forEach((item: any) => {
        // Vue: 使用 'saturday' 作为键（索引字母）
        const key = item.saturday || '#'
        if (!map[key]) map[key] = []
        map[key].push({
          name: item.frau, // Vue: frau 是名称
          code: item.manned // Vue: manned 是代码
        })
      })

      // 排序键
      const keys = Object.keys(map).sort()
      
      // 如果 'Banco Popular' 存在，将其移至顶部
      if (keys.includes('Banco Popular')) {
        const idx = keys.indexOf('Banco Popular')
        keys.splice(idx, 1)
        keys.unshift('Banco Popular')
      }

      setIndexList(keys)
      setBankMap(map)
      setHasLoaded(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="right"
      bodyStyle={{ width: '100vw', display: 'flex', flexDirection: 'column', background: '#fff' }}
    >
      <NavBar onBack={onClose} style={{ borderBottom: '1px solid #f5f5f5' }}>Seleccionar banco</NavBar>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <Loading />
          </div>
        ) : (
          <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>
             <IndexBar sticky={false}>
               {indexList.map(group => (
                 <IndexBar.Panel
                   index={group}
                   title={group === 'Banco Popular' ? 'Banco Popular' : group}
                   key={group}
                 >
                   <List>
                     {bankMap[group].map(bank => (
                       <List.Item 
                         key={bank.code} 
                         onClick={() => {
                           onSelect(bank)
                           onClose()
                         }}
                         arrow={false}
                       >
                         {bank.name}
                       </List.Item>
                     ))}
                   </List>
                 </IndexBar.Panel>
               ))}
             </IndexBar>
          </div>
        )}
      </div>
    </Popup>
  )
}
