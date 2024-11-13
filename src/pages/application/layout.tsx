import ApplicationSidebar from "@/components/application-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React from "react"

const Layout = ({ children }) => {
  return (
    <>
      <SidebarProvider>
        <ApplicationSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default Layout
