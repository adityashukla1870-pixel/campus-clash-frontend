import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import API from "../api/axios";

function TournamentRoom(){

const {id} = useParams()
const [timeLeft, setTimeLeft] = useState("");
const [room,setRoom] = useState(null)

useEffect(()=>{

API.get(`/tournament/room/${id}`)
.then(res=>{
  setRoom(res.data)
})
.catch(err=>{
  console.error(err)
})

},[id])


useEffect(() => {
  if (!room || !room.room_id) return;

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const matchTime = new Date(room.match_start_time).getTime();

    const diff = matchTime - now;

    if (diff <= 0) {
      setTimeLeft("Match Started 🚀");
      clearInterval(interval);
      return;
    }

    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setTimeLeft(`${minutes}m ${seconds}s`);
  }, 1000);

  return () => clearInterval(interval);
}, [room]);


if(!room){
  return (
    <h2 style={{textAlign:"center"}}>
      Loading Room...
    </h2>
  )
}

return(

<div style={{textAlign:"center"}}>

<h1>Match Room</h1>

{!room?.room_id ? (
  <p style={{color:"yellow"}}>
    ⏳ Waiting for admin to release room...
  </p>
) : (
  <div style={{background:"black", color:"white", padding:"20px", borderRadius:"10px"}}>
    <h3>Room ID: {room.room_id}</h3>
    <h3>Password: {room.room_password}</h3>

    <h2>⏳ Match starts in:</h2>
    <p>{timeLeft}</p>
  </div>
)}

</div>

)

}

export default TournamentRoom