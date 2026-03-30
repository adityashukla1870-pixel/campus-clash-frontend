import { useNavigate } from "react-router-dom"

function LandingPage(){

const navigate = useNavigate()

return(

<div style={{
height:"100vh",
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(to right, #000000, #1a1a1a)",
color:"white",
textAlign:"center"
}}>

<h1 style={{fontSize:"40px", marginBottom:"10px"}}>
🎮 Campus Clash
</h1>

<p style={{marginBottom:"30px"}}>
Compete. Win. Dominate.
</p>

<div style={{display:"flex", gap:"20px"}}>

<button
onClick={()=>navigate("/login")}
style={{
padding:"12px 25px",
fontSize:"16px",
borderRadius:"8px",
cursor:"pointer"
}}
>
Login
</button>

<button
onClick={()=>navigate("/register")}
style={{
padding:"12px 25px",
fontSize:"16px",
borderRadius:"8px",
cursor:"pointer"
}}
>
Sign Up
</button>

</div>

</div>

)

}

export default LandingPage