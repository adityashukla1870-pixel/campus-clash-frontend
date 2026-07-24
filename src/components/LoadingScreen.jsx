import { motion } from "framer-motion"
import { Swords } from "lucide-react"
import "./LoadingScreen.css"

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="loading-screen">
      <motion.div
        className="loading-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="loading-icon-wrap">
          <motion.div
            className="loading-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <Swords className="loading-icon" size={28} />
        </div>
        <motion.p
          className="loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
