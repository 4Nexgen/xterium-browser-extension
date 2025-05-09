"use client"

import Header from "@/components/header"
import MessageBox from "@/components/message-box"
import { Toaster } from "@/components/ui/toaster"
import XteriumLogo from "data-base64:/assets/app-logo/xterium-logo.png"

const Layout = ({ children, headerVariant }) => {
  return (
    <>
      <main>
        <div className="flex flex-col h-screen justify-between background-theme">
          <Header variant={headerVariant} />

          <div className="flex justify-center pt-13">
            <img src={XteriumLogo} className="w-80 mb-4" alt="Xterium Logo" />
          </div>

          <div className="flex flex-1 justify-center items-center w-full h-full background-box pt-8 flex-col items-center">
            <div className="w-full lg:w-[32rem]">
              <div className="p-6 w-full h-[290px] flex flex-col justify-center">
                {children}
              </div>
            </div>
          </div>
        </div>

        <Toaster />
        <MessageBox />
      </main>
    </>
  )
}

export default Layout
