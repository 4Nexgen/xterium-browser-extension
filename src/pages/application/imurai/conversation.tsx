import { Message } from "@/models/message.model"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

export default function Conversation() {
  const storage = new Storage()
  const [conversation, setConversation] = useState<Message[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await storage.get("conversation") // "value"
      console.log("test", data)
      if (typeof data !== undefined) {
        setConversation(data as unknown as Message[])
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex-1">
      <div className="h-[150px] bg-primary rounded-lg relative mb-[100px] dev-bg-image">
        <div className="absolute -bottom-[50px] left-[50%]  -translate-x-[50%] w-[100px] h-[100px] rounded-full bg-white border-primary"></div>
      </div>
    </div>
  )
}
