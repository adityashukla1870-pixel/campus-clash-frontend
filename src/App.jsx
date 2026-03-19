import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Tournament from "./pages/Tournament";
import ProtectedRoute from "./components/ProtectedRoute";
import TournamentDetails from "./pages/TournamentDetails";
import AdminPanel from "./pages/AdminPanel"
import MyTournaments from "./pages/MyTournaments"
import TournamentRoom from "./pages/TournamentRoom";

function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

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
      <Route path="/admin" element={<AdminPanel/>} />
      <Route path="/my-tournaments" element={<MyTournaments/>} />
      <Route path="/room/:id" element={<TournamentRoom/>}/>

    </Routes>

  );
}

export default App;





