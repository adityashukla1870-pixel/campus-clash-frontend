import { useEffect, useState } from "react"

function AdminWinner(){

const [tournaments,setTournaments] = useState([])
const [selectedTournament,setSelectedTournament] = useState("")
const [participants,setParticipants] = useState([])
const [selectedWinner,setSelectedWinner] = useState("")

// fetch tournaments
useEffect(()=>{
const token = localStorage.getItem("token")

fetch("http://127.0.0.1:5000/tournament/all",{
headers:{ Authorization:`Bearer ${token}` }
})
.then(res=>res.json())
.then(data=>setTournaments(data))

},[])


// fetch participants when tournament selected
useEffect(()=>{

if(!selectedTournament) return

const token = localStorage.getItem("token")

fetch(`http://127.0.0.1:5000/tournament/participants/${selectedTournament}`,{
headers:{ Authorization:`Bearer ${token}` }
})
.then(res=>res.json())
.then(data=>setParticipants(data))

},[selectedTournament])


// submit winner
const handleSubmit = async ()=>{

const token = localStorage.getItem("token")

const res = await fetch("http://127.0.0.1:5000/tournament/admin/declare-winner",{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify({
tournament_id: selectedTournament,
winner_id: selectedWinner
})
})

const data = await res.json()
alert(data.message || data.error)

}

return(

<div style={{textAlign:"center"}}>

<h1>Declare Winner</h1>

{/* Tournament Dropdown */}
<select onChange={(e)=>setSelectedTournament(e.target.value)}>
<option>Select Tournament</option>

{tournaments.map(t=>(
<option key={t.id} value={t.id}>
{t.name}
</option>
))}

</select>

<br/><br/>

{/* Participants */}
<select onChange={(e)=>setSelectedWinner(e.target.value)}>
<option>Select Winner</option>

{participants.map(p=>(
<option key={p.user_id} value={p.user_id}>
{p.username}
</option>
))}

</select>

<br/><br/>

<button onClick={handleSubmit}>
Declare Winner
</button>

</div>

)

}

export default AdminWinner