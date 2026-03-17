import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Tournament(){

const navigate = useNavigate();
const [tournaments,setTournaments] = useState([]);
const [userId,setUserId] = useState("");

useEffect(()=>{

const token = localStorage.getItem("token")

if(!token){
navigate("/")
return
}

const decoded = jwtDecode(token)

setUserId(decoded.sub)

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

},[])

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

<div style={{textAlign:"center"}}>

<h1>Tournaments</h1>

<button onClick={handleLogout}>
Logout
</button>

<button onClick={()=>navigate("/my-tournaments")}>
My Tournaments
</button>

{Array.isArray(tournaments) && tournaments.map((t)=>{

const alreadyJoined = t.players?.includes(userId)
const isFull = t.players.length >= t.max_players

return(

<div key={t.id}
style={{
border:"1px solid black",
margin:"20px",
padding:"20px"
}}
>

<h3>{t.name}</h3>

<p>Game: {t.game}</p>

<p>
Players: {t.players.length} / {t.max_players}
</p>

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

)

}

export default Tournament


