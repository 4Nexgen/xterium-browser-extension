import * as React from "react"
import IndexCreatePassword from "./create-password"
// import IndexLogin from "./login"
import IndexApplication from "./application"
 
const IndexPages = () => {
  return (
    <>
      <IndexApplication />
    </>
  )
}
 
export default IndexPages
 

//PLEASE DO NOT DELETE 
//FUNCTION of the create-password and the login 
// import * as React from "react"
// import { useState, useEffect } from "react"
// import IndexCreatePassword from "./create-password"
// import IndexLogin from "./login"
// import IndexApplication from "./application"

// const IndexPages = () => {
//   const [currentPage, setCurrentPage] = useState<string>("create-password") 

//   useEffect(() => {
//     const encryptedPassword = localStorage.getItem("userPassword")
//     if (encryptedPassword) {
//       setCurrentPage("login")
//     }
//   }, []) 
//   const handleSetCurrentPage = (page: string) => {
//     setCurrentPage(page)
//   }

//   return (
//     <div>
//       {currentPage === "create-password" && (
//         <IndexCreatePassword onSetCurrentPage={handleSetCurrentPage} />
//       )}
//       {currentPage === "login" && <IndexLogin onSetCurrentPage={handleSetCurrentPage} />}
//       {currentPage === "application" && (
//         <IndexApplication onSetCurrentPage={handleSetCurrentPage} />
//       )}
//     </div>
//   )
// }

// export default IndexPages
