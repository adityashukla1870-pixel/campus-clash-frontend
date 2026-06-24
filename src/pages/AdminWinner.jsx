import { useEffect, useState } from "react"
import API from "../api/axios";

function AdminWinner(){

const [tournaments,setTournaments] = useState([])
const [selectedTournament,setSelectedTournament] = useState("")
const [participants,setParticipants] = useState([])
const [selectedWinner,setSelectedWinner] = useState("")

// fetch tournaments
useEffect(()=>{
API.get("/tournament/all")
.then(res=>{
  setTournaments(res.data)
})
.catch(err=>{
  console.error(err)
})

},[])


// fetch participants when tournament selected
useEffect(()=>{

if(!selectedTournament) return

API.get(`/tournament/participants/${selectedTournament}`)
.then(res=>{
  setParticipants(res.data)
})
.catch(err=>{
  console.error(err)
})

},[selectedTournament])


// submit winner
const handleSubmit = async ()=>{

const res = await API.post(
  "/tournament/admin/declare-winner",
  {
    tournament_id: selectedTournament,
    winner_id: selectedWinner
  }
);

const data = res.data;
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