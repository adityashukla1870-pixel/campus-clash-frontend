import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import { isAuthenticated, getHomeRoute } from "../utils/auth"
import "./Login.css"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // If already logged in (e.g. user hit the browser back button to get here),
  // bounce straight to where they belong instead of showing the login form.
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getHomeRoute(), { replace: true })
    }
  }, [navigate])


  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post("/auth/login", { email, password })
      const data = res.data
      if (data.token) {
        localStorage.setItem("token", data.token)
        navigate("/tournaments", { replace: true })
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-big">⚔️</div>
          <h1>Campus <span>Clash</span></h1>
          <p>Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@college.edu"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          New here?
          <span onClick={() => navigate("/register")}>Create an account</span>
        </div>
      </div>
    </div>
  )
}

export default Login
