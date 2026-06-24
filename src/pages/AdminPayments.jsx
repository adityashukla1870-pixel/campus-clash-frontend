import { useEffect, useState } from "react"
import API from "../api/axios";

function AdminPayments(){

const [payments,setPayments] = useState([])

useEffect(()=>{

API.get("/tournament/admin/pending-payments")
.then(res=>{
  console.log("ADMIN PAYMENTS:", res.data)
  setPayments(res.data)
})
.catch(err=>{
  console.error(err)
})

},[])


const approve = async(id)=>{
await API.post(
  `/tournament/admin/approve/${id}`
)
alert("Payment Approved")

setPayments(prev =>
  prev.filter(payment => payment._id !== id)
)

}


const reject = async(id)=>{

await API.post(
  `/tournament/admin/reject/${id}`
)

alert("Payment Rejected")

setPayments(prev =>
  prev.filter(payment => payment._id !== id)
)

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

{p.screenshot ? (
  <img
  src={`${import.meta.env.VITE_API_URL}/${p.screenshot.replace("\\", "/")}`}
  width="200"
/>
) : (
  <p>No Screenshot</p>
)}

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

export default AdminPayments