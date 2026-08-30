import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client"

function GoogleSignIn() {
  const btnRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true)
    try {
      const res = await API.post("/auth/google", {
        credential: response.credential,
      })
      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
      window.location.reload()
    } catch (err) {
      console.error("Google auth failed:", err)
      alert(err.response?.data?.error || "Google login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function renderGoogleButton() {
      if (!window.google || !btnRef.current) return false
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        })
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 300,
        })
        return true
      } catch {
        return false
      }
    }

    if (renderGoogleButton()) return

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    if (existingScript) {
      if (window.google) { renderGoogleButton(); return }
      existingScript.addEventListener("load", () => renderGoogleButton(), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => renderGoogleButton()
    document.head.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [handleCredentialResponse])

  return (
    <div className="google-signin-wrapper">
      {loading && <div className="google-signin-loading">Signing in...</div>}
      <div ref={btnRef} className="google-signin-btn" />
    </div>
  )
}

export default GoogleSignIn
