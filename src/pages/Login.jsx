import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Login(){

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const res = await API.post("/auth/login", {
      email,
      password,
    });

    const data = res.data;

    console.log("LOGIN RESPONSE:", data);

    if (data.token) {

      localStorage.setItem("token", data.token);

      const decoded = JSON.parse(
        atob(data.token.split(".")[1])
      );

      console.log("DECODED TOKEN:", decoded);

      if (decoded.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/tournaments");
      }

    }

  } catch (err) {

    console.error(err);

    alert(
      err.response?.data?.msg ||
      "Login Failed"
    );

  }

};



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



