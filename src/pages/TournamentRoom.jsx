import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function TournamentRoom(){

const {id} = useParams()

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

if(!room){
return <h2>Loading...</h2>
}

return(

<div style={{textAlign:"center"}}>

<h1>Match Room</h1>

{room.room_id ? (

<div>

<h2>Room ID: {room.room_id}</h2>

<h2>Password: {room.room_password}</h2>

</div>

):(

<h3>Room not released yet</h3>

)}

</div>

)

}

export default TournamentRoom