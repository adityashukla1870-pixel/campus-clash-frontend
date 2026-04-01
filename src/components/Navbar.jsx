import { useNavigate } from "react-router-dom"
import "./Navbar.css"

function Navbar(){

  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return(

    <div className="navbar">

      {/* LOGO */}
      <h2
        className="logo"
        onClick={()=>{
          if(token){
            navigate("/tournaments")
          } else {
            navigate("/")
          }
        }}
      >
        🎮 Campus Clash
      </h2>

      {/* NAV LINKS */}
      <div className="nav-links">

        {token && (
          <>
            <span onClick={()=>navigate("/tournaments")}>
              Tournaments
            </span>

            <span onClick={()=>navigate("/my-tournaments")}>
              My Tournaments
            </span>

            <span onClick={handleLogout}>
              Logout
            </span>
          </>
        )}

        {!token && (
          <>
            <span onClick={()=>navigate("/login")}>
              Login
            </span>

            <span onClick={()=>navigate("/register")}>
              Register
            </span>
          </>
        )}

      </div>

    </div>

  )
}

export default Navbar