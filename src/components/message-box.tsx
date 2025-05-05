import { MessageBoxController } from "@/controllers/message-box-controller"
import { useEffect, useState } from "react"

export default function MessageBox() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    MessageBoxController.register({ show, close })
  }, [])

  const show = (msg: string) => {
    setMessage(msg)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setMessage(null)
  }

  return open ? (
    <div className="fixed top-0 left-0 w-screen h-screen z-10 text-black">
      <div className="text-md w-[350px] max-h-[150px] flex items-center justify-center rounded-lg bg-[#ffffffd6] backdrop-blur-lg left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] fixed flex flex-col items-center justify-center">
        <p className="py-4 px-12 text-[16px] text-center">{message}</p>
        <div className="w-full border-t border-[#d0d0d0] py-4 px-8">
          <button
            className="w-full uppercase text-blue-500 text-[14px]"
            onClick={() => close()}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null
}
