import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login(){

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleLogin = (e)=>{

e.preventDefault()

fetch("http://127.0.0.1:5000/auth/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email,
password:password
})

})
.then(res=>res.json())
.then(data => {

console.log("LOGIN RESPONSE:", data)

if(data.token){

localStorage.setItem("token", data.token)

const decoded = JSON.parse(atob(data.token.split(".")[1]))
console.log("DECODED TOKEN:", decoded)

if(decoded.role === "admin"){
navigate("/admin")
}else{
navigate("/tournaments")
}

}

})

}

return(

<div style={{textAlign:"center",marginTop:"100px"}}>

<h1>Campus Clash Login</h1>

<form onSubmit={handleLogin}>

<input
type="email"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<br/><br/>

<input
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<br/><br/>

<button type="submit">
Login
</button>

<br/><br/>

<button type="button" onClick={()=>navigate("/register")}>
New user? Register
</button>

</form>

</div>

)

}

export default Login



