import { FaGamepad, FaArrowRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Reveal from "./Reveal"
import "./CTA.css"

function CTA() {
  const navigate = useNavigate()

  return (
    <section className="section cta-section">
      <Reveal direction="scale" className="cta-card shimmer-wrap">
        <h2>Ready to prove you're the best?</h2>
        <p>Join thousands of college gamers already competing for real prize money on Campus Clash.</p>
        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => navigate("/register")}>
            <FaGamepad /> Create Free Account
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            I already have an account <FaArrowRight />
          </button>
        </div>
      </Reveal>
    </section>
  )
}

export default CTA
