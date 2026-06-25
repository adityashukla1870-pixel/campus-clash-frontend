import { useState } from "react"
import API from "../api/axios";

function AdminCreateTournament(){

const [name,setName] = useState("")
const [entryFee,setEntryFee] = useState("")
const [date,setDate] = useState("")
const [maxPlayers,setMaxPlayers] = useState("")
const [game,setGame] = useState("")
const [prizePool, setPrizePool] = useState("")

const handleSubmit = async () => {

  console.log("CLICKED")

  try {

  const res = await API.post(
    "/tournament/create",
    {
      name,
      game,
      entry_fee: Number(entryFee),
      prize_pool: Number(prizePool),
      max_players: Number(maxPlayers)
    }
  );

  const data = res.data;
    console.log("RESPONSE:", data)

    alert(data.message || data.error)

  } catch (err) {
    console.error("ERROR:", err)
  }
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
placeholder="Prize Pool"
onChange={(e)=>setPrizePool(e.target.value)}
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