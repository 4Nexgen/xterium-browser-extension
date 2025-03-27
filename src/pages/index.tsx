import { UserService } from "@/services/user.service"
import * as React from "react"
import { useEffect, useMemo, useState } from "react"

import IndexApplication from "./application"
import IndexCreatePassword from "./create-password"
import IndexLogin from "./login"

const IndexPages = () => {
  const userService = useMemo(() => new UserService(), [])
  const [currentPage, setCurrentPage] = useState<string>("create-password")

  useEffect(() => {
    initiateAccess()
  }, [])

  const initiateAccess = async () => {
    const currentTime = new Date().getTime()

    const isUserExists = await userService.isUserExists()
    if (isUserExists) {
      const accessTime = await userService.getAccessTime()
      if (accessTime !== "") {
        if (!accessTime || currentTime - parseInt(accessTime) > 1800000) {
          setCurrentPage("login")
        } else {
          setCurrentPage("application")
        }
      } else {
        setCurrentPage("login")
      }
    } else {
      setCurrentPage("create-password")
    }
  }

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page)

    if (page === "application") {
      let lastAccessTime = new Date().getTime().toString()
      userService.setAccessTime(lastAccessTime)
    }
  }

  return (
    <>
      {currentPage === "create-password" && (
        <IndexCreatePassword handleSetCurrentPage={handleSetCurrentPage} />
      )}
      {currentPage === "login" && (
        <IndexLogin handleSetCurrentPage={handleSetCurrentPage} />
      )}
      {currentPage === "application" && <IndexApplication />}
    </>
  )
}

export default IndexPages
