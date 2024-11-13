import ApplicationSidebar from "@/components/application-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React from "react"

const Layout = ({ children, onSetCurrentPage }) => {
  const handleSetCurrentPage = (currentPage: string) => {
    onSetCurrentPage(currentPage)
  }

  return (
    <>
      <SidebarProvider>
        <ApplicationSidebar onSetCurrentPage={handleSetCurrentPage} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  )
}

export default Layout
