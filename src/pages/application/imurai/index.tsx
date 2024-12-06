import { Message } from "@/models/message.model"
import { SendHorizonal } from "lucide-react"
import React from "react"

import { Storage } from "@plasmohq/storage"

import Conversation from "./conversation"

const storage = new Storage()
const default_convo: Message[] = [
  {
    id: "6752a78d55d61b3701719712",
    user_id: "user_id",
    conversation_id: "6752a78855d61b3701719711",
    content: "hello",
    role: "user",
    created_at: "2024-12-06T07:28:13.051201"
  },
  {
    id: "6752a78d55d61b3701719712",
    user_id: "user_id",
    conversation_id: "6752a78855d61b3701719711",
    content:
      'Agent is attempting to call \'general_knowledge\' function with arguments: {"virtual_assistant_id":"671b58c186045a333b74388c"} ..',
    role: "agent",
    created_at: "2024-12-06T07:28:13.051201"
  },
  {
    id: "6752a78d55d61b3701719712",
    user_id: "user_id",
    conversation_id: "6752a78855d61b3701719711",
    content:
      "Hello! It's nice to meet you. My name is JINA, and I'm a friendly AI assistant here to help answer your questions and provide information on various topics, including business registration in the Philippines. How can I assist you today?",
    role: "assistant",
    created_at: "2024-12-06T07:28:13.051201"
  }
]
storage.set("conversation", default_convo)

const IndexImUrAi = () => {
  return (
    <div className="pt-4 flex flex-col gap-4 h-[calc(100vh-80px)]">
      <Conversation />
      <form className="bg-white p-2 rounded-lg flex gap-2">
        <input
          type="text"
          placeholder="Type your message here..."
          className="w-full bg-white text-black outline-none"
        />
        <button className="bg-transparent text-primary" type="submit">
          <SendHorizonal />
        </button>
      </form>
    </div>
  )
}

export default IndexImUrAi
