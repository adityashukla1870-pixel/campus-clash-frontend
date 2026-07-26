import { useNavigate, useLocation } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import { getRole } from "../utils/auth"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("token")
  const role = getRole()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link"

  return (
    <div className="navbar">
      <div
        className="logo"
        onClick={() => { token ? navigate("/tournaments") : navigate("/") }}
      >
        <img src="/favicon.svg" alt="" className="logo-icon" />
        Campus <span className="logo-text-clash">Clash</span>
      </div>

      <div className="nav-links">
        {token ? (
          <>
            <span className={isActive("/tournaments")} onClick={() => navigate("/tournaments")}>
              Tournaments
            </span>
            <span className={isActive("/my-tournaments")} onClick={() => navigate("/my-tournaments")}>
              My Matches
            </span>
            <span className={isActive("/leaderboard")} onClick={() => navigate("/leaderboard")}>
              Leaderboard
            </span>
            <span className={isActive("/community")} onClick={() => navigate("/community")}>
              💬 Community
            </span>
            <span className={isActive("/profile")} onClick={() => navigate("/profile")}>
              Profile
            </span>
            {role === "admin" && (
              <span className={isActive("/admin")} onClick={() => navigate("/admin")} style={{color:'var(--gold)'}}>
                🛡️ Admin Panel
              </span>
            )}
            <NotificationBell />
            <span className="nav-btn-ghost" onClick={handleLogout}>
              Logout
            </span>
          </>
        ) : (
          <>
            <span className="nav-btn-ghost" onClick={() => navigate("/login")}>
              Login
            </span>
            <span className="nav-btn" onClick={() => navigate("/register")}>
              Join Arena
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar
