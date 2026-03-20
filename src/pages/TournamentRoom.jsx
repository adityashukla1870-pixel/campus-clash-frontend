import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function TournamentRoom(){

const {id} = useParams()
const [timeLeft, setTimeLeft] = useState("");
const [room,setRoom] = useState(null)

useEffect(()=>{

const token = localStorage.getItem("token")

fetch(`http://127.0.0.1:5000/tournament/room/${id}`,{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
setRoom(data)
})

},[])


useEffect(() => {
  if (!roomData || !roomData.room_id) return;

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const matchTime = new Date(roomData.match_start_time).getTime();

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
}, [roomData]);

if(!room){
return <h2>Loading...</h2>
}

return(

<div style={{textAlign:"center"}}>

<h1>Match Room</h1>

{!roomData?.room_id ? (
  <p className="text-yellow-400">
    ⏳ Waiting for admin to release room...
  </p>
) : (
  <div className="bg-black p-4 rounded-xl text-center">
    <h3>Room ID: {roomData.room_id}</h3>
    <h3>Password: {roomData.room_password}</h3>

    <h2 className="mt-3">⏳ Match starts in:</h2>
    <p className="text-xl">{timeLeft}</p>
  </div>
)}

</div>

)

}

export default TournamentRoom