import { useNavigate } from "react-router-dom"

function AdminDashboard(){

const navigate = useNavigate()

return(

<div style={{textAlign:"center", padding:"40px"}}>

<h1>Admin Dashboard</h1>

<div style={{
display:"flex",
flexDirection:"column",
gap:"20px",
maxWidth:"300px",
margin:"auto"
}}>

<button onClick={()=>navigate("/admin/payments")}>
💰 Payment Verification
</button>

<button onClick={()=>navigate("/admin/release-room")}>
🎮 Release Room
</button>

<button onClick={()=>navigate("/admin/create-tournament")}>
🏆 Create Tournament
</button>

<button onClick={()=>navigate("/admin/winner")}>
🥇 Declare Winner
</button>

</div>

</div>

)

}

export default AdminDashboard