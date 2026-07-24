import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Swords, User, Mail, Lock, GraduationCap, Gamepad2, Loader2 } from "lucide-react"
import API from "../api/axios"
import "./Register.css"
import "./Login.css"

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [college, setCollege] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !college) {
      alert("Please fill all fields")
      return
    }
    setLoading(true)
    try {
      const res = await API.post("/auth/register", { name, email, password, college })
      alert(res.data.message || "Registration Successful")
      navigate("/")
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.msg || "Registration Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page register-page">
      <div className="auth-bg-glow auth-bg-glow-cyan" />

      <motion.div
        className="auth-card glass-card-static accent-top-cyan"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-logo">
          <div className="logo-icon-big logo-icon-cyan">
            <Swords size={26} />
          </div>
          <h1>Campus <span>Clash</span></h1>
          <p>Create your player account</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="field-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="Your in-game name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="field-group">
            <label>College Name</label>
            <div className="input-with-icon">
              <GraduationCap size={16} className="input-icon" />
              <input type="text" placeholder="Your college / university" value={college} onChange={(e) => setCollege(e.target.value)} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-cyan"
            disabled={!name || !email || !password || !college || loading}
            style={{ width: "100%" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Creating account...
              </>
            ) : (
              <>
                <Gamepad2 size={18} />
                Join The Arena
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          Already a player?
          <span onClick={() => navigate("/login")}>Sign in</span>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
