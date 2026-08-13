import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FiHome, FiGrid, FiAward, FiTrendingUp, FiMessageCircle, FiUser,
  FiShield, FiLogOut, FiLogIn, FiUserPlus
} from "react-icons/fi"
import NotificationBell from "./NotificationBell"
import { getRole } from "../utils/auth"
import logo from "../assets/logo.png"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("token")
  const role = getRole()

  // Push page content out of the sidebar's way (see body.has-sidebar in index.css)
  useEffect(() => {
    document.body.classList.add("has-sidebar")
    return () => document.body.classList.remove("has-sidebar")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link"

  return (
    <>
      {token && (
        <div className="mobile-topbar">
          <div className="mobile-topbar-left" onClick={() => navigate("/profile")}>
            <FiUser size={18} />
          </div>
          <div className="mobile-topbar-right">
            <NotificationBell />
            <div className="mobile-exit-btn" onClick={handleLogout}>
              <FiLogOut size={16} />
            </div>
          </div>
        </div>
      )}
      {token && (
        <div className="desktop-topbar-right" onClick={() => navigate("/profile")} title="Profile">
          <FiUser size={18} />
        </div>
      )}
      <div className="sidebar">
      <div
        className="logo"
        onClick={() => { token ? navigate("/dashboard") : navigate("/") }}
      >
        <img src={logo} alt="" className="logo-icon" />
        <span className="logo-text">Campus <span className="logo-text-clash">Clash</span></span>
      </div>

      <div className="nav-links">
        {token && <span className="nav-section-label">Menu</span>}
        {token ? (
          <>
            <span className={isActive("/dashboard")} onClick={() => navigate("/dashboard")}>
              <FiHome size={18} /><span className="nav-label">Dashboard</span>
            </span>
            <span className={isActive("/community")} onClick={() => navigate("/community")}>
              <FiMessageCircle size={18} /><span className="nav-label">Community</span>
            </span>
            <span className={isActive("/tournaments")} onClick={() => navigate("/tournaments")}>
              <FiGrid size={18} /><span className="nav-label">Tournaments</span>
            </span>
            <span className={isActive("/my-tournaments")} onClick={() => navigate("/my-tournaments")}>
              <FiAward size={18} /><span className="nav-label">My Matches</span>
            </span>
            <span className={isActive("/leaderboard")} onClick={() => navigate("/leaderboard")}>
              <FiTrendingUp size={18} /><span className="nav-label">Leaderboard</span>
            </span>

            {role === "admin" && (
              <>
                <span className="nav-section-label">Account</span>
                <span className={`${isActive("/admin")} nav-link-admin`} onClick={() => navigate("/admin")}>
                  <FiShield size={18} /><span className="nav-label">Admin Panel</span>
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <span className="nav-link" onClick={() => navigate("/login")}>
              <FiLogIn size={18} /><span className="nav-label">Login</span>
            </span>
            <span className="nav-link" onClick={() => navigate("/register")}>
              <FiUserPlus size={18} /><span className="nav-label">Join Arena</span>
            </span>
          </>
        )}
      </div>

      {token && (
        <div className="sidebar-footer">
          <NotificationBell className="sidebar-notif" />
          <span className="nav-link nav-link-danger" onClick={handleLogout}>
            <FiLogOut size={18} /><span className="nav-label">Logout</span>
          </span>
        </div>
      )}
    </div>
    </>
  )
}

export default Navbar
