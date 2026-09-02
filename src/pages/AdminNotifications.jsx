import { useEffect, useState, useRef, useCallback } from "react"
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage, FiX, FiSend, FiFilter, FiClock, FiGlobe, FiUser, FiAward } from "react-icons/fi"
import AdminLayout from "../components/AdminLayout"
import API from "../api/axios"
import "./AdminNotifications.css"

const TYPES = [
  { value: "global_announcement", label: "Global Announcement", icon: FiGlobe },
  { value: "specific_user", label: "Specific User", icon: FiUser },
  { value: "tournament", label: "Tournament", icon: FiAward },
  { value: "general", label: "General", icon: FiBell },
]

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "general",
  targetUsers: [],
  tournamentId: "",
  actionLabel: "",
  actionUrl: "",
  showPopup: true,
  showInCenter: true,
  showOnce: true,
  isActive: true,
  expiresAt: "",
  scheduledAt: "",
}

function AdminNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [userSearchResults, setUserSearchResults] = useState([])
  const [userSearch, setUserSearch] = useState("")
  const [userSearching, setUserSearching] = useState(false)
  const fileRef = useRef(null)
  const searchTimer = useRef(null)

  const loadItems = () => {
    setLoading(true)
    const url = filter !== "all" ? `/announcements/admin?status=${filter}` : "/announcements/admin"
    API.get(url)
      .then(res => {
        setItems(res.data?.notifications || [])
        setTotal(res.data?.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadItems() }, [filter])

  useEffect(() => {
    if (showModal) {
      API.get("/tournament/all").then(res => {
        const list = res.data?.tournaments || res.data || []
        setTournaments(Array.isArray(list) ? list : [])
      }).catch(() => {})
    }
  }, [showModal])

  const searchUsers = useCallback((query) => {
    setUserSearch(query)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (query.length < 2) {
      setUserSearchResults([])
      return
    }
    setUserSearching(true)
    searchTimer.current = setTimeout(() => {
      API.get(`/auth/search-users?q=${encodeURIComponent(query)}&limit=8`)
        .then(res => setUserSearchResults(res.data?.users || []))
        .catch(() => setUserSearchResults([]))
        .finally(() => setUserSearching(false))
    }, 300)
  }, [])

  const addUser = (user) => {
    if (!form.targetUsers.find(u => u.id === user.id)) {
      setForm(prev => ({ ...prev, targetUsers: [...prev.targetUsers, user] }))
    }
    setUserSearch("")
    setUserSearchResults([])
  }

  const removeUser = (userId) => {
    setForm(prev => ({ ...prev, targetUsers: prev.targetUsers.filter(u => u.id !== userId) }))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type || "general",
      targetUsers: (item.targetUsers || []).map(id => ({ id, username: id })),
      tournamentId: item.tournamentId || "",
      actionLabel: item.actionLabel || "",
      actionUrl: item.actionUrl || "",
      showPopup: item.showPopup,
      showInCenter: item.showInCenter,
      showOnce: item.showOnce,
      isActive: item.isActive,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 16) : "",
      scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : "",
    })
    setImageFile(null)
    setImagePreview(item.imageUrl || null)
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      alert("Title and message are required")
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("title", form.title)
      fd.append("message", form.message)
      fd.append("type", form.type)
      fd.append("targetUsers", form.targetUsers.map(u => u.id).join(", "))
      fd.append("tournamentId", form.tournamentId)
      fd.append("actionLabel", form.actionLabel)
      fd.append("actionUrl", form.actionUrl)
      fd.append("showPopup", form.showPopup)
      fd.append("showInCenter", form.showInCenter)
      fd.append("showOnce", form.showOnce)
      fd.append("isActive", form.isActive)
      fd.append("expiresAt", form.expiresAt || "")
      fd.append("scheduledAt", form.scheduledAt || "")
      if (imageFile) fd.append("image", imageFile)

      if (editingId) {
        await API.put(`/announcements/admin/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await API.post("/announcements", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      setShowModal(false)
      loadItems()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/announcements/admin/${id}/status`)
      setItems(prev => prev.map(a =>
        a.id === id ? { ...a, isActive: res.data.isActive } : a
      ))
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/announcements/admin/${id}`)
      setItems(prev => prev.filter(a => a.id !== id))
      setDeleteConfirm(null)
      setTotal(prev => prev - 1)
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    }
  }

  const typeLabel = (t) => TYPES.find(x => x.value === t)?.label || t

  const statCards = [
    { label: "Total", value: total, icon: FiBell, color: "var(--purple)" },
    { label: "Active", value: items.filter(a => a.isActive).length, icon: FiEye, color: "var(--green)" },
    { label: "Popup", value: items.filter(a => a.showPopup && a.isActive).length, icon: FiSend, color: "var(--cyan)" },
    { label: "Scheduled", value: items.filter(a => a.scheduledAt && new Date(a.scheduledAt) > new Date()).length, icon: FiClock, color: "var(--yellow)" },
  ]

  return (
    <AdminLayout title="Notifications" subtitle="Create and manage announcements, alerts, and notifications">
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <button className="an-btn-primary" onClick={openCreate}>
          <FiPlus size={16} /> New Notification
        </button>
      </div>

      <div className="an-stats">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="an-stat-card">
              <div className="an-stat-icon" style={{ color: s.color }}><Icon size={20} /></div>
              <div className="an-stat-value">{s.value}</div>
              <div className="an-stat-label">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="an-filters">
        {["all", "active", "inactive"].map(f => (
          <button
            key={f}
            className={`an-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            <FiFilter size={12} /> {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="an-loading">Loading...</div>
      ) : items.length === 0 ? (
        <div className="an-empty">
          <FiBell size={40} style={{ opacity: 0.2 }} />
          <span>No notifications yet</span>
        </div>
      ) : (
        <div className="an-table">
          <div className="an-table-head">
            <span>Title</span>
            <span>Type</span>
            <span>Audience</span>
            <span>Created</span>
            <span>Status</span>
            <span>Popup</span>
            <span>Schedule</span>
            <span>Actions</span>
          </div>
          {items.map(item => (
            <div key={item.id} className={`an-table-row${item.isActive ? "" : " inactive"}`}>
              <span className="an-col-title">
                {item.imageUrl && <FiImage size={12} style={{ marginRight: 4, opacity: 0.5 }} />}
                {item.title}
              </span>
              <span className="an-col-type">{typeLabel(item.type)}</span>
              <span className="an-col-audience">
                {item.type === "global_announcement" ? "Everyone" :
                 item.type === "specific_user" ? `${item.targetUsers?.length || 0} users` :
                 item.type === "tournament" ? "Tournament" : "General"}
              </span>
              <span className="an-col-date">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "\u2014"}
              </span>
              <span className="an-col-status">
                <span className={`an-status-dot${item.isActive ? " active" : ""}`} />
                {item.isActive ? "Active" : "Inactive"}
              </span>
              <span className="an-col-popup">{item.showPopup ? "Yes" : "No"}</span>
              <span className="an-col-schedule">
                {item.scheduledAt ? (
                  new Date(item.scheduledAt) > new Date() ? (
                    <span className="an-scheduled-badge">Scheduled</span>
                  ) : "Sent"
                ) : "\u2014"}
              </span>
              <span className="an-col-actions">
                <button className="an-action-btn" title="Edit" onClick={() => openEdit(item)}>
                  <FiEdit2 size={14} />
                </button>
                <button
                  className={`an-action-btn ${item.isActive ? "warn" : "success"}`}
                  title={item.isActive ? "Deactivate" : "Activate"}
                  onClick={() => handleToggleStatus(item.id)}
                >
                  {item.isActive ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
                <button className="an-action-btn danger" title="Delete" onClick={() => setDeleteConfirm(item)}>
                  <FiTrash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="an-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="an-modal" onClick={e => e.stopPropagation()}>
            <div className="an-modal-header">
              <h2>{editingId ? "Edit Notification" : "New Notification"}</h2>
              <button className="an-modal-close" onClick={() => setShowModal(false)}><FiX size={18} /></button>
            </div>

            <div className="an-modal-body">
              <label className="an-label">Title *</label>
              <input
                className="an-input"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Notification title"
              />

              <label className="an-label">Message *</label>
              <textarea
                className="an-input an-textarea"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Notification message body"
                rows={3}
              />

              <label className="an-label">Type</label>
              <select
                className="an-input"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value, targetUsers: e.target.value !== "specific_user" ? [] : form.targetUsers })}
              >
                {TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {form.type === "specific_user" && (
                <>
                  <label className="an-label">Search Users</label>
                  <div className="an-user-search-wrap">
                    <input
                      className="an-input"
                      value={userSearch}
                      onChange={e => searchUsers(e.target.value)}
                      placeholder="Search by username or email..."
                    />
                    {userSearching && <span className="an-user-search-loading">Searching...</span>}
                    {userSearchResults.length > 0 && (
                      <div className="an-user-dropdown">
                        {userSearchResults.map(u => (
                          <div
                            key={u.id}
                            className="an-user-option"
                            onClick={() => addUser(u)}
                          >
                            <span className="an-user-option-name">{u.username}</span>
                            <span className="an-user-option-email">{u.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {form.targetUsers.length > 0 && (
                    <div className="an-user-chips">
                      {form.targetUsers.map(u => (
                        <span key={u.id} className="an-user-chip">
                          {u.username || u.id}
                          <button className="an-chip-remove" onClick={() => removeUser(u.id)}>
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {form.type === "tournament" && (
                <>
                  <label className="an-label">Tournament</label>
                  <select
                    className="an-input"
                    value={form.tournamentId}
                    onChange={e => setForm({ ...form, tournamentId: e.target.value })}
                  >
                    <option value="">Select tournament</option>
                    {tournaments.map(t => (
                      <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                    ))}
                  </select>
                </>
              )}

              <div className="an-row">
                <div style={{ flex: 1 }}>
                  <label className="an-label">Action Label</label>
                  <input
                    className="an-input"
                    value={form.actionLabel}
                    onChange={e => setForm({ ...form, actionLabel: e.target.value })}
                    placeholder="e.g. View Tournament"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="an-label">Action URL</label>
                  <input
                    className="an-input"
                    value={form.actionUrl}
                    onChange={e => setForm({ ...form, actionUrl: e.target.value })}
                    placeholder="/tournament/..."
                  />
                </div>
              </div>

              <label className="an-label">Image</label>
              <div className="an-image-upload" onClick={() => fileRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="an-image-preview" />
                ) : (
                  <div className="an-image-placeholder">
                    <FiImage size={24} />
                    <span>Click to upload</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              </div>

              <div className="an-row">
                <div style={{ flex: 1 }}>
                  <label className="an-label">Expires At (optional)</label>
                  <input
                    className="an-input"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="an-label">Schedule For Later (optional)</label>
                  <input
                    className="an-input"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="an-toggles">
                {[
                  { key: "showPopup", label: "Show Popup" },
                  { key: "showInCenter", label: "Show in Center" },
                  { key: "showOnce", label: "Show Once" },
                  { key: "isActive", label: "Active" },
                ].map(t => (
                  <label key={t.key} className="an-toggle">
                    <input
                      type="checkbox"
                      checked={form[t.key]}
                      onChange={e => setForm({ ...form, [t.key]: e.target.checked })}
                    />
                    <span className="an-toggle-slider" />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="an-modal-footer">
              <button className="an-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="an-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="an-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="an-modal an-confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Notification?</h3>
            <p>This will permanently delete "{deleteConfirm.title}". This action cannot be undone.</p>
            <div className="an-modal-footer">
              <button className="an-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="an-btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminNotifications
