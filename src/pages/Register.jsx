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

<div className="register-page">

  <div className="register-card">

    <h1>Campus Clash</h1>
    <p className="register-sub">Create your account</p>

    <input
      type="text"
      placeholder="Enter Username"
      onChange={(e)=>setUsername(e.target.value)}
    />

    <input
      type="email"
      placeholder="Enter Email"
      onChange={(e)=>setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Enter Password"
      onChange={(e)=>setPassword(e.target.value)}
    />

    <button onClick={handleRegister}>
      Register
    </button>

    <p className="login-text">
      Already have an account?
      <span onClick={()=>navigate("/login")}>
        Login
      </span>
    </p>

  </div>

</div>

)

}

export default Register