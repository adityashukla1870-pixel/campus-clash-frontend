import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage"
import Login from "./pages/login";
import Register from "./pages/Register";
import Tournament from "./pages/Tournament";
import ProtectedRoute from "./components/ProtectedRoute";
import TournamentDetails from "./pages/TournamentDetails";
import MyTournaments from "./pages/MyTournaments"
import TournamentRoom from "./pages/TournamentRoom";

import AdminDashboard from "./pages/AdminDashboard"
import AdminPayments from "./pages/AdminPayments"
import AdminReleaseRoom from "./pages/AdminReleaseRoom"
import AdminCreateTournament from "./pages/AdminCreateTournament"
import AdminWinner from "./pages/AdminWinner"


function App() {

  return (

    <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/tournaments"
        element={
          <ProtectedRoute>
            <Tournament />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournament/:id"
        element={
          <ProtectedRoute>
            <TournamentDetails/>
          </ProtectedRoute>
        }
      />
      
      <Route path="/my-tournaments" element={<MyTournaments/>} />
      <Route path="/room/:id" element={<TournamentRoom/>}/>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/release-room" element={<AdminReleaseRoom />} />
      <Route path="/admin/create-tournament" element={<AdminCreateTournament />} />
      <Route path="/admin/winner" element={<AdminWinner />} />
      

    </Routes>

  );
}

export default App;





