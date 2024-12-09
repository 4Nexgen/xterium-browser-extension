import * as React from "react"
import { useState, useEffect } from "react"
import IndexCreatePassword from "./create-password"
import IndexLogin from "./login"
import IndexApplication from "./application"

const IndexPages = () => {
  const [currentPage, setCurrentPage] = useState<string>("create-password")

  useEffect(() => {
    const encryptedPassword = localStorage.getItem("userPassword")
    const lastAccessTime = localStorage.getItem("lastAccessTime")
    const currentTime = new Date().getTime()

    if (encryptedPassword) {
      if (lastAccessTime && currentTime - parseInt(lastAccessTime) > 120000) {
        setCurrentPage("login")
      } else {
        setCurrentPage("application") 
      }
    } else {
      setCurrentPage("create-password") 
    }
  }, [])

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page)

    if (page === "application") {
      localStorage.setItem("lastAccessTime", new Date().getTime().toString())
    }
  }

  return (
    <div>
      {currentPage === "create-password" && (
        <IndexCreatePassword onSetCurrentPage={handleSetCurrentPage} />
      )}
      {currentPage === "login" && <IndexLogin onSetCurrentPage={handleSetCurrentPage} />}
      {currentPage === "application" && (
        <IndexApplication/>
      )}
    </div>
  )
}

export default IndexPages
