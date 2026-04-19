import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import bgImage from "../assets/gaming.jpg"
import Navbar from "../components/Navbar"
import { useLocation } from "react-router-dom"

function Tournament(){

const navigate = useNavigate();
const [tournaments,setTournaments] = useState([]);
const [userId,setUserId] = useState("");
const location = useLocation()

useEffect(()=>{

  const token = localStorage.getItem("token")

  if(!token){
    navigate("/")
    return
  }

  try {
    const decoded = jwtDecode(token)
    setUserId(decoded.sub)
  } catch(err){
    console.log("Invalid token")
    navigate("/")
    return
  }

  fetch("http://127.0.0.1:5000/tournament/all",{
    headers:{
      Authorization:`Bearer ${token}`
    }
  })
  .then(res=>res.json())
  .then(data=>{
    if(Array.isArray(data)){
      setTournaments(data)
    }else{
      console.log("API ERROR:",data)
      setTournaments([])
    }
  })

},[location.pathname])

const handleJoin = async (id)=>{

const token = localStorage.getItem("token")

const res = await fetch(`http://127.0.0.1:5000/tournament/join/${id}`,{

method:"POST",

headers:{
Authorization:`Bearer ${token}`
}

})

const data = await res.json()

alert(data.message || data.error)

if(data.message){

setTournaments(prev =>
prev.map(t =>
t.id === id
? {...t, players:[...t.players,userId]}
: t
)
)

}

}

const handleLogout = ()=>{

localStorage.removeItem("token")
navigate("/")

}

return(

<>
<Navbar/>

<div
  className="tournaments-page"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
>

  {/* TOP BAR */}
  <div className="top-bar">
    <h1>🎮 Tournaments</h1>

    
  </div>

  {/* HERO SECTION */}
  <div className="tournament-hero">
    <h1>Compete. Conquer. Win.</h1>
    <p>
      Join exciting esports tournaments, battle top players,
      and prove your skills on the leaderboard.
    </p>
  </div>

  {/* IMAGE */}
  

  {/* TOURNAMENT LIST */}
  <div className="tournament-list">

    {Array.isArray(tournaments) && tournaments.map((t)=>{

      const alreadyJoined = t.players?.includes(userId)
      const isFull = t.players.length >= t.max_players

      return(

      <div className="tournament-card" key={t.id}>

        <h2>🔥 {t.name}</h2>

        <p>🎮 Game: {t.game}</p>
        <p className="highlight">🏆 Prize Pool: ₹{t.prize_pool}</p>
        <p>👥 Players: {t.players.length} / {t.max_players}</p>

        <button
          onClick={()=>navigate(`/tournament/${t.id}`)}
          disabled={alreadyJoined || isFull}
        >
          {alreadyJoined
            ? "Already Joined"
            : isFull
            ? "Tournament Full"
            : "Join Tournament"}
        </button>

      </div>

      )

    })}

  </div>

  {/* EMPTY STATE */}
  {tournaments.length === 0 && (
    <p className="empty-text">
      🚫 No tournaments available right now. Stay tuned!
    </p>
  )}

</div>
</>

)

}

export default Tournament


