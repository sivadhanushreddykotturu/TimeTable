import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCredentials } from "../../utils/storage.js";

export default function CaptchaModal({ isOpen, onClose, onSuccess }) {
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCaptchaInput("");
      setError("");
      setImageLoading(true);
      
      // Use the exact same URL pattern as Login.jsx
      const url = `https://tinyurl.com/klcaptcha?ts=${Date.now()}`;
      console.log("Loading CAPTCHA from URL:", url);
      setCaptchaUrl(url);
      
      // Add a timeout to handle cases where image takes too long
      const timeout = setTimeout(() => {
        console.log("CAPTCHA image loading timeout");
        setImageLoading(false);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!captchaInput.trim()) {
      setError("Please enter the CAPTCHA");
      return;
    }

    setIsLoading(true);
    setError("");

    const creds = getCredentials();
    if (!creds) {
      setError("Session expired. Please log in again.");
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    form.append("username", creds.username);
    form.append("password", creds.password);
    form.append("captcha", captchaInput);
    form.append("academic_year_code", "19");
    form.append("semester_id", "1");

    try {
      const res = await axios.post("https://tinyurl.com/klfetcht", form);
      if (res.data.success) {
        localStorage.setItem("timetable", JSON.stringify(res.data.timetable));
        onSuccess(res.data.timetable);
        onClose();
      } else {
        setError(res.data.message || "Invalid CAPTCHA. Please try again.");
        // Refresh captcha image
        setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
        setCaptchaInput("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
      setCaptchaInput("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCaptcha = () => {
    setRefreshing(true);
    setImageLoading(true);
    setError("");
    
    const url = `https://tinyurl.com/klcaptcha?ts=${Date.now()}`;
    console.log("Refreshing CAPTCHA from URL:", url);
    setCaptchaUrl(url);
    setCaptchaInput("");
    
    // Show refreshing message for 15 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 15000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
          Enter CAPTCHA to Refresh
        </h3>
        
                 <div style={{ marginBottom: "20px" }}>
           <div
             style={{
               width: "150px",
               height: "50px",
               border: "1px solid #ddd",
               borderRadius: "4px",
               margin: "0 auto 15px",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               backgroundColor: "#f0f0f0",
             }}
           >
             {imageLoading ? (
               <span style={{ fontSize: "12px", color: "#666" }}>Loading...</span>
             ) : (
               <img
                 src={captchaUrl}
                 alt="CAPTCHA"
                 style={{
                   maxWidth: "100%",
                   maxHeight: "100%",
                 }}
                 onLoad={() => {
                   console.log("CAPTCHA image loaded successfully");
                   setImageLoading(false);
                 }}
                 onError={(e) => {
                   console.error("CAPTCHA image failed to load:", e);
                   setImageLoading(false);
                   setError("Failed to load CAPTCHA image");
                 }}
               />
             )}
           </div>
           
           {refreshing && (
             <div style={{ 
               fontSize: "12px", 
               color: "#007bff", 
               marginBottom: "10px",
               textAlign: "center"
             }}>
               wait for 15 seconds to load
             </div>
           )}
           
           <button
             onClick={handleRefreshCaptcha}
             style={{
               background: "none",
               border: "1px solid #007bff",
               color: "#007bff",
               padding: "5px 10px",
               borderRadius: "4px",
               cursor: "pointer",
               fontSize: "12px",
             }}
             disabled={isLoading || refreshing}
           >
             Refresh CAPTCHA
           </button>
         </div>

        <input
          type="text"
          placeholder="Enter CAPTCHA"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "16px",
            marginBottom: "15px",
            boxSizing: "border-box",
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isLoading}
        />

        {error && (
          <div
            style={{
              color: "#dc3545",
              fontSize: "14px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 