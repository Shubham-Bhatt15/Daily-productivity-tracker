import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage"; // Add your homepage
import Dashboard from './pages/Dashboard';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<HomePage />} /> {/* Home/dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
  );
}

export default App;
