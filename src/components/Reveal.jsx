import { useRef } from "react"
import { motion, useInView } from "framer-motion"

/**
 * Reveal — scroll-triggered entrance animation wrapper, powered by Framer Motion.
 * Same public API as before (children, className, as, delay, direction, ...rest)
 * so every existing usage across the app keeps working unchanged.
 */
const VARIANTS = {
  up:    { hidden: { opacity: 0, y: 36 },  visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -36 }, visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -36 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 36 },  visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
}

function Reveal({ children, className = "", as = "div", delay = 0, direction = "up", ...rest }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15, margin: "0px 0px -60px 0px" })
  const MotionTag = motion[as] || motion.div

  return (
    <MotionTag
      ref={ref}
      className={`reveal reveal-${direction} ${inView ? "reveal-visible" : ""} ${className}`}
      variants={VARIANTS[direction] || VARIANTS.up}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.65, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export default Reveal
