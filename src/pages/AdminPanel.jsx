import { useEffect, useState } from "react"

function AdminPanel(){

const [payments,setPayments] = useState([])

useEffect(()=>{

const token = localStorage.getItem("token")

fetch("http://127.0.0.1:5000/tournament/admin/pending-payments",{
headers:{
Authorization:`Bearer ${token}`
}
})
.then(res=>res.json())
.then(data=>{
console.log("ADMIN PAYMENTS:",data)
setPayments(data)
})

},[])


const approve = async(id)=>{

const token = localStorage.getItem("token")

await fetch(
`http://127.0.0.1:5000/tournament/admin/approve/${id}`,
{
method:"POST",
headers:{
Authorization:`Bearer ${token}`
}
}
)

alert("Payment Approved")

window.location.reload()

}


const reject = async(id)=>{

const token = localStorage.getItem("token")

await fetch(
`http://127.0.0.1:5000/tournament/admin/reject/${id}`,
{
method:"POST",
headers:{
Authorization:`Bearer ${token}`
}
}
)

alert("Payment Rejected")

window.location.reload()

}


return(

<div style={{textAlign:"center"}}>

<h1>Admin Payment Verification</h1>

{Array.isArray(payments) && payments.map((p)=>{

return(

<div key={p._id}
style={{
border:"1px solid black",
margin:"20px",
padding:"20px"
}}>

<h3>Registration ID</h3>

<p>{p._id}</p>

<p>UTR: {p.utr}</p>

<img
src={`http://127.0.0.1:5000/${p.screenshot.replace("\\","/")}`}
width="200"
/>

<br/><br/>

<button onClick={()=>approve(p._id)}>
Approve
</button>

<button onClick={()=>reject(p._id)}>
Reject
</button>

</div>

)

})}

</div>

)

}

export default AdminPanel