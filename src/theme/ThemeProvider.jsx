import { useEffect } from "react"
import API from "../api/axios"
import { isAuthenticated } from "../utils/auth"
import { applyTheme } from "./applyTheme"

function ThemeProvider({ children }) {
  useEffect(() => {
    if (!isAuthenticated()) return
    API.get("/auth/profile")
      .then((res) => applyTheme(res.data?.themeId))
      .catch(() => applyTheme(null))
  }, [])

  return children
}

export default ThemeProvider
