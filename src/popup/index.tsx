import IndexPages from "@/pages/index"
import { createRoot } from "react-dom/client"
import IndexBalance from "@/pages/application/balance"

import "../global.css"

import Themes from "@/popup/themes"
import React from "react"

const IndexPopup = () => {
  return (
    <>
      <Themes>
        <IndexPages />
      </Themes>
    </>
  )
}

export default IndexPopup

// const root = createRoot(document.getElementById("root"))
// root.render(<IndexPopup />)
