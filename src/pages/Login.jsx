import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Swords, Mail, Lock, Loader2 } from "lucide-react"
import API from "../api/axios"
import "./Login.css"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post("/auth/login", { email, password })
      const data = res.data
      if (data.token) {
        localStorage.setItem("token", data.token)
        const decoded = JSON.parse(atob(data.token.split(".")[1]))
        if (decoded.role === "admin") {
          navigate("/admin")
        } else {
          navigate("/tournaments")
        }
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />

      <motion.div
        className="auth-card glass-card-static accent-top-purple"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-logo">
          <div className="logo-icon-big">
            <Swords size={26} />
          </div>
          <h1>Campus <span>Clash</span></h1>
          <p>Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-divider">
          New here?
          <span onClick={() => navigate("/register")}>Create an account</span>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
