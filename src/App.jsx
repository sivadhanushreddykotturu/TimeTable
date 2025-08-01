import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthGuard from "./components/AuthGuard.jsx";
import Footer from "./components/Footer.jsx";
import LoginPage from "./pages/Login.jsx";
import HomePage from "./pages/Home.jsx";
import TimetablePage from "./pages/TimetableView.jsx";
import SubjectsPage from "./pages/Subjects.jsx";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-wrapper">
          <Routes>
            <Route path="/" element={
              <AuthGuard>
                <LoginPage />
              </AuthGuard>
            } />
            <Route path="/home" element={<HomePage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
