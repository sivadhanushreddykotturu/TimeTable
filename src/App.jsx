import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/Login.jsx";
import HomePage from "./pages/Home.jsx";
import TimetablePage from "./pages/TimetableView.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
