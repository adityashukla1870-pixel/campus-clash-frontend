import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import AdminTopBar from "../components/AdminTopBar"

function AdminPayments() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])

  useEffect(() => {
    API.get("/tournament/admin/pending-payments")
      .then(res => setPayments(res.data))
      .catch(console.error)
  }, [])

  const approve = async (id) => {
    await API.post(`/tournament/admin/approve/${id}`)
    setPayments(prev => prev.filter(p => p._id !== id))
  }

  const reject = async (id) => {
    await API.post(`/tournament/admin/reject/${id}`)
    setPayments(prev => prev.filter(p => p._id !== id))
  }

  const pageStyle = {
    minHeight:'100vh', background:'var(--bg-dark)', padding:'40px 24px',
  }
  const innerStyle = { maxWidth:800, margin:'0 auto' }
  const cardStyle = {
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:16, padding:24, marginBottom:16,
    display:'flex', gap:24, flexWrap:'wrap',
  }

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32}}>
          <AdminTopBar />
        </div>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,marginBottom:6}}>💰 Payment Verification</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Review and approve pending tournament payments.</p>

        {payments.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 24px',color:'var(--text-muted)'}}>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <p style={{fontSize:16}}>No pending payments — all clear!</p>
          </div>
        ) : (
          payments.map(p => (
            <div key={p._id} style={cardStyle}>
              <div style={{flex:1, minWidth:200}}>
                <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:4}}>Registration ID</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--text-secondary)',marginBottom:12,wordBreak:'break-all'}}>{p._id}</div>
                <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:4}}>UTR Number</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:16,fontWeight:600,color:'var(--cyan)',marginBottom:16}}>{p.utr}</div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn-success" onClick={() => approve(p._id)}>✅ Approve</button>
                  <button className="btn-danger" onClick={() => reject(p._id)}>❌ Reject</button>
                </div>
              </div>
              {p.screenshot ? (
                <div style={{flexShrink:0}}>
                  <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'0.8px',color:'var(--text-muted)',marginBottom:8}}>Screenshot</div>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${p.screenshot.replace("\\", "/")}`}
                    style={{width:180,height:160,objectFit:'cover',borderRadius:10,border:'1px solid var(--border)'}}
                    alt="Payment proof"
                  />
                </div>
              ) : (
                <div style={{
                  width:180,height:160,background:'var(--bg-surface)',borderRadius:10,
                  border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',
                  color:'var(--text-muted)',fontSize:13,flexShrink:0,
                }}>No screenshot</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminPayments
