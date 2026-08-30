import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleSignIn() {
  const btnRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function initGoogle() {
      if (!window.google) return false
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
    }

    if (initGoogle()) return

    const interval = setInterval(() => {
      if (initGoogle()) clearInterval(interval)
    }, 200)

    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [])

  async function handleCredentialResponse(response) {
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
  }

  return (
    <div className="google-signin-wrapper">
      {loading && <div className="google-signin-loading">Signing in...</div>}
      <div ref={btnRef} className="google-signin-btn" />
    </div>
  )
}

export default GoogleSignIn