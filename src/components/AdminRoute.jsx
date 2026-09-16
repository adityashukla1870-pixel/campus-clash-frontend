import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

function AdminRoute({ children }) {

  const token = localStorage.getItem("token")

  let redirectTo = null
  if (!token) {
    redirectTo = "/"
  } else {
    try {
      const decoded = jwtDecode(token)
      if (decoded.role !== "admin") redirectTo = "/tournaments"
    } catch {
      redirectTo = "/"
    }
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} />
  }

  return children
}

export default AdminRoute
