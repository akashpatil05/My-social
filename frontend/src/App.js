// 📁 src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const AppLayout = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Dashboard />} />
        <Route path="/user/:username" element={<Profile />} /> {/* ✅ New Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppLayout />
      </Router>
    </UserProvider>
  );
}

export default App;