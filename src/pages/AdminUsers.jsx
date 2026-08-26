import { useState } from "react"
import { FiSearch, FiKey, FiUser, FiCheckCircle, FiX, FiEdit2, FiAward } from "react-icons/fi"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminUsers() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [resetModal, setResetModal] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState("")

  const [nameModal, setNameModal] = useState(null)
  const [newInGameName, setNewInGameName] = useState("")
  const [changingName, setChangingName] = useState(false)
  const [nameMsg, setNameMsg] = useState("")

  const [titleModal, setTitleModal] = useState(null)
  const [resettingTitle, setResettingTitle] = useState(false)
  const [titleMsg, setTitleMsg] = useState("")

  const searchUsers = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await API.get(`/auth/admin/users?q=${encodeURIComponent(query.trim())}`)
      setUsers(res.data)
      setSearched(true)
    } catch {
      alert("Failed to search users")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetMsg("Password must be at least 6 characters")
      return
    }
    setResetting(true)
    setResetMsg("")
    try {
      const res = await API.post("/auth/admin/reset-user-password", {
        user_id: resetModal._id,
        new_password: newPassword,
      })
      setResetMsg(res.data.message)
      setTimeout(() => {
        setResetModal(null)
        setNewPassword("")
        setResetMsg("")
      }, 1500)
    } catch (err) {
      setResetMsg(err.response?.data?.error || "Failed to reset password")
    } finally {
      setResetting(false)
    }
  }

  const handleNameChange = async () => {
    if (!newInGameName.trim()) { setNameMsg("Enter a name"); return }
    setChangingName(true)
    setNameMsg("")
    try {
      const res = await API.post("/auth/admin/change-in-game-name", {
        user_id: nameModal._id,
        new_name: newInGameName.trim()
      })
      setNameMsg(res.data.message)
      setTimeout(() => {
        setNameModal(null)
        setNewInGameName("")
        setNameMsg("")
        searchUsers()
      }, 1500)
    } catch (err) {
      setNameMsg(err.response?.data?.error || "Failed to change name")
    } finally {
      setChangingName(false)
    }
  }

  const handleResetTitle = async () => {
    setResettingTitle(true)
    setTitleMsg("")
    try {
      const res = await API.post("/player-stats/admin/reset-player-stats", {
        user_id: titleModal._id,
        stat: "tournaments_won",
        game: "GLOBAL"
      })
      setTitleMsg(res.data.message)
      setTimeout(() => {
        setTitleModal(null)
        setTitleMsg("")
      }, 1500)
    } catch (err) {
      setTitleMsg(err.response?.data?.error || "Failed to reset title")
    } finally {
      setResettingTitle(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
      <AdminTopBar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 20 }}>
          <FiUser style={{ verticalAlign: -4, marginRight: 8 }} /> User Management
        </h1>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchUsers()}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--bg-surface)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none'
            }}
          />
          <button
            onClick={searchUsers}
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--grad-purple)', color: '#fff', fontWeight: 700,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.6 : 1
            }}
          >
            <FiSearch size={16} /> Search
          </button>
        </div>

        {/* Results */}
        {users.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px' }}>Name</th>
                  <th style={{ padding: '10px 14px' }}>Email</th>
                  <th style={{ padding: '10px 14px' }}>Username</th>
                  <th style={{ padding: '10px 14px' }}>Role</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{u.username || "—"}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                        background: u.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)',
                        color: u.role === 'admin' ? 'var(--purple)' : 'var(--green)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setNameModal(u); setNewInGameName(""); setNameMsg("") }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 600,
                            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <FiEdit2 size={13} /> Change Name
                        </button>
                        <button
                          onClick={() => { setTitleModal(u); setTitleMsg("") }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600,
                            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <FiAward size={13} /> Reset Title
                        </button>
                        <button
                          onClick={() => { setResetModal(u); setNewPassword(""); setResetMsg("") }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600,
                            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                          }}
                        >
                          <FiKey size={13} /> Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {searched && users.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found</p>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => { setResetModal(null); setNewPassword(""); setResetMsg("") }}>
          <div
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 28, width: '100%', maxWidth: 400
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Reset Password</h3>
              <FiX style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { setResetModal(null); setNewPassword(""); setResetMsg("") }} />
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Setting new password for <strong>{resetModal.name}</strong> ({resetModal.email})
            </p>

            <input
              type="text"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 12
              }}
            />

            {resetMsg && (
              <p style={{
                fontSize: 13, margin: '0 0 12px',
                color: resetMsg.includes("success") || resetMsg.includes("Password reset") ? 'var(--green)' : '#ef4444'
              }}>
                {resetMsg.includes("success") || resetMsg.includes("Password reset") ? <FiCheckCircle style={{ verticalAlign: -2, marginRight: 4 }} /> : null}
                {resetMsg}
              </p>
            )}

            <button
              onClick={handleReset}
              disabled={resetting || newPassword.length < 6}
              style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--grad-purple)', color: '#fff', fontWeight: 700,
                fontSize: 14, opacity: resetting || newPassword.length < 6 ? 0.6 : 1
              }}
            >
              {resetting ? "Setting..." : "Set New Password"}
            </button>
          </div>
        </div>
      )}

      {/* Change In-Game Name Modal */}
      {nameModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => { setNameModal(null); setNewInGameName(""); setNameMsg("") }}>
          <div
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 28, width: '100%', maxWidth: 400
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Change In-Game Name</h3>
              <FiX style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { setNameModal(null); setNewInGameName(""); setNameMsg("") }} />
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
              Player: <strong>{nameModal.name}</strong> ({nameModal.email})
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Current in-game name: <strong>{nameModal.name}</strong>
            </p>

            <input
              type="text"
              placeholder="New in-game name"
              value={newInGameName}
              onChange={e => setNewInGameName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameChange()}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-card)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 12
              }}
            />

            {nameMsg && (
              <p style={{
                fontSize: 13, margin: '0 0 12px',
                color: nameMsg.includes("changed") ? 'var(--green)' : '#ef4444'
              }}>
                {nameMsg.includes("changed") ? <FiCheckCircle style={{ verticalAlign: -2, marginRight: 4 }} /> : null}
                {nameMsg}
              </p>
            )}

            <button
              onClick={handleNameChange}
              disabled={changingName || !newInGameName.trim()}
              style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'var(--grad-purple)', color: '#fff', fontWeight: 700,
                fontSize: 14, opacity: changingName || !newInGameName.trim() ? 0.6 : 1
              }}
            >
              {changingName ? "Changing..." : "Change Name"}
            </button>
          </div>
        </div>
      )}

      {/* Reset Title Modal */}
      {titleModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => { setTitleModal(null); setTitleMsg("") }}>
          <div
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 28, width: '100%', maxWidth: 400
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Reset Title</h3>
              <FiX style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => { setTitleModal(null); setTitleMsg("") }} />
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Remove global tournament title from <strong>{titleModal.name}</strong>?
              <br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kills and other stats will not be affected.</span>
            </p>

            {titleMsg && (
              <p style={{
                fontSize: 13, margin: '0 0 12px',
                color: titleMsg.includes("Reset") ? 'var(--green)' : '#ef4444'
              }}>
                {titleMsg.includes("Reset") ? <FiCheckCircle style={{ verticalAlign: -2, marginRight: 4 }} /> : null}
                {titleMsg}
              </p>
            )}

            <button
              onClick={handleResetTitle}
              disabled={resettingTitle}
              style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: '#ef4444', color: '#fff', fontWeight: 700,
                fontSize: 14, opacity: resettingTitle ? 0.6 : 1
              }}
            >
              {resettingTitle ? "Removing..." : "Remove Title"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
