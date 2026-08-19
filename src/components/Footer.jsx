import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"
import { FiCrosshair, FiMonitor } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import "./Footer.css"

function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-icon"><FiCrosshair /></div>
            Campus <span className="logo-text-clash">Clash</span>
          </div>
          <p>India's college esports platform — compete, climb, and get paid for being the best.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Discord"><FaDiscord /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Platform</h4>
          <span onClick={() => navigate("/")}>Home</span>
          <span onClick={() => navigate("/login")}>Login</span>
          <span onClick={() => navigate("/register")}>Register</span>
        </div>

        <div className="footer-col">
          <h4>Games</h4>
          <span>BGMI</span>
          <span>Valorant</span>
          <span>Free Fire</span>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <span>Help Center</span>
          <span>Rules & Fair Play</span>
          <span>Contact Us</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Campus Clash. All rights reserved.</p>
        <p>Built for competitive college gamers <FiMonitor /></p>
      </div>
    </footer>
  )
}

export default Footer
