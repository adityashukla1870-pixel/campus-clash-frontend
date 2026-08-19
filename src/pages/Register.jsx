import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FiUser, FiMail, FiBookOpen, FiLock, FiShield, FiHash, FiAtSign } from "react-icons/fi"
import API from "../api/axios"
import { isAuthenticated, getHomeRoute } from "../utils/auth"
import logo from "../assets/logo.png"
import { SkeletonBlock } from "../components/Skeleton"
import GoogleSignIn from "../components/GoogleSignIn"
import "./Login.css"
import "./Register.css"

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [college, setCollege] = useState("")
  const [gameUid, setGameUid] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialCheck, setInitialCheck] = useState(true)
  const usernameTimer = useRef(null)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(getHomeRoute(), { replace: true })
    }
    setInitialCheck(false)
  }, [navigate])

  const checkUsername = useCallback((value) => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    const trimmed = value.trim().toLowerCase()
    if (!trimmed || trimmed.length < 3) {
      setUsernameStatus(null)
      return
    }
    if (!/^[a-z0-9._-]{3,20}$/.test(trimmed)) {
      setUsernameStatus({ available: false, error: "3-20 chars, lowercase letters, numbers, dots, hyphens, underscores" })
      return
    }
    setUsernameStatus({ checking: true })
    usernameTimer.current = setTimeout(() => {
      API.get(`/auth/check-username/${trimmed}`)
        .then(res => setUsernameStatus(res.data))
        .catch(() => setUsernameStatus({ available: false, error: "Could not check availability" }))
    }, 400)
  }, [])

  const handleUsernameChange = (e) => {
    const val = e.target.value.toLowerCase()
    setUsername(val)
    checkUsername(val)
  }

  const passwordsMatch = !confirmPassword || password === confirmPassword
  const usernameAvailable = usernameStatus?.available === true
  const canSubmit = name && email && college && gameUid && password && confirmPassword && passwordsMatch && agreed && usernameAvailable

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !college || !gameUid || !username) {
      alert("Please fill all fields")
      return
    }
    if (!usernameAvailable) {
      alert("Please choose an available username")
      return
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    if (!agreed) {
      alert("Please agree to the tournament rules to continue")
      return
    }
    setLoading(true)
    try {
      const res = await API.post("/auth/register", { name, email, password, college, game_uid: gameUid, username })
      alert(res.data.message || "Registration Successful")
      navigate("/login")
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.msg || "Registration Failed")
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
            <h2>Claim <span>Your</span> Legacy</h2>
            <div className="login-brand-rule" />
          </div>
          <p className="login-brand-sub">
            Join the elite ranks of collegiate esports. Forge your path in the
            arena where legends are born.
          </p>
        </div>
        <div className="login-status">
          <p>System Status: Optimal</p>
          <p className="accent">Network: Collegiate Grid Alpha</p>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="auth-card register-card">
          <div className="auth-logo">
            <h1>Create Your <span>Profile</span></h1>
            <p>Fill in the scrolls to begin your journey.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="reg-name">Full Name</label>
              <div className="ghost-input-wrap icon-input">
                <FiUser className="ghost-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="ghost-input"
                  placeholder="e.g. Alex Ironside"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="reg-username">Username</label>
              <div className="ghost-input-wrap icon-input">
                <FiAtSign className="ghost-input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  className="ghost-input"
                  placeholder="unique handle (e.g. alex123)"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="off"
                />
                <span className="ghost-input-underline" />
              </div>
              {usernameStatus?.checking && <p className="field-hint" style={{ color: 'var(--text-muted, #888)', fontSize: 12, marginTop: 4 }}>Checking...</p>}
              {usernameStatus?.available === true && <p className="field-hint" style={{ color: '#4ade80', fontSize: 12, marginTop: 4 }}>Available!</p>}
              {usernameStatus?.available === false && <p className="field-error" style={{ fontSize: 12, marginTop: 4 }}>{usernameStatus.error || "Username taken"}</p>}
            </div>

            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="reg-email">Email Address</label>
              <div className="ghost-input-wrap icon-input">
                <FiMail className="ghost-input-icon" />
                <input
                  id="reg-email"
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
              <label className="uppercase-label" htmlFor="reg-college">College / Institution</label>
              <div className="ghost-input-wrap icon-input">
                <FiBookOpen className="ghost-input-icon" />
                <input
                  id="reg-college"
                  type="text"
                  className="ghost-input"
                  placeholder="Your college or university"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="field-group-ghost">
              <label className="uppercase-label" htmlFor="reg-gameuid">Game UID</label>
              <div className="ghost-input-wrap icon-input">
                <FiHash className="ghost-input-icon" />
                <input
                  id="reg-gameuid"
                  type="text"
                  className="ghost-input"
                  placeholder="Your in-game ID (BGMI/Free Fire/etc.)"
                  value={gameUid}
                  onChange={(e) => setGameUid(e.target.value)}
                />
                <span className="ghost-input-underline" />
              </div>
            </div>

            <div className="register-password-grid">
              <div className="field-group-ghost">
                <label className="uppercase-label" htmlFor="reg-password">Password</label>
                <div className="ghost-input-wrap icon-input">
                  <FiLock className="ghost-input-icon" />
                  <input
                    id="reg-password"
                    type="password"
                    className="ghost-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="ghost-input-underline" />
                </div>
              </div>
              <div className="field-group-ghost">
                <label className="uppercase-label" htmlFor="reg-confirm">Confirm</label>
                <div className={`ghost-input-wrap icon-input${!passwordsMatch ? ' has-error' : ''}`}>
                  <FiShield className="ghost-input-icon" />
                  <input
                    id="reg-confirm"
                    type="password"
                    className="ghost-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="ghost-input-underline" />
                </div>
              </div>
            </div>
            {!passwordsMatch && <p className="field-error">Passwords don't match yet.</p>}

            <div className="remember-row terms-row">
              <input
                id="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the tournament rules and fair-play policy of Campus Clash.
              </label>
            </div>

            <button type="submit" className="login-submit-btn shimmer-wrap chamfer-sm" disabled={!canSubmit || loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider-row">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">OR</span>
            <span className="auth-divider-line" />
          </div>

          <GoogleSignIn />

          <div className="auth-divider">
            Already have an account?
            <span onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Register
