import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiDollarSign, FiCheckCircle, FiXCircle, FiAward, FiInstagram, FiImage } from "react-icons/fi"
import API from "../api/axios"
import { resolveImageUrl } from "../utils/media"
import AdminTopBar from "../components/AdminTopBar"
import { SkeletonTable, SkeletonText, SkeletonBlock } from "../components/Skeleton"

const pageStyle = {
  minHeight: '100vh', background: 'var(--bg-dark)', padding: '40px 24px',
}
const innerStyle = { maxWidth: 800, margin: '0 auto' }
const cardStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 16, padding: 24, marginBottom: 16,
  display: 'flex', gap: 24, flexWrap: 'wrap',
}

function PaymentCard({ p, actions }) {
  const isFreeTournament = p.entry_fee === 0
  const hasIgProof = p.ig_screenshots && p.ig_screenshots.length > 0

  return (
    <div style={cardStyle}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{p.player_name}</div>
            {p.player_email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.player_email}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFreeTournament && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: 'rgba(225,48,108,0.15)', color: '#E1306C', border: '1px solid rgba(225,48,108,0.3)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <FiInstagram size={11} /> FREE
              </span>
            )}
            {p.entry_fee != null && p.entry_fee > 0 && (
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>₹{p.entry_fee}</div>
            )}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--purple-light)', marginBottom: 14 }}>🏆 {p.tournament_name}</div>

        {p.team_name && (
          <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>Squad — {p.team_name}</div>

            {p.team_leader?.name && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: p.team_members?.length ? 6 : 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Leader:</strong> {p.team_leader.name}
                {p.team_leader.game_uid && ` (UID: ${p.team_leader.game_uid})`}
                {p.team_leader.contact && ` · ${p.team_leader.contact}`}
              </div>
            )}

            {p.team_members?.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Members:</strong>{" "}
                {p.team_members.map(m => m.game_uid ? `${m.name} (UID: ${m.game_uid})` : m.name).filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        )}

        {!isFreeTournament && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>Payment Code</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--purple-light)' }}>{p.payment_code}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>UTR Number</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--cyan)' }}>{p.utr || "—"}</div>
            </div>
          </div>
        )}

        {isFreeTournament && (
          <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(225,48,108,0.08)', borderRadius: 8, border: '1px solid rgba(225,48,108,0.2)' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#E1306C', marginBottom: 4, fontWeight: 600 }}>
              <FiInstagram size={11} style={{ verticalAlign: 'middle' }} /> Instagram Verification
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {hasIgProof ? `${p.ig_screenshots.length} screenshot(s) uploaded` : "No proof uploaded yet"}
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>Registration ID</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, wordBreak: 'break-all' }}>{p._id}</div>

        {actions}
      </div>

      {/* Screenshot display */}
      {isFreeTournament && hasIgProof ? (
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#E1306C', marginBottom: 8, fontWeight: 600 }}>
            <FiImage size={11} /> IG Proof ({p.ig_screenshots.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 200 }}>
            {p.ig_screenshots.map((url, i) => (
              <a key={i} href={resolveImageUrl(url)} target="_blank" rel="noopener noreferrer">
                <img
                  src={resolveImageUrl(url)}
                  style={{
                    width: 88, height: 80, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid var(--border)', cursor: 'pointer',
                  }}
                  alt={`IG proof ${i + 1}`}
                />
              </a>
            ))}
          </div>
        </div>
      ) : !isFreeTournament && p.screenshot ? (
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 8 }}>Screenshot</div>
          <img
            src={resolveImageUrl(p.screenshot)}
            style={{ width: 180, height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
            alt="Payment proof"
          />
        </div>
      ) : (
        <div style={{
          width: 180, height: 160, background: 'var(--bg-surface)', borderRadius: 10,
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 13, flexShrink: 0,
        }}>No screenshot</div>
      )}
    </div>
  )
}

function AdminPayments() {
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("pending")

  const loadAll = () => Promise.all([
    API.get("/tournament/admin/pending-payments").then(res => setPending(res.data)),
    API.get("/tournament/admin/approved-payments").then(res => setApproved(res.data)),
  ])

  useEffect(() => {
    loadAll().catch(console.error).finally(() => setLoading(false))
  }, [])

  const approve = async (id) => {
    await API.post(`/tournament/admin/approve/${id}`)
    // Move it from Pending into the persistent Approved list instead of
    // just dropping it — the admin should still be able to see everything
    // the registrant filled in, even after acting on it.
    const moved = pending.find(p => p._id === id)
    setPending(prev => prev.filter(p => p._id !== id))
    if (moved) setApproved(prev => [{ ...moved, payment_status: "approved" }, ...prev])
  }

  const reject = async (id) => {
    await API.post(`/tournament/admin/reject/${id}`)
    setPending(prev => prev.filter(p => p._id !== id))
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={innerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <AdminTopBar />
          </div>
          <SkeletonText width="200px" height={28} style={{ marginBottom: 6 }} />
          <SkeletonText width="300px" height={14} style={{ marginBottom: 32 }} />
          <SkeletonTable rows={5} cols={6} />
        </div>
      </div>
    )
  }

  const list = tab === "pending" ? pending : approved

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <AdminTopBar />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>💰 Payment Verification</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Review pending payments and keep a record of everything approved.</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setTab("pending")}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', marginRight: 20,
              fontSize: 14, fontWeight: 600,
              color: tab === "pending" ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: tab === "pending" ? '2px solid var(--purple-light)' : '2px solid transparent',
            }}
          >
            ⏳ Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab("approved")}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px',
              fontSize: 14, fontWeight: 600,
              color: tab === "approved" ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: tab === "approved" ? '2px solid var(--purple-light)' : '2px solid transparent',
            }}
          >
            ✅ Approved ({approved.length})
          </button>
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{tab === "pending" ? "✅" : "🗂️"}</div>
            <p style={{ fontSize: 16 }}>
              {tab === "pending" ? "No pending payments — all clear!" : "No approved registrations yet."}
            </p>
          </div>
        ) : (
          list.map(p => (
            <PaymentCard
              key={p._id}
              p={p}
              actions={
                tab === "pending" ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-success" onClick={() => approve(p._id)}>✅ Approve</button>
                    <button className="btn-danger" onClick={() => reject(p._id)}>❌ Reject</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>✅ Approved</div>
                )
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

export default AdminPayments
