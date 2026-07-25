import { useEffect, useRef, useState } from "react"

/**
 * Reveal — purely presentational scroll-reveal wrapper.
 * Adds an "in-view" class once the element enters the viewport.
 * No app/business logic is affected; this only toggles CSS animation classes.
 */
function Reveal({ children, className = "", as: Tag = "div", delay = 0, direction = "up" }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  )
}

export default Reveal
