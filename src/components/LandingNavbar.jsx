import { useNavigate } from "react-router-dom"
import { FiArrowRight } from "react-icons/fi"
import logo from "../assets/logo.png"
import "./LandingNavbar.css"

function LandingNavbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <div className="landing-nav-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Campus Clash" />
          <span>Campus <span className="accent">Clash</span></span>
        </div>

        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>

        <div className="landing-nav-actions">
          {token ? (
            <button className="landing-nav-btn chamfer-sm shimmer-wrap" onClick={() => navigate("/dashboard")}>
              Go to Dashboard <FiArrowRight size={15} />
            </button>
          ) : (
            <>
              <button className="landing-nav-login" onClick={() => navigate("/login")}>Login</button>
              <button className="landing-nav-btn chamfer-sm shimmer-wrap" onClick={() => navigate("/register")}>
                Join Arena <FiArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default LandingNavbar
