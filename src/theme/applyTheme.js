export const KNOWN_THEMES = ["cyber-boy", "cyber-girl"]

export function applyTheme(themeId) {
  if (themeId && KNOWN_THEMES.includes(themeId)) {
    document.documentElement.setAttribute("data-theme", themeId)
  } else {
    document.documentElement.removeAttribute("data-theme")
  }
}
