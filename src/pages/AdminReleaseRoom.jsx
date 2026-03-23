import { useEffect, useState } from "react"

function AdminReleaseRoom(){

const [tournaments,setTournaments] = useState([])
const [selectedId,setSelectedId] = useState("")
const [roomId,setRoomId] = useState("")
const [password,setPassword] = useState("")
const [matchTime,setMatchTime] = useState("")

// fetch tournaments
useEffect(()=>{

const token = localStorage.getItem("token")

fetch("http://127.0.0.1:5000/tournament/all",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
setTournaments(data)
})

},[])


// submit
const handleSubmit = async ()=>{

const token = localStorage.getItem("token")

const formattedTime = new Date(matchTime).toISOString()

await fetch(`http://127.0.0.1:5000/tournament/create`,{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify({
room_id: roomId,
room_password: password,
match_start_time: formattedTime
})
})

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