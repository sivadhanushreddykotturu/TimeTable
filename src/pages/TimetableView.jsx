import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCredentials } from "../../utils/storage.js";
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

export default function TimetableView() {
  const [timetable, setTimetable] = useState(
    JSON.parse(localStorage.getItem("timetable") || "{}")
  );
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const navigate = useNavigate();

  const refreshTimetable = () => {
    setShowCaptchaModal(true);
  };

  const handleCaptchaSuccess = (newTimetable) => {
    setTimetable(newTimetable);
    alert("Refreshed successfully.");
  };

  const logout = () => {
    clearCredentials();
    localStorage.removeItem("timetable");
    navigate("/");
  };

  const renderDay = (day, slots) => {
    const entries = Object.entries(slots)
      .filter(([slot]) => parseInt(slot) <= 11)
      .map(([slot, value]) => [parseInt(slot), value]);

    const merged = [];
    let i = 0;

    while (i < entries.length) {
      const [startSlot, value] = entries[i];
      if (value === "-") {
        i++;
        continue;
      }

      let endSlot = startSlot;
      while (
        i + 1 < entries.length &&
        entries[i + 1][1] === value &&
        entries[i + 1][0] === endSlot + 1
      ) {
        endSlot++;
        i++;
      }

      merged.push({ content: value, startSlot, endSlot });
      i++;
    }

    return (
      <div key={day} style={{ marginBottom: "24px" }}>
        <h3>{day}</h3>
        {merged.map((block, idx) => (
          <div
            key={idx}
            style={{
              background: "#f2f2f2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "8px",
            }}
          >
            <strong>{block.content}</strong>
            <br />
            {slotTimes[block.startSlot].start} – {slotTimes[block.endSlot].end}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔝 Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <h2>Your Timetable</h2>
        <div>
          <button onClick={() => navigate("/home")} style={{ marginRight: 10 }}>
            Back to Home
          </button>
          <button onClick={refreshTimetable} style={{ marginRight: 10 }}>
            Refresh
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* 🧾 Timetable */}
      {Object.keys(timetable).length === 0 ? (
        <p>No timetable loaded. Please log in.</p>
      ) : (
        Object.entries(timetable).map(([day, slots]) =>
          renderDay(day, slots)
        )
      )}

      <CaptchaModal
        isOpen={showCaptchaModal}
        onClose={() => setShowCaptchaModal(false)}
        onSuccess={handleCaptchaSuccess}
      />
    </div>
  );
}
