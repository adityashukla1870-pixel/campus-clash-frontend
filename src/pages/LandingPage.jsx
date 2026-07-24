import { motion } from "framer-motion"
import Hero from "../components/Hero"
import Stats from "../components/Stats"
import "./LandingPage.css"

function LandingPage() {
  return (
    <motion.div
      className="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Hero />
      <Stats />
    </motion.div>
  )
}

export default LandingPage
