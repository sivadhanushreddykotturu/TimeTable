import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CaptchaModal from "../components/CaptchaModal";
import Toast from "../components/Toast";
import { getTodaySubjects } from "../utils/subjectMapper";
import { trackTimetableRefresh, trackPageView } from "../utils/analytics.js";

const slotTimes = {
  1: { start: "07:10", end: "08:00" },
  2: { start: "08:00", end: "08:50" },
  3: { start: "09:20", end: "10:10" },
  4: { start: "10:10", end: "11:00" },
  5: { start: "11:10", end: "12:00" },
  6: { start: "12:00", end: "12:50" },
  7: { start: "13:00", end: "13:50" },
  8: { start: "13:50", end: "14:40" },
  9: { start: "14:50", end: "15:40" },
  10: { start: "15:50", end: "16:40" },
  11: { start: "16:40", end: "17:30" },
};

function getCurrentSlotNumber() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let slot = 1; slot <= 11; slot++) {
    const [sh, sm] = slotTimes[slot].start.split(":").map(Number);
    const [eh, em] = slotTimes[slot].end.split(":").map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;

    if (currentMinutes >= startM && currentMinutes < endM) return slot;
  }
  return null;
}

function findCurrentAndNextClass(timetable) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = days[new Date().getDay()];
  const slots = timetable?.[today] || {};

  const currentSlot = getCurrentSlotNumber();
  let currentClass = "No ongoing class";
  let nextClass = "No upcoming class";

  if (!currentSlot) return { currentClass, nextClass };

  const currentCode = slots[currentSlot];

  // Group Current Class
  if (currentCode && currentCode !== "-") {
    let end = currentSlot;
    for (let i = currentSlot + 1; i <= 11; i++) {
      if (slots[i] === currentCode) {
        end = i;
      } else {
        break;
      }
    }
    currentClass = `${currentCode} (${slotTimes[currentSlot].start} - ${slotTimes[end].end})`;

    // Find next different class after this group
    for (let j = end + 1; j <= 11; j++) {
      if (slots[j] && slots[j] !== "-") {
        let nextEnd = j;
        for (let k = j + 1; k <= 11; k++) {
          if (slots[k] === slots[j]) {
            nextEnd = k;
          } else {
            break;
          }
        }
        nextClass = `${slots[j]} (${slotTimes[j].start} - ${slotTimes[nextEnd].end})`;
        break;
      }
    }
  }

  return { currentClass, nextClass };
}


export default function Home() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("Loading...");
  const [next, setNext] = useState("Loading...");
  const [timetable, setTimetable] = useState(
    JSON.parse(localStorage.getItem("timetable") || "{}")
  );
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [todaySubjects, setTodaySubjects] = useState([]);

  useEffect(() => {
    const { currentClass, nextClass } = findCurrentAndNextClass(timetable);
    setCurrent(currentClass);
    setNext(nextClass);
    
    // Get stored semester and academic year
    const storedSemester = localStorage.getItem("semester") || "odd";
    const storedAcademicYear = localStorage.getItem("academicYear") || "2024-25";
    setSemester(storedSemester);
    setAcademicYear(storedAcademicYear);
    
    // Get today's subjects
    setTodaySubjects(getTodaySubjects());
    
    // Track page view for analytics
    trackPageView("Home");
  }, [timetable]);

  const handleRefresh = () => {
    setShowCaptchaModal(true);
  };

  const handleCaptchaSuccess = (newTimetable) => {
    // Track timetable refresh
    trackTimetableRefresh();
    
    setTimetable(newTimetable);
    setTodaySubjects(getTodaySubjects());
    setToast({
      show: true,
      message: "Timetable refreshed successfully!",
      type: "success"
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const getSemesterDisplayName = (sem) => {
    switch(sem) {
      case 'odd': return 'Odd Semester';
      case 'even': return 'Even Semester';
      case 'summer': return 'Summer Semester';
      default: return sem;
    }
  };

  return (
    <>
      <Header onRefresh={handleRefresh} />

      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Your Timetable</h1>
            <p className="page-subtitle">
              {getSemesterDisplayName(semester)} • {academicYear}
            </p>
          </div>
        </div>

        <div className="class-card">
          <h2>Current Class</h2>
          <div className="class-card-content">
            {current}
          </div>
        </div>

        <div className="class-card">
          <h2>Next Class</h2>
          <div className="class-card-content">
            {next}
          </div>
        </div>

        {todaySubjects.length > 0 && (
          <div className="class-card">
            <h2>Today's Subjects</h2>
            <div className="today-subjects">
              {todaySubjects.map((subject, index) => (
                <div key={index} className="subject-item">
                  <span className="subject-display-name">{subject.displayName}</span>
                  {subject.displayName !== subject.code && (
                    <span className="subject-original-code">({subject.code})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate("/timetable")} 
          className="primary full-width-mobile"
        >
          View Full Timetable
        </button>

        <button 
          onClick={() => navigate("/subjects")} 
          className="secondary full-width-mobile"
          style={{ marginTop: "12px" }}
        >
          Manage Subject Names
        </button>


      </div>

      <CaptchaModal
        isOpen={showCaptchaModal}
        onClose={() => setShowCaptchaModal(false)}
        onSuccess={handleCaptchaSuccess}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={closeToast}
      />
    </>
  );
}
