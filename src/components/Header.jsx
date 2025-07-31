import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clearCredentials, getCredentials } from "../../utils/storage.js";

export default function Header({ onRefresh }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on login page
  if (location.pathname === "/") return null;

  const handleLogout = () => {
    clearCredentials();
    localStorage.removeItem("timetable");
    navigate("/");
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "10px 20px", 
      borderBottom: "1px solid #ccc", 
      backgroundColor: "#f9f9f9" 
    }}>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  );
}
