import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  CreditCard,
  Radio,
  Trophy,
  Medal,
  ArrowLeft,
  Swords,
} from "lucide-react"
import "./AdminLayout.css"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: Radio, label: "Release Room", path: "/admin/release-room" },
  { icon: Trophy, label: "Create Tournament", path: "/admin/create-tournament" },
  { icon: Medal, label: "Declare Winner", path: "/admin/winner" },
]

function AdminLayout({ children, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header" onClick={() => navigate("/admin")}>
          <div className="admin-logo-icon">
            <Swords size={20} />
          </div>
          <div>
            <div className="admin-logo-text">Campus Clash</div>
            <div className="admin-logo-sub">Control Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                className={`admin-nav-item${isActive ? " active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="admin-nav-indicator"
                    layoutId="adminNavIndicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        <button className="admin-back-btn" onClick={() => navigate("/tournaments")}>
          <ArrowLeft size={16} />
          Back to Arena
        </button>
      </aside>

      <main className="admin-main">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {title && (
            <header className="admin-page-header">
              <h1 className="admin-page-title">{title}</h1>
              {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
            </header>
          )}
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default AdminLayout
