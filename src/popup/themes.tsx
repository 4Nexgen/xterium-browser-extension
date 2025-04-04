import { ThemeProvider } from "@/components/theme-provider"
import React from "react"

const Themes = ({ children }) => {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </>
  )
}

export default Themes
