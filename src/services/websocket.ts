import { userMessage } from "@/models/message.model"

const url: string = "wss://sme-api.jina.bot/api/llm/connect-socket/"
let socket: WebSocket | null = null

export function connectWS(): void {
  socket = new WebSocket(url)

  socket.onopen = () => {
    console.log("ws open")
  }

  socket.onmessage = (event: MessageEvent) => {
    console.log("message received", event.data)
    //   const publicStore = usePublicStore()
    //   publicStore.preProcessWSMessage(event.data)
  }

  socket.onclose = () => {
    console.log("ws close")
  }

  socket.onerror = (error: Event) => {
    console.error("WebSocket error:", error)
  }
}

export function sendMessage(message: userMessage): void {
  console.log("test send message", message)
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  } else {
    console.error("WebSocket is not open. Unable to send message.")
  }
}
