import { UserService } from "@/services/user.service"
import * as React from "react"
import { useEffect, useState } from "react"

import IndexApplication from "./application"
import IndexCreatePassword from "./create-password"
import IndexLogin from "./login"

const IndexPages = () => {
  const userService = new UserService()
  const [currentPage, setCurrentPage] = useState<string>("create-password")

  useEffect(() => {
    userService.isUserExists().then((isExisted) => {
      if (isExisted == true) {
        const currentTime = new Date().getTime()
        userService
          .getLastAccessTime()
          .then((lastAccessTime) => {
            if (lastAccessTime != null) {
              if (!lastAccessTime || currentTime - parseInt(lastAccessTime) > 120000) {
                setCurrentPage("login")
              } else {
                setCurrentPage("application")
              }
            } else {
              setCurrentPage("login")
            }
          })
          .catch((error) => {
            setCurrentPage("login")
          })
      } else {
        setCurrentPage("create-password")
      }
    })
  }, [])

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page)

    if (page === "application") {
      let lastAccessTime = new Date().getTime().toString()
      userService.setLastAccessTime(lastAccessTime)
    }
  }

  return (
    <>
      {currentPage === "create-password" && (
        <IndexCreatePassword onSetCurrentPage={handleSetCurrentPage} />
      )}
      {currentPage === "login" && <IndexLogin onSetCurrentPage={handleSetCurrentPage} />}
      {currentPage === "application" && <IndexApplication />}
    </>
  )
}

export default IndexPages
