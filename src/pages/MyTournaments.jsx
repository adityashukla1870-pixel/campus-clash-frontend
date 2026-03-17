import { useEffect, useState } from "react"

function MyTournaments(){

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

<div style={{textAlign:"center"}}>

<h1>My Tournaments</h1>

{tournaments.length === 0 && (
<p>No tournaments joined yet</p>
)}

{tournaments.map((t)=>{

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

<p>Entry Fee: ₹{t.entry_fee}</p>

<p>Prize Pool: ₹{t.prize_pool}</p>

<p>Status: {t.status}</p>

</div>

)

})}

</div>

)

}

export default MyTournaments