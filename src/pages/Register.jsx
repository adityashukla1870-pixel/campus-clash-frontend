import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");
const [collegeId,setCollegeId] = useState("");

const handleRegister = () => {

fetch("http://127.0.0.1:5000/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:name,
email:email,
password:password,
college_id:collegeId

})

})
.then(res=>res.json())
.then(data=>{

alert(data.message)

if(data.message==="Registration Successful"){

navigate("/")

}

})

}

return(

<div>

<h1>Register - Campus Clash</h1>

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
placeholder="College ID"
onChange={(e)=>setCollegeId(e.target.value)}
/>

<br/><br/>

<button onClick={handleRegister}>
Register
</button>

<br/><br/>

<button onClick={()=>navigate("/")}>
Already have account? Login
</button>

</div>

)

}

export default Register;