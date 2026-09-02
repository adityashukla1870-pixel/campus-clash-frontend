import { useEffect, useState } from "react"
import { FiStar, FiCheckCircle, FiXCircle, FiFilter, FiSend, FiRotateCcw } from "react-icons/fi"
import AdminTopBar from "../components/AdminTopBar"
import API from "../api/axios"
import { SkeletonTable } from "../components/Skeleton"

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const [tournaments, setTournaments] = useState([])
  const [tournamentsLoading, setTournamentsLoading] = useState(true)
  const [launchingId, setLaunchingId] = useState(null)

  const loadTournaments = () => {
    setTournamentsLoading(true)
    API.get("/feedbacks/admin/launchable-tournaments")
      .then(res => setTournaments(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setTournamentsLoading(false))
  }

  useEffect(() => { loadTournaments() }, [])

  const handleLaunch = async (tournamentId) => {
    setLaunchingId(tournamentId)
    try {
      await API.post(`/feedbacks/admin/launch/${tournamentId}`)
      setTournaments(prev => prev.map(t =>
        t.id === tournamentId ? { ...t, feedback_launched: true } : t
      ))
    } catch (err) {
      alert(err.response?.data?.error || "Failed to launch feedback")
    } finally {
      setLaunchingId(null)
    }
  }

  const handleUnlaunch = async (tournamentId) => {
    setLaunchingId(tournamentId)
    try {
      await API.delete(`/feedbacks/admin/launch/${tournamentId}`)
      setTournaments(prev => prev.map(t =>
        t.id === tournamentId ? { ...t, feedback_launched: false } : t
      ))
    } catch (err) {
      alert(err.response?.data?.error || "Failed to revoke feedback launch")
    } finally {
      setLaunchingId(null)
    }
  }

  const loadFeedbacks = (status) => {
    setLoading(true)
    const url = status && status !== "all" ? `/feedbacks/admin/all?status=${status}` : "/feedbacks/admin/all"
    API.get(url)
      .then(res => setFeedbacks(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadFeedbacks(filter) }, [filter])

  const handleApprove = async (id) => {
    try {
      await API.patch(`/feedbacks/admin/${id}/approve`)
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "approved" } : f))
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    }
  }

  const handleReject = async (id) => {
    try {
      await API.patch(`/feedbacks/admin/${id}/reject`)
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "rejected" } : f))
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    }
  }

  const statusColor = (s) => {
    if (s === "approved") return "#22c55e"
    if (s === "rejected") return "#ef4444"
    return "#f59e0b"
  }

  const filters = ["all", "pending", "approved", "rejected"]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-dark)", padding: "24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <AdminTopBar />

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <FiStar /> Player Feedback
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Launch feedback forms and review player submissions
          </p>
        </div>

        {/* Tournament Launch Section */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "20px 24px", marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          }}>
            <FiSend /> Launch Feedback
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, marginTop: -8 }}>
            Enable the feedback form for a completed tournament. Players will see a popup on Dashboard and My Matches.
          </p>

          {tournamentsLoading ? (
            <SkeletonTable rows={3} />
          ) : tournaments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No completed tournaments found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tournaments.map(t => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", borderRadius: 10,
                  background: t.feedback_launched ? "rgba(34, 197, 94, 0.06)" : "rgba(0, 0, 0, 0.15)",
                  border: `1px solid ${t.feedback_launched ? "rgba(34, 197, 94, 0.2)" : "var(--border)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.name}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                        {t.feedback_count}/{t.total_players} feedback{t.total_players !== 1 ? "s" : ""} submitted
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    {t.feedback_launched ? (
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px",
                        borderRadius: 6, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                      }}>
                        Launched
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px",
                        borderRadius: 6, background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}>
                        Not Launched
                      </span>
                    )}

                    {t.feedback_launched ? (
                      <button
                        onClick={() => handleUnlaunch(t.id)}
                        disabled={launchingId === t.id}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)",
                          background: "transparent", color: "var(--text-secondary)", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                          opacity: launchingId === t.id ? 0.5 : 1,
                        }}
                      >
                        <FiRotateCcw size={12} /> Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLaunch(t.id)}
                        disabled={launchingId === t.id}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "none",
                          background: "linear-gradient(135deg, var(--purple), var(--cyan))",
                          color: "#fff", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                          opacity: launchingId === t.id ? 0.5 : 1,
                        }}
                      >
                        <FiSend size={12} /> Launch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Review Section */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: "var(--text-primary)",
            display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          }}>
            <FiFilter /> Submissions
          </h2>

          <div style={{ display: "flex", gap: 8 }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px", borderRadius: 8, border: "1px solid var(--border)",
                  background: filter === f ? "var(--purple)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
            <FiStar size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No feedback submissions found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {feedbacks.map(f => (
              <div key={f.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "16px 20px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>
                      {f.username}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      {f.tournament_name}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: "uppercase", padding: "3px 8px",
                    borderRadius: 6, background: `${statusColor(f.status)}20`, color: statusColor(f.status),
                    border: `1px solid ${statusColor(f.status)}40`,
                  }}>
                    {f.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} size={14} style={{ color: s <= f.rating ? "#f59e0b" : "var(--text-muted)" }} fill={s <= f.rating ? "#f59e0b" : "none"} />
                  ))}
                </div>

                {f.comment && (
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.5 }}>
                    {f.comment}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}
                  </span>
                  {f.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleApprove(f.id)}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "none",
                          background: "#22c55e", color: "#fff", cursor: "pointer",
                          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <FiCheckCircle /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(f.id)}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "none",
                          background: "#ef4444", color: "#fff", cursor: "pointer",
                          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFeedback
