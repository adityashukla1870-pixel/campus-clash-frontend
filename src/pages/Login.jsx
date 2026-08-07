import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import { isAuthenticated, getHomeRoute } from "../utils/auth"
import logo from "../assets/logo.png"
import { SkeletonText, SkeletonBlock } from "../components/Skeleton"
import "./Login.css"

const REMEMBER_KEY = "cc_remember_email"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || "")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY))
  const [loading, setLoading] = useState(false)
  const [initialCheck, setInitialCheck] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getHomeRoute(), { replace: true })
    }
    setInitialCheck(false)
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post("/auth/login", { email, password })
      const data = res.data
      if (data.token) {
        localStorage.setItem("token", data.token)
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, email)
        } else {
          localStorage.removeItem(REMEMBER_KEY)
        }
        navigate(getHomeRoute(), { replace: true })
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login Failed")
    } finally {
      setLoading(false)
    }
  }

  if (initialCheck) {
    return (
      <div className="login-page">
        <SkeletonBlock height={200} style={{ borderRadius: 16, maxWidth: 500, margin: '100px auto' }} />
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-top-bar" aria-hidden="true" />

      <section className="login-brand-panel">
        <div className="login-brand-radial" aria-hidden="true" />
        <div className="login-brand-glow" aria-hidden="true">
          <span style={{ top: '18%', left: '28%', animationDelay: '0s' }} />
          <span style={{ top: '62%', left: '72%', animationDelay: '1.2s' }} />
          <span style={{ top: '78%', left: '22%', animationDelay: '2.4s' }} />
          <span style={{ top: '32%', left: '82%', animationDelay: '3.6s' }} />
          <span style={{ top: '50%', left: '48%', animationDelay: '0.8s' }} />
          <span style={{ top: '12%', left: '60%', animationDelay: '1.8s' }} />
          <span style={{ top: '85%', left: '55%', animationDelay: '2.9s' }} />
        </div>
        <div className="login-brand-content reveal reveal-up animate-in">
          <img src={logo} alt="Campus Clash" className="login-brand-logo" />
          <div>
            <h2>Enter <span>The</span> Arena</h2>
            <div className="login-brand-rule" />
          </div>
        </div>
        <div className="login-status">
          <p>System Status: Optimal</p>
          <p className="accent">Network: Collegiate Grid Alpha</p>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Welcome Back,<br /><span>Competitor</span></h1>
            <p>Sign in to resume your climb to glory.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="email">Email Address</label>
              <div className="ghost-input-wrap">
                <input
                  id="email"
                  type="email"
                  className="ghost-input"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="password">Password</label>
              <div className="ghost-input-wrap">
                <input
                  id="password"
                  type="password"
                  className="ghost-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="remember-row">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device</label>
            </div>

            <button type="submit" className="login-submit-btn shimmer-wrap chamfer-sm" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            New to the arena?
            <span onClick={() => navigate("/register")}>Create an account</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
