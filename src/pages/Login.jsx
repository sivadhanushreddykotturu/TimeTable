import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveCredentials } from "../../utils/storage.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Toast from "../components/Toast.jsx";
import { getCaptchaUrl, getFormData, getAcademicYearCode, SEMESTER_MAP, API_CONFIG, getCurrentAcademicYearOptions } from "../config/api.js";
import { logIOSInfo, testFormDataSupport } from "../utils/iosDebug.js";

// iOS detection utility
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [semester, setSemester] = useState("odd");
  const [academicYear, setAcademicYear] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [networkStatus, setNetworkStatus] = useState("online");

  const navigate = useNavigate();

  // Network status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? "online" : "offline");
    };

          window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const refreshCaptcha = () => {
    setCaptchaLoading(true);
    setCaptchaUrl(getCaptchaUrl());
  };

  useEffect(() => {
    refreshCaptcha();
    // Set default academic year to current year
    const currentYear = new Date().getFullYear();
    setAcademicYear(`${currentYear}-${(currentYear + 1).toString().slice(-2)}`);

    // iOS debugging information
    if (isIOS()) {
      logIOSInfo();
      const formDataTest = testFormDataSupport();
      console.log('FormData Support Test:', formDataTest);
    }
  }, []);

  const handleCaptchaLoad = () => {
    setCaptchaLoading(false);
  };

  const handleCaptchaError = () => {
    setCaptchaLoading(false);
    setToast({
      show: true,
      message: "Failed to load CAPTCHA. Please try again.",
      type: "error",
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleLogin = async (retryCount = 0, useFormDataOnIOS = false) => {
    if (!username || !password || !captcha || !semester || !academicYear) {
      setToast({
        show: true,
        message: "Please fill all fields.",
        type: "error",
      });
      return;
    }

    if (captchaLoading) {
      setToast({
        show: true,
        message: "CAPTCHA is still loading. Please wait.",
        type: "error",
      });
      return;
    }

    if (isIOS() && !navigator.onLine) {
      setToast({
        show: true,
        message: "No internet connection. Please check your network and try again.",
        type: "error",
      });
      return;
    }

    if (isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UI feedback

      let requestData;
      let axiosConfig;

             if (isIOS() && !useFormDataOnIOS) {
         // Use JSON for iOS by default - convert to server-expected format
         requestData = {
           username,
           password,
           captcha,
           academic_year_code: getAcademicYearCode(academicYear),
           semester_id: SEMESTER_MAP[semester],
         };
        axiosConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
          withCredentials: false,
        };
      } else {
        // Use FormData for Android (unchanged) and iOS fallback
        requestData = getFormData(username, password, captcha, semester, academicYear);
        axiosConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json, text/plain, */*',
          },
          timeout: isIOS() ? 30000 : 15000,
          withCredentials: false,
        };
      }

             // Log request for debugging
       console.log('Request method:', isIOS() && !useFormDataOnIOS ? 'JSON' : 'FormData');
       console.log('Request data:', isIOS() && !useFormDataOnIOS ? requestData : [...requestData.entries()]);
       console.log('Request URL:', API_CONFIG.FETCH_URL);
       console.log('Request headers:', axiosConfig.headers);

      const res = await axios.post(API_CONFIG.FETCH_URL, requestData, axiosConfig);

      console.log('Response status:', res.status);
      console.log('Response data:', res.data);

      if (res.data.success) {
        saveCredentials({ username, password });
        localStorage.setItem("timetable", JSON.stringify(res.data.timetable));
        localStorage.setItem("semester", semester);
        localStorage.setItem("academicYear", academicYear);
        setIsLoggingIn(false);
        navigate("/home");
      } else {
        setToast({
          show: true,
          message: res.data.message || "Login failed. Please check your credentials and captcha.",
          type: "error",
        });
        refreshCaptcha();
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        const status = error.response.status;
        if (status === 422) {
          errorMessage = "Invalid request data. Please check your credentials and captcha.";
          // Retry with FormData on iOS if JSON fails
          if (isIOS() && !useFormDataOnIOS && retryCount < 1) {
            console.log('Retrying with FormData on iOS...');
            setIsLoggingIn(false);
            setTimeout(() => {
              handleLogin(retryCount + 1, true);
            }, 2000);
            return;
          }
        } else if (status === 401) {
          errorMessage = "Invalid credentials. Please check your username and password.";
        } else if (status === 403) {
          errorMessage = "Access denied. Please check your credentials.";
        } else if (status === 402) {
          errorMessage = "Server indicates payment required. Contact support.";
        } else {
          errorMessage = `Server error (${status}). Please try again.`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please check your internet connection.";
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      // General retry for network issues
      if (retryCount < 2 && (error.code === 'ECONNABORTED' || error.request)) {
        console.log(`Retry attempt ${retryCount + 1}/2`);
        setIsLoggingIn(false);
        setTimeout(() => {
          handleLogin(retryCount + 1, useFormDataOnIOS);
        }, 2000);
        return;
      }

      setToast({
        show: true,
        message: errorMessage,
        type: "error",
      });
      refreshCaptcha();
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="login-header">
        <div className="login-header-content">
          <h1>TimeTable</h1>
          <ThemeToggle />
        </div>
        {isIOS() && networkStatus === "offline" && (
          <div style={{
            background: "#ef4444",
            color: "white",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            ⚠️ No internet connection. Please check your network.
          </div>
        )}
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
              className="mb-16"
            />

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="form-select"
                >
                  <option value="odd">Odd Semester</option>
                  <option value="even">Even Semester</option>
                  <option value="summer">Summer Semester</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="academicYear">Academic Year</label>
                <select
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="form-select"
                >
                  {getCurrentAcademicYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
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

          {isLoggingIn && (
            <p className="text-center mb-16" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Please wait while we log you in...
            </p>
          )}
          
          <button 
            onClick={() => handleLogin(0, false)}
            className="primary full-width-mobile"
            disabled={isLoggingIn}
            style={{ opacity: isLoggingIn ? 0.7 : 1, cursor: isLoggingIn ? "not-allowed" : "pointer" }}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
    </>
  );
}