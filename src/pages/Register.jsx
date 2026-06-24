import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");


  const handleRegister = async (e) => {

    e.preventDefault();

    if (
      !name ||
      !email ||
      !password ||
      !college 
    ) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        college,
        
      });

      const data = res.data;

      alert(data.message || "Registration Successful");

      navigate("/");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.error ||
        err.response?.data?.msg ||
        "Registration Failed"
      );

    }

  };

  return (

    <div className="register-page">

      <div className="register-card">

        <h1>Campus Clash</h1>

        <p className="register-sub">
          Create your account
        </p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Enter Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter College Name"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />

          

          <button
            type="submit"
            disabled={
              !name ||
              !email ||
              !password ||
              !college 
            }
          >
            Register
          </button>

        </form>

        <p className="login-text">
          Already have an account?

          <span onClick={() => navigate("/login")}>
            Login
          </span>

        </p>

      </div>

    </div>

  );

}

export default Register;