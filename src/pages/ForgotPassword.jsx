import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import logo from "../assets/logo.png"
import "./Login.css"

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post("/auth/forgot-password", { email })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="login-page">
        <div className="login-top-bar" aria-hidden="true" />
        <section className="login-brand-panel">
          <div className="login-brand-radial" aria-hidden="true" />
          <div className="login-brand-content reveal reveal-up animate-in">
            <img src={logo} alt="Campus Clash" className="login-brand-logo" />
            <div>
              <h2>Enter <span>The</span> Arena</h2>
              <div className="login-brand-rule" />
            </div>
          </div>
        </section>
        <section className="login-form-panel">
          <div className="auth-card">
            <div className="auth-logo">
              <h1>Check <span>Your</span> Email</h1>
              <p>If an account with that email exists, we've sent a password reset link. Check your inbox and follow the instructions.</p>
            </div>
            <button className="login-submit-btn shimmer-wrap chamfer-sm" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        </section>
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
      </section>

      <section className="login-form-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>Reset <span>Password</span></h1>
            <p>Enter your email and we'll send you a reset link.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
                  required
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <button type="submit" className="login-submit-btn shimmer-wrap chamfer-sm" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="auth-divider">
            Remember your password?
            <span onClick={() => navigate("/login")}>Back to Login</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ForgotPassword
