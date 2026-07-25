import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

function AdminRoute({ children }) {

  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/" />
  }

  try {
    const decoded = jwtDecode(token)
    if (decoded.role !== "admin") {
      return <Navigate to="/tournaments" />
    }
  } catch {
    return <Navigate to="/" />
  }

  return children
}

export default AdminRoute
