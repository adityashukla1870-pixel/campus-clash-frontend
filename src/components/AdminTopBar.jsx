import { useNavigate } from "react-router-dom"
import { FiUser } from "react-icons/fi"

function AdminTopBar({ showBack = true }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
    }}>
      {showBack ? (
        <span
          style={{ cursor: "pointer", color: "var(--text-secondary)", fontSize: 14 }}
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </span>
      ) : <span />}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{ cursor: "pointer", color: "var(--text-secondary)", fontSize: 14 }}
          onClick={() => navigate("/tournaments")}
        >
          <FiUser /> User Dashboard
        </span>

        <span
          style={{
            cursor: "pointer",
            color: "var(--red)",
            fontSize: 14,
            fontWeight: 500,
            border: "1px solid var(--border)",
            padding: "6px 14px",
            borderRadius: 8,
          }}
          onClick={handleLogout}
        >
          Logout
        </span>
      </div>
    </div>
  )
}

export default AdminTopBar
