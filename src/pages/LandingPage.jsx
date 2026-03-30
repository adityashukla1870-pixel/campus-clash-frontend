import { useNavigate } from "react-router-dom"
import "./LandingPage.css"

function LandingPage(){

const navigate = useNavigate()

return(

<div className="landing">

  <div className="hero">

    <h1>🎮 Campus Clash</h1>

    <p className="tagline">
      The Ultimate College Esports Arena
    </p>

    <p className="desc">
      Join thrilling esports tournaments, compete with top players,
      and prove your skills. From casual matches to high-stakes battles —
      Campus Clash is your arena.
    </p>

    <div className="buttons">

      <button className="primary" onClick={()=>navigate("/login")}>
        Login
      </button>

      <button className="secondary" onClick={()=>navigate("/register")}>
        Sign Up
      </button>

    </div>

  </div>

</div>

)

}

export default LandingPage