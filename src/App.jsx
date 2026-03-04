import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Tournament from "./pages/Tournament";

function App() {
  return (
    
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register/>}/>
      <Route path="/tournaments" element={<Tournament/>} />
    </Routes>
    
  );
}

export default App;





