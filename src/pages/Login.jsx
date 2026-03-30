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

<div className="login-page">

  <div className="login-card">

    <h1>Campus Clash</h1>
    <p className="login-sub">Login to continue</p>

    <form onSubmit={handleLogin}>

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

      <button type="submit">
        Login
      </button>

    </form>

    <p className="register-text">
      New user? 
      <span onClick={()=>navigate("/register")}>
        Register
      </span>
    </p>

  </div>

</div>

)

}

export default Login



