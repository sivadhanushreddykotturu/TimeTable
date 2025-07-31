import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CaptchaModal from "../components/CaptchaModal";

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

  if (currentSlot && slots[currentSlot] && slots[currentSlot] !== "-") {
    currentClass = slots[currentSlot];
  }

  for (let i = (currentSlot || 0) + 1; i <= 11; i++) {
    if (slots[i] && slots[i] !== "-") {
      nextClass = slots[i];
      break;
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

  useEffect(() => {
    const { currentClass, nextClass } = findCurrentAndNextClass(timetable);
    setCurrent(currentClass);
    setNext(nextClass);
  }, [timetable]);

  const handleRefresh = () => {
    setShowCaptchaModal(true);
  };

  const handleCaptchaSuccess = (newTimetable) => {
    setTimetable(newTimetable);
    alert("Timetable refreshed!");
  };

  return (
    <>
      <Header onRefresh={handleRefresh} />

      <div className="container">
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

        <button 
          onClick={() => navigate("/timetable")} 
          className="primary full-width-mobile"
        >
          View Full Timetable
        </button>
      </div>

      <CaptchaModal
        isOpen={showCaptchaModal}
        onClose={() => setShowCaptchaModal(false)}
        onSuccess={handleCaptchaSuccess}
      />
    </>
  );
}
