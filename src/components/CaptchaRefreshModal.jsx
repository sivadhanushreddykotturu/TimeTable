import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCredentials } from "../utils/storage";

export default function CaptchaRefreshModal({ onClose, onSuccess }) {
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);

  useEffect(() => {
    setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
  }, []);

  const handleCaptchaLoad = () => {
    setCaptchaLoading(false);
  };

  const handleCaptchaError = () => {
    setCaptchaLoading(false);
  };

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          minWidth: 280,
          maxWidth: 320,
          margin: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Refresh Timetable</h3>
        <p className="mb-16">Enter the new CAPTCHA:</p>

        <div className="captcha-container">
          {captchaLoading ? (
            <div className="captcha-loading">
              Loading CAPTCHA...
            </div>
          ) : (
            <img
              src={captchaUrl}
              alt="CAPTCHA"
              className="captcha-image"
              onLoad={handleCaptchaLoad}
              onError={handleCaptchaError}
            />
          )}

          <input
            placeholder="Type CAPTCHA"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="captcha-input"
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
          <button onClick={handleRefresh} className="primary">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
