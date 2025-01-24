export interface Message {
  content: string
  role: string
  created_at: string
}

export interface userChatMessage {
  content: string
  role: string
  use_agent: boolean
}

export interface userMessage {
  chat_message: userChatMessage
  conversation_id: string
  user_id: string
  virtual_assistant_id: string
}
