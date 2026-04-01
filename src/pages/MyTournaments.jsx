import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function MyTournaments(){

const navigate = useNavigate()

const [tournaments,setTournaments] = useState([])

useEffect(()=>{

const token = localStorage.getItem("token")

fetch("http://127.0.0.1:5000/tournament/my-tournaments",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
setTournaments(data)
})

},[])

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

    <p className={`status ${t.status === "approved" ? "approved" : "pending"}`}>
      {t.status === "approved" ? "Approved ✅" : "Pending ⏳"}
    </p>

    <button
      onClick={()=>{
        console.log("BUTTON CLICKED", t.id)
        navigate(`/room/${t.id}`)
      }}
      disabled={t.status !== "approved"}
    >
      Open Room
    </button>

  </div>

  )

  })}

  </div>

</div>

</>

)

}

export default MyTournaments