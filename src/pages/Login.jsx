import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
  e.preventDefault();

  fetch("http://127.0.0.1:5000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(res => res.json())
  .then(data => {

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login Successful");
      navigate("/tournaments");
    } else {
      alert(data.error);
    }

  });
};

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>Campus Clash Login</h1>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <br/><br/>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
        <br/><br/>

        <button type="submit">Login</button>

        <br/><br/>

        <button type="button" onClick={()=>navigate("/register")}>
          New User? Register
        </button>

      </form>
    </div>
  );
}

export default Login;



