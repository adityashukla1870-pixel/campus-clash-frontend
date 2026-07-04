import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
    <div className="register-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-big">⚔️</div>
          <h1>Campus <span>Clash</span></h1>
          <p>Create your player account</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="field-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your in-game name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="field-group">
            <label>College Name</label>
            <input type="text" placeholder="Your college / university" value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!name || !email || !password || !college || loading}
          >
            {loading ? "Creating account..." : "🎮 Join The Arena"}
          </button>
        </form>

        <div className="auth-divider">
          Already a player?
          <span onClick={() => navigate("/login")}>Sign in</span>
        </div>
      </div>
    </div>
  )
}

export default Register
