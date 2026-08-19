import { FaGamepad, FaArrowRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Reveal from "./Reveal"
import "./CTA.css"

function CTA() {
  const navigate = useNavigate()

  return (
    <section className="section cta-section">
      <Reveal direction="scale" className="cta-card shimmer-wrap">
        <h2>Ready to prove you're the best?</h2>
        <p>Register free, join a tournament, and start competing for real prize money on Campus Clash.</p>
        <div className="cta-buttons">
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/register")}
          >
            <FaGamepad /> Create Free Account
          </motion.button>
          <motion.button
            className="btn-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
          >
            I already have an account <FaArrowRight />
          </motion.button>
        </div>
      </Reveal>
    </section>
  )
}

export default CTA
