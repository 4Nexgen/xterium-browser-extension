import { Message, userMessage } from "@/models/message.model"
import { BotMessageSquare, SendHorizonal } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

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
  const storage = new Storage()
  const url: string = "wss://sme-api.jina.bot/api/llm/connect-socket/"
  const socketRef = useRef<WebSocket | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [messageComposition, setMessageComposition] = useState("")
  const [conversation, setConversation] = useState<Message[]>([])

  useEffect(() => {
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      console.log("ws open")
    }

    socket.onmessage = (event: MessageEvent) => {
      const ai_response = JSON.parse(event.data)
      console.log("con", ai_response)

      setMessageComposition((prevComposition) => {
        const newComposition =
          prevComposition + ai_response.chat_message.content

        if (!ai_response.done) {
          return newComposition // Keep accumulating
        } else {
          // add to conversation (handle this logic as needed)
          setConversation((prevConversation) => [
            ...prevConversation,
            {
              content: newComposition,
              role: "assistant",
              created_at: "2024-12-06T07:28:13.051201"
            }
          ])

          // Clear composition
          storage.set("conversation", default_convo)
          return "" // Reset composition for a new message
        }
      })
    }

    socket.onclose = () => {
      console.log("ws close")
    }

    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error)
    }

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [url])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatMessage(e.target.value)
  }

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()

    setConversation((prevConversation) => [
      ...prevConversation,
      {
        content: chatMessage,
        role: "user",
        created_at: "2024-12-06T07:28:13.051201"
      }
    ])

    const message_object: userMessage = {
      chat_message: {
        content: chatMessage,
        role: "user",
        use_agent: false
      },
      conversation_id: "",
      user_id: "",
      virtual_assistant_id: "671b58c186045a333b74388c"
    }

    const socket = socketRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message_object))
      setChatMessage("")
    } else {
      console.error("WebSocket is not open. Unable to send message.")
    }
  }

  return (
    <div className="pt-4 flex flex-col gap-4 h-[calc(100vh-80px)]">
      <div className="flex-1 w-full">
        {conversation.length ? (
          <div>
            <ul className="flex flex-col gap-2">
              {conversation.map((item, k) => {
                return (
                  <li
                    key={`conv-item-${k}`}
                    className={`flex gap-1 py-2 ${item.role == "user" ? "self-end max-w-80" : ""}`}>
                    {item.role != "user" ? (
                      <div>
                        <BotMessageSquare className="size-6" />
                      </div>
                    ) : (
                      ""
                    )}
                    <p
                      className={`flex-1 px-4 rounded-lg ${item.role == "user" ? "justify-end bg-primary py-2" : ""}`}>
                      {item.content}
                    </p>
                  </li>
                )
              })}
              {messageComposition != "" ? (
                <li className="flex py-2 gap-1">
                  <div>
                    <BotMessageSquare className="size-6" />
                  </div>
                  <p className="flex-1 px-4 rounded-lg">{messageComposition}</p>
                </li>
              ) : (
                ""
              )}
            </ul>
          </div>
        ) : (
          <div className="h-[150px] bg-primary rounded-lg relative mb-[100px] dev-bg-image">
            <div className="absolute -bottom-[50px] left-[50%]  -translate-x-[50%] w-[100px] h-[100px] rounded-full bg-white border-primary"></div>
          </div>
        )}
      </div>
      <form
        className="bg-white p-2 rounded-lg flex gap-2"
        onSubmit={sendChatMessage}>
        <input
          type="text"
          placeholder="Type your message here..."
          className="w-full bg-white text-black outline-none"
          value={chatMessage}
          onChange={handleChange}
        />
        <button className="bg-transparent text-primary" type="submit">
          <SendHorizonal />
        </button>
      </form>
    </div>
  )
}

export default IndexImUrAi
