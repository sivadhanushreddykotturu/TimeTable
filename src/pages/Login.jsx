import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveCredentials } from "../../utils/storage.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");

  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaUrl(`https://tinyurl.com/klcaptcha?ts=${Date.now()}`);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

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
    <div style={{ padding: 20 }}>
      <h2>Login to ERP</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 20 }}
      />

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, marginBottom: 6, color: "#555" }}>
          CAPTCHA takes 5–6 seconds to load. Please wait...
        </p>

        <div
          style={{
            width: 150,
            height: 50,
            backgroundColor: "#f0f0f0",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #ccc",
          }}
        >
          {captchaUrl ? (
            <img
              src={captchaUrl}
              alt="CAPTCHA"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <span>Loading...</span>
          )}
        </div>

        <button
          onClick={refreshCaptcha}
          style={{
            marginBottom: 10,
            padding: "4px 10px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Reload CAPTCHA
        </button>

        <input
          placeholder="Enter CAPTCHA"
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          style={{ display: "block", width: "200px" }} // Adjusted width to 200px
        />
      </div>

      <button onClick={handleLogin} style={{ marginTop: 10 }}>
        Login
      </button>
    </div>
  );
}