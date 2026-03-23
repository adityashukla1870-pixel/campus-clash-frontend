import { useState } from "react"

function AdminCreateTournament(){

const [name,setName] = useState("")
const [entryFee,setEntryFee] = useState("")
const [date,setDate] = useState("")
const [maxPlayers,setMaxPlayers] = useState("")
const [game,setGame] = useState("")

const handleSubmit = async ()=>{

const token = localStorage.getItem("token")

await fetch("http://127.0.0.1:5000/admin/create-tournament",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify({
name,
entry_fee: entryFee,
date,
max_players: maxPlayers,
game
})
})

alert("Tournament Created ✅")

}


return(

<div style={{textAlign:"center", padding:"30px"}}>

<h1>Create Tournament</h1>

<input
placeholder="Tournament Name"
onChange={(e)=>setName(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Entry Fee"
onChange={(e)=>setEntryFee(e.target.value)}
/>

<br/><br/>

<input
type="datetime-local"
onChange={(e)=>setDate(e.target.value)}
/>

<br/><br/>

<input
type="number"
placeholder="Max Players"
onChange={(e)=>setMaxPlayers(e.target.value)}
/>

<br/><br/>

<input
placeholder="Game (BGMI, Free Fire...)"
onChange={(e)=>setGame(e.target.value)}
/>

<br/><br/>

<button onClick={handleSubmit}>
Create Tournament
</button>

</div>

)

}

export default AdminCreateTournament