import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tournament from "./pages/Tournament";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import TournamentDetails from "./pages/TournamentDetails";
import MyTournaments from "./pages/MyTournaments"
import TournamentRoom from "./pages/TournamentRoom";
import Bracket from "./pages/Bracket";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Community from "./pages/Community";

import AdminDashboard from "./pages/AdminDashboard"
import AdminPayments from "./pages/AdminPayments"
import AdminReleaseRoom from "./pages/AdminReleaseRoom"
import AdminCreateTournament from "./pages/AdminCreateTournament"
import AdminWinner from "./pages/AdminWinner"
import AdminBracket from "./pages/AdminBracket"


function App() {

  // When the browser restores a page from the back/forward cache (bfcache),
  // it repaints the exact frozen DOM instead of re-running React's route
  // guards — so a stale "logged in" or "logged out" view can flash on
  // screen. Forcing a reload on restore makes every back/forward navigation
  // re-check localStorage fresh, so Login/ProtectedRoute/AdminRoute always
  // reflect the real auth state.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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

      <Route
        path="/tournament/:id/bracket"
        element={
          <ProtectedRoute>
            <Bracket/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community/>
          </ProtectedRoute>
        }
      />

      <Route
  path="/my-tournaments"
  element={
    <ProtectedRoute>
      <MyTournaments key="mytournaments" />
    </ProtectedRoute>
  }
/>
      <Route
        path="/room/:id"
        element={
          <ProtectedRoute>
            <TournamentRoom/>
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
      <Route path="/admin/release-room" element={<AdminRoute><AdminReleaseRoom /></AdminRoute>} />
      <Route path="/admin/create-tournament" element={<AdminRoute><AdminCreateTournament /></AdminRoute>} />
      <Route path="/admin/winner" element={<AdminRoute><AdminWinner /></AdminRoute>} />
      <Route path="/admin/bracket" element={<AdminRoute><AdminBracket /></AdminRoute>} />


    </Routes>

  );
}

export default App;
