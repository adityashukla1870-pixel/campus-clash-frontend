import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Swords, Trophy, Gamepad2, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react"
import "./Navbar.css"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("token")
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
    setMobileOpen(false)
  }

  const go = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner">
        <div className="logo" onClick={() => go(token ? "/tournaments" : "/")}>
          <div className="logo-icon">
            <Swords size={18} />
          </div>
          <span className="logo-text">
            Campus <span className="logo-accent">Clash</span>
          </span>
        </div>

        <div className="nav-links desktop-only">
          {token ? (
            <>
              <button
                className={`nav-link${isActive("/tournaments") ? " active" : ""}`}
                onClick={() => go("/tournaments")}
              >
                <Trophy size={15} />
                Tournaments
              </button>
              <button
                className={`nav-link${isActive("/my-tournaments") ? " active" : ""}`}
                onClick={() => go("/my-tournaments")}
              >
                <Gamepad2 size={15} />
                My Matches
              </button>
              <button className="nav-btn-ghost" onClick={handleLogout}>
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn-ghost" onClick={() => go("/login")}>
                <LogIn size={15} />
                Login
              </button>
              <button className="nav-btn" onClick={() => go("/register")}>
                <UserPlus size={15} />
                Join Arena
              </button>
            </>
          )}
        </div>

        <button className="mobile-toggle mobile-only" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu mobile-only"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {token ? (
              <>
                <button className={`nav-link${isActive("/tournaments") ? " active" : ""}`} onClick={() => go("/tournaments")}>
                  <Trophy size={15} /> Tournaments
                </button>
                <button className={`nav-link${isActive("/my-tournaments") ? " active" : ""}`} onClick={() => go("/my-tournaments")}>
                  <Gamepad2 size={15} /> My Matches
                </button>
                <button className="nav-btn-ghost" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn-ghost" onClick={() => go("/login")}>
                  <LogIn size={15} /> Login
                </button>
                <button className="nav-btn" onClick={() => go("/register")}>
                  <UserPlus size={15} /> Join Arena
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
