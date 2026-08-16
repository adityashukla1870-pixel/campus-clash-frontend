import { useEffect } from "react"
import { applyTheme } from "./applyTheme"
import { resolveThemeId } from "../data/avatarRepository"

function ThemeProvider({ children }) {
  useEffect(() => {
    // Resolve theme from the user's selected avatar (localStorage)
    applyTheme(resolveThemeId())

    // Re-evaluate whenever avatar selection changes (custom event from Profile)
    const onAvatarChange = (e) => {
      applyTheme(e.detail?.themeId || null)
    }
    window.addEventListener("avatar-theme-changed", onAvatarChange)
    return () => window.removeEventListener("avatar-theme-changed", onAvatarChange)
  }, [])

  return children
}

export default ThemeProvider
