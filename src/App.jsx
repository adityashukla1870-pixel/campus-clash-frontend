import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { initAvatarLibrary } from "./data/avatarRepository";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ThemeProvider from "./theme/ThemeProvider";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Tournament = lazy(() => import("./pages/Tournament"));
const TournamentDetails = lazy(() => import("./pages/TournamentDetails"));
const MyTournaments = lazy(() => import("./pages/MyTournaments"));
const TournamentRoom = lazy(() => import("./pages/TournamentRoom"));
const Bracket = lazy(() => import("./pages/Bracket"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Community = lazy(() => import("./pages/Community"));
const StageStandings = lazy(() => import("./pages/StageStandings"));
const CrossPodStandings = lazy(() => import("./pages/CrossPodStandings"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminReleaseRoom = lazy(() => import("./pages/AdminReleaseRoom"));
const AdminCreateTournament = lazy(() => import("./pages/AdminCreateTournament"));
const AdminWinner = lazy(() => import("./pages/AdminWinner"));
const AdminBracket = lazy(() => import("./pages/AdminBracket"));
const AdminStages = lazy(() => import("./pages/AdminStages"));
const AdminCrossPod = lazy(() => import("./pages/AdminCrossPod"));
const AdminAvatarLibrary = lazy(() => import("./pages/AdminAvatarLibrary"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const AdminBGMILeague = lazy(() => import("./pages/AdminBGMILeague"));

function LoadingFallback() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#0a0a0f",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48,
          height: 48,
          border: "4px solid rgba(255,255,255,0.1)",
          borderTop: "4px solid #7c3aed",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ opacity: 0.7 }}>Loading...</p>
      </div>
    </div>
  );
}

function App() {

  useEffect(() => {
    initAvatarLibrary();
  }, []);

  return (

    <ThemeProvider>
    <Analytics />
    <Suspense fallback={<LoadingFallback />}>
    <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

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
        path="/tournament/:id/standings"
        element={
          <ProtectedRoute>
            <StageStandings/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournament/:id/cross-pod"
        element={
          <ProtectedRoute>
            <CrossPodStandings/>
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
      <Route path="/admin/stages" element={<AdminRoute><AdminStages /></AdminRoute>} />
      <Route path="/admin/cross-pod" element={<AdminRoute><AdminCrossPod /></AdminRoute>} />
      <Route path="/admin/avatars" element={<AdminRoute><AdminAvatarLibrary /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
      <Route path="/admin/bgmi-league" element={<AdminRoute><AdminBGMILeague /></AdminRoute>} />


    </Routes>
    </Suspense>
    </ThemeProvider>

  );
}

export default App;
