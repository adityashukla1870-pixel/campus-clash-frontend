import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar"
import API from "../api/axios";

function MyTournaments(){

const navigate = useNavigate()
const location = useLocation()

const [tournaments,setTournaments] = useState([])

useEffect(()=>{

  const token = localStorage.getItem("token")

  if(!token){
    navigate("/")
    return
  }

  

  API.get("/tournament/my-tournaments")
.then(res=>{

const data = res.data;
    if(Array.isArray(data)){
      setTournaments(data)
    }else{
      console.log("API ERROR:",data)
      setTournaments([])
    }
  })

},[location.pathname])

return(

<>
<Navbar/>

<div className="mytournaments-page">

  <h1>🎯 My Tournaments</h1>

  {tournaments.length === 0 && (
    <p className="empty-text">
      🚫 No tournaments joined yet
    </p>
  )}

  <div className="mytournament-list">

  {tournaments.map((t)=>{

  return(

  <div className="mytournament-card" key={t.id}>

    <h2>🔥 {t.name}</h2>

    <p>🎮 Game: {t.game}</p>
    <p>💰 Entry Fee: ₹{t.entry_fee}</p>
    <p>🏆 Prize Pool: ₹{t.prize_pool}</p>

    <p
  className={`status ${
    t.status === "completed"
      ? "completed"
      : t.status === "approved"
      ? "approved"
      : "pending"
  }`}
>
  {t.status === "completed"
    ? "Completed 🏁"
    : t.status === "approved"
    ? "Approved ✅"
    : "Pending ⏳"}
</p>
  {t.status === "completed" && (
  <div style={{ marginTop: "15px" }}>
    <h3>🏆 Winner: {t.winner}</h3>

    {t.is_winner ? (
      <p
        style={{
          color: "#22c55e",
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        🎉 Congratulations! You won this tournament.
      </p>
    ) : (
      <p
        style={{
          color: "#facc15",
          fontWeight: "bold"
        }}
      >
        ❤️ Better luck next time.
      </p>
    )}
  </div>
)}
    {t.status !== "completed" && (
  <button
    onClick={() => navigate(`/room/${t.id}`)}
    disabled={t.status !== "approved"}
  >
    Open Room
  </button>
)}

  </div>

  )

  })}

  </div>

</div>

</>

)

}

export default MyTournaments