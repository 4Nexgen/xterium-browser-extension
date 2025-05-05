type MessageBoxHandler = {
  show: (message: string) => void
  close: () => void
}

let handler: MessageBoxHandler | null = null

export const MessageBoxController = {
  register(newHandler: MessageBoxHandler) {
    handler = newHandler
  },
  show(message: string) {
    handler?.show(message)
  },
  close() {
    handler?.close()
  }
}
