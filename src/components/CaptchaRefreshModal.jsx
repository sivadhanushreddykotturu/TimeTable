import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCredentials } from "../utils/storage";

export default function CaptchaRefreshModal({ onClose, onSuccess }) {
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
  }, []);

  const handleRefresh = async () => {
    const creds = getCredentials();
    if (!creds) {
      alert("No saved credentials. Please login again.");
      return onClose();
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
        alert(res.data.message || "Refresh failed");
        setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
        setCaptchaInput("");
      }
    } catch {
      alert("Error refreshing timetable");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Refresh Timetable</h3>
        <p style={{ fontSize: 14, marginBottom: 6 }}>Enter the new CAPTCHA:</p>

        <div style={captchaBoxStyle}>
          {captchaUrl ? (
            <img
              src={captchaUrl}
              alt="CAPTCHA"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <span>Loading CAPTCHA...</span>
          )}
        </div>

        <input
          placeholder="Type CAPTCHA"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          style={{ marginTop: 10, width: "100%", padding: 8 }}
        />

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleRefresh}>Submit</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  minWidth: 280,
  maxWidth: 320,
};

const captchaBoxStyle = {
  width: 150,
  height: 50,
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 8,
};
