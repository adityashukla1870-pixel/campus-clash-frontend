import { useEffect, useState } from "react"
import API from "../api/axios";

function AdminReleaseRoom(){

const [tournaments,setTournaments] = useState([])
const [selectedId,setSelectedId] = useState("")
const [roomId,setRoomId] = useState("")
const [password,setPassword] = useState("")
const [matchTime,setMatchTime] = useState("")

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


// submit
if(
  !selectedId ||
  !roomId ||
  !password ||
  !matchTime
){
  alert("Fill all fields");
  return;
}
const handleSubmit = async ()=>{

const formattedTime = new Date(matchTime).toISOString();

await API.post(
  `/tournament/admin/release-room/${selectedId}`,
  {
    room_id: roomId,
    password: password,
    start_time: formattedTime
  }
);

alert("Room Released ✅")

}


// UI
return(

<div style={{textAlign:"center", padding:"30px"}}>

<h1>Release Room</h1>

{/* Tournament Dropdown */}
<select onChange={(e)=>setSelectedId(e.target.value)}>
<option>Select Tournament</option>

{tournaments.map(t=>(
<option key={t._id} value={t._id}>
{t.name}
</option>
))}

</select>

<br/><br/>

<input
placeholder="Room ID"
onChange={(e)=>setRoomId(e.target.value)}
/>

<br/><br/>

<input
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<br/><br/>

<input
type="datetime-local"
onChange={(e)=>setMatchTime(e.target.value)}
/>

<br/><br/>

<button onClick={handleSubmit}>
Release Room
</button>

</div>

)

}

export default AdminReleaseRoom