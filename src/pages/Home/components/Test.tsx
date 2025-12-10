import { Button } from "antd-mobile"
import type { ReactElement } from "react"
import {useHomeContext} from "../Home"
type Props = {
  text: string
  onGetSonSendParams: (params: string) => void
}

export default function Test({ text, onGetSonSendParams }: Props): ReactElement {
  const { homeData } = useHomeContext()
  const sendParams = () => {
    onGetSonSendParams('我是子组件传递的参数')
  }
  return (
    <>
      <span>父组件props传递的参数:<br></br>{text}</span>
      <Button color="success" block onClick={sendParams}>向父组件传递参数</Button>
      <div>首页数据: {JSON.stringify(homeData)}</div>
    </>
  )
}
