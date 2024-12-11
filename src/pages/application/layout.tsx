import ApplicationSidebar from "@/components/application-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { UserService } from "@/services/user.service"

const Layout = ({ children, onSetCurrentPage }) => {
  const userService = new UserService()

  const handleSetCurrentPage = (currentPage: string) => {
    onSetCurrentPage(currentPage)
  }

  const handleSetIsLogout = () => {
    userService.logout()

    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <>
      <SidebarProvider>
        <ApplicationSidebar
          onSetCurrentPage={handleSetCurrentPage}
          onSetIsLogout={handleSetIsLogout}
        />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>

      <Toaster />
    </>
  )
}

export default Layout
