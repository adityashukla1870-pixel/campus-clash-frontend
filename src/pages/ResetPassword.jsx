import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import API from "../api/axios"
import logo from "../assets/logo.png"
import "./Login.css"

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!token) {
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
              <h1>Invalid <span>Link</span></h1>
              <p>This password reset link is invalid or missing a token.</p>
            </div>
            <button className="login-submit-btn shimmer-wrap chamfer-sm" onClick={() => navigate("/forgot-password")}>
              Request a New Link
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (success) {
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
              <h1>Password <span>Reset</span></h1>
              <p>Your password has been updated. You can now log in with your new password.</p>
            </div>
            <button className="login-submit-btn shimmer-wrap chamfer-sm" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </section>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    try {
      await API.post("/auth/reset-password", { token, password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password")
    } finally {
      setLoading(false)
    }
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
            <h1>New <span>Password</span></h1>
            <p>Choose a strong password for your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="password">New Password</label>
              <div className="ghost-input-wrap">
                <input
                  id="password"
                  type="password"
                  className="ghost-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="confirm">Confirm Password</label>
              <div className="ghost-input-wrap">
                <input
                  id="confirm"
                  type="password"
                  className="ghost-input"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>
            )}

            <button type="submit" className="login-submit-btn shimmer-wrap chamfer-sm" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="auth-divider">
            Back to
            <span onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ResetPassword
