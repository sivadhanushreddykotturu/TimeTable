import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveCredentials } from "../../utils/storage.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);

  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaLoading(true);
    setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleCaptchaLoad = () => {
    setCaptchaLoading(false);
  };

  const handleCaptchaError = () => {
    setCaptchaLoading(false);
  };

  const handleLogin = async () => {
    if (!username || !password || !captcha) {
      alert("Fill all fields.");
      return;
    }

    const form = new FormData();
    form.append("username", username);
    form.append("password", password);
    form.append("captcha", captcha);
    form.append("academic_year_code", "19");
    form.append("semester_id", "1");

    try {
      const res = await axios.post("https://tinyurl.com/klfetcht", form);
      if (res.data.success) {
        saveCredentials({ username, password });
        localStorage.setItem("timetable", JSON.stringify(res.data.timetable));
        navigate("/home");
      } else {
        alert(res.data.message || "Login failed.");
        refreshCaptcha();
      }
    } catch (err) {
      alert("Something went wrong.");
      refreshCaptcha();
    }
  };

  return (
    <>
      <div className="login-header">
        <div className="login-header-content">
          <h1>KL Timetable PWA</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="container">
        <div className="text-center mb-20">
          <h1>Login to ERP</h1>
        </div>

        <div className="card">
          <div className="mb-16">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-16"
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-20"
            />
          </div>

          <div className="captcha-container">
            <p className="mb-16">
              CAPTCHA takes 5–6 seconds to load. Please wait...
            </p>

            <div
              style={{
                width: "150px",
                height: "50px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-tertiary)",
              }}
            >
              <img
                src={captchaUrl}
                alt="CAPTCHA"
                className="captcha-image"
                style={{ maxWidth: "100%", maxHeight: "100%", display: captchaLoading ? "none" : "block" }}
                onLoad={handleCaptchaLoad}
                onError={handleCaptchaError}
              />
              {captchaLoading && <span>Loading CAPTCHA...</span>}
            </div>

            <button
              onClick={refreshCaptcha}
              className="mb-16"
              style={{ fontSize: "14px", padding: "8px 16px" }}
            >
              Reload CAPTCHA
            </button>

            <input
              placeholder="Enter CAPTCHA"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              className="captcha-input"
            />
          </div>

          <button onClick={handleLogin} className="primary full-width-mobile">
            Login
          </button>
        </div>
      </div>
    </>
  );
}
