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

// Where an already-logged-in user should land, based on their role
export function getHomeRoute() {
  return getRole() === "admin" ? "/admin" : "/tournaments"
}
