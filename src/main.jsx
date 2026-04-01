import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import "./index.css"
import "./pages/Login.css"
import "./pages/LandingPage.css"
import "./pages/Register.css"
import "./pages/Tournament.css"
import "./pages/MyTournament.css"
import "./pages/TournamentDetails.css"



ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)




