export function getToken() {
  return localStorage.getItem("token")
}

export function isAuthenticated() {
  return !!getToken()
}

export function getRole() {
  const token = getToken()
  if (!token) return null
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]))
    return decoded.role || null
  } catch {
    return null
  }
}

// Where a logged-in user should land after login/redirect.
// Admins get the same dashboard as everyone else — they can jump into
// the Admin Panel separately via the navbar link.
export function getHomeRoute() {
  return "/dashboard"
}
