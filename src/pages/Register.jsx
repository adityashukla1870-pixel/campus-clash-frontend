import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [college,setCollege] = useState("");
const [gameUID,setGameUID] = useState("");

const handleRegister = (e)=>{

e.preventDefault()

fetch("http://127.0.0.1:5000/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name:name,
email:email,
password:password,
college:college,
game_uid:gameUID
})

})
.then(res=>res.json())
.then(data=>{

alert(data.message || data.error)

if(data.message){
navigate("/")
}

})

}

return(

<div style={{textAlign:"center",marginTop:"100px"}}>

<h1>Register</h1>

<form onSubmit={handleRegister}>

<input
placeholder="Name"
onChange={(e)=>setName(e.target.value)}
/>

<br/><br/>

<input
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

<input
placeholder="College"
onChange={(e)=>setCollege(e.target.value)}
/>

<br/><br/>

<input
placeholder="Game UID"
onChange={(e)=>setGameUID(e.target.value)}
/>

<br/><br/>

<button type="submit">
Register
</button>

<br/><br/>

<button type="button" onClick={()=>navigate("/")}>
Already registered? Login
</button>

</form>

</div>

)

}

export default Register