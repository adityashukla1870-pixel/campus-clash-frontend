import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TournamentDetails(){

const {id} = useParams()
const navigate = useNavigate()

const [tournament,setTournament] = useState(null)
const [paymentCode,setPaymentCode] = useState("")
const [utr,setUtr] = useState("")
const [file,setFile] = useState(null)
const [registrationId,setRegistrationId] = useState("")

useEffect(()=>{

const token = localStorage.getItem("token")

// tournament details
fetch(`http://127.0.0.1:5000/tournament/${id}`,{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
setTournament(data)
})


// generate payment code when page loads


fetch(`http://127.0.0.1:5000/tournament/register/${id}`,{
method:"POST",
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
setPaymentCode(data.payment_code)
setRegistrationId(data.registration_id)
})

},[])


const handleUpload = async ()=>{

const token = localStorage.getItem("token")

if(!file || !utr){
alert("Upload screenshot and enter UTR")
return
}

const formData = new FormData()

formData.append("file",file)
formData.append("utr",utr)

const res = await fetch(
`http://127.0.0.1:5000/tournament/upload-payment/${registrationId}`,
{
method:"POST",
headers:{
Authorization:`Bearer ${token}`
},
body:formData
})

const data = await res.json()

alert(data.message || "Payment Submitted")

navigate("/my-tournaments")

}


if(!tournament){
return <h2 style={{textAlign:"center"}}>Loading...</h2>
}

return(

<div style={{textAlign:"center"}}>

<h1>{tournament.name}</h1>

<p>Game: {tournament.game}</p>

<p>Entry Fee: ₹{tournament.entry_fee}</p>

<p>Prize Pool: ₹{tournament.prize_pool}</p>

<p>Players: {tournament.players.length} / {tournament.max_players}</p>

<hr/>

<h2>Payment Details</h2>

<p>UPI ID: campus@upi</p>

<p>Amount: ₹{tournament.entry_fee}</p>

<h3>Payment Code</h3>

<p style={{
fontSize:"22px",
fontWeight:"bold",
color:"red"
}}>
{paymentCode}
</p>

<p>⚠️ Copy this code and add it in the UPI payment note</p>

<button onClick={()=>{
navigator.clipboard.writeText(paymentCode)
alert("Payment code copied")
}}>
Copy Code
</button>
<hr/>

<h3>Upload Payment Screenshot</h3>

<input
type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<br/><br/>

<input
type="text"
placeholder="Enter UTR Number"
value={utr}
onChange={(e)=>setUtr(e.target.value)}
/>

<br/><br/>

<button onClick={handleUpload}>
Submit Payment
</button>

</div>

)

}

export default TournamentDetails