"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import styles from "./WallCalendar.module.css";

const MONTH_IMAGES = {
  0: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", // Jan
  1: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5", // Feb
  2: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606", // Mar
  3: "https://images.unsplash.com/photo-1501854140801-50d01698950b", // Apr
  4: "https://images.unsplash.com/photo-1445307806294-bff7f67ff225", // May
  5: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4", // Jun
  6: "https://images.unsplash.com/photo-1519681393784-d120267933ba", // Jul
  7: "https://images.unsplash.com/photo-1464278533981-50106e6176b1", // Aug
  8: "https://images.unsplash.com/photo-1491555103944-7c647fd857e6", // Sep
  9: "https://images.unsplash.com/photo-1473773508845-188df298d2d1", // Oct
  10: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5", // Nov
  11: "https://images.unsplash.com/photo-1548777123-e216912df7d8", // Dec
};

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const HOLIDAYS = [
  { month: 0, day: 1, name: "New Year", color: "#FFD700" },
  { month: 0, day: 26, name: "Republic Day", color: "#FF9933" },
  { month: 7, day: 15, name: "Independence Day", color: "#FF9933" },
  { month: 9, day: 2, name: "Gandhi Jayanti", color: "#FF9933" },
  { month: 11, day: 25, name: "Christmas", color: "#C0392B" },
  // Hardcoded Holi/Diwali
  { month: 2, day: 25, year: 2025, name: "Holi", color: "#9B59B6" },
  { month: 2, day: 14, year: 2026, name: "Holi", color: "#9B59B6" },
  { month: 9, day: 20, year: 2025, name: "Diwali", color: "#FFD700" },
  { month: 10, day: 8, year: 2026, name: "Diwali", color: "#FFD700" },
];

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [theme, setTheme] = useState("light");

  const saveTimeoutRef = useRef(null);
  const magneticRefs = useRef([]);

  // --- Theme Management ---
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  // --- Magnetic Effect ---
  const handleMouseMove = (e, index) => {
    const btn = magneticRefs.current[index];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };

  const handleMouseLeave = (index) => {
    const btn = magneticRefs.current[index];
    if (!btn) return;
    btn.style.transform = "translate(0px, 0px)";
  };

  const jumpToToday = () => {
    const today = new Date();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setIsTransitioning(false);
    }, 180);
  };

  // --- Core Utility Logic ---

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    // JS getDay() returns 0 for Sunday. We want 0 for Monday.
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const buildCalendarGrid = useCallback((year, month) => {
    const days = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Yesterday's month days for padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.unshift({
        day: prevMonthDays - i,
        month: month - 1,
        year: year,
        isCurrentMonth: false,
      });
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      
      const holiday = HOLIDAYS.find(h => 
        h.day === i && 
        h.month === month && 
        (!h.year || h.year === year)
      );

      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isToday,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        holidayColor: holiday?.color
      });
    }

    // Next month days for padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: year,
        isCurrentMonth: false,
      });
    }

    return days;
  }, []);

  const calendarGrid = useMemo(() => buildCalendarGrid(currentYear, currentMonth), [currentYear, currentMonth, buildCalendarGrid]);

  const isInRange = (date, start, end) => {
    if (!start || !end) return false;
    
    // Normalize dates to midnight for clean comparison
    const d = new Date(date.year, date.month, date.day).getTime();
    const s = new Date(start.year, start.month, start.day).getTime();
    const e = new Date(end.year, end.month, end.day).getTime();
    
    // Sort just in case user clicked in reverse
    const min = Math.min(s, e);
    const max = Math.max(s, e);
    
    return d > min && d < max;
  };

  const isSelectionBound = (date, point) => {
    if (!point) return false;
    return date.day === point.day && date.month === point.month && date.year === point.year;
  };

  const handleDayClick = (dayObj) => {
    if (!dayObj.isCurrentMonth) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dayObj);
      setEndDate(null);
    } else {
      // Logic for selecting the second date
      const s = new Date(startDate.year, startDate.month, startDate.day).getTime();
      const c = new Date(dayObj.year, dayObj.month, dayObj.day).getTime();

      if (c < s) {
        // Swap if clicked date is before start date
        setEndDate(startDate);
        setStartDate(dayObj);
      } else if (c === s) {
        // Deselect if clicking the same date
        setStartDate(null);
      } else {
        setEndDate(dayObj);
      }
    }
  };

  const navigateMonth = (direction) => {
    setIsTransitioning(true);
    setTimeout(() => {
      let newMonth = currentMonth + direction;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }

      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
      setIsTransitioning(false);
    }, 180); // Half of CSS transition time
  };

  // --- Side Effects & Storage ---

  useEffect(() => {
    const key = `wall-calendar-notes-${currentYear}-${currentMonth}`;
    const savedNote = localStorage.getItem(key);
    setNotes(savedNote || "");
  }, [currentMonth, currentYear]);

  const saveNotes = useCallback((text) => {
    const key = `wall-calendar-notes-${currentYear}-${currentMonth}`;
    localStorage.setItem(key, text);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    // Debounce save 600ms
    saveTimeoutRef.current = setTimeout(() => {
      const key = `wall-calendar-notes-${currentYear}-${currentMonth}`;
      const saved = localStorage.getItem(key) || "";
      if (notes !== saved) {
        saveNotes(notes);
      }
    }, 600);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [notes, saveNotes, currentMonth, currentYear]);

  // --- UI Helpers ---

  const rangeCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate.year, startDate.month, startDate.day);
    const e = new Date(endDate.year, endDate.month, endDate.day);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const formatDate = (date) => {
    if (!date) return "";
    const name = new Date(date.year, date.month, date.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return name;
  };

  const fullDateName = (date) => {
    if (!date) return "";
    return new Date(date.year, date.month, date.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Theme Toggle Button */}
      <button className={styles.themeToggle} onClick={toggleTheme}>
        <span className={styles.toggleIcon}>{theme === "light" ? "🌙" : "☀️"}</span>
        <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
      </button>

      <div className={styles.spiralBinding}>
        {[...Array(22)].map((_, i) => (
          <div key={i} className={styles.spiralRing} />
        ))}
      </div>

      <div className={styles.mainCard}>
        <div className={styles.heroSection}>
          <img 
            src={`${MONTH_IMAGES[currentMonth]}?w=1200&q=85&fit=crop&crop=entropy`} 
            alt="Mountainscape" 
            className={`${styles.heroImage} ${isTransitioning ? styles.imageFading : ""}`}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.monthBadge}>
            <span className={styles.badgeYear}>{currentYear}</span>
            <h1 className={styles.badgeMonth}>{MONTH_NAMES[currentMonth]}</h1>
          </div>
        </div>

        <div className={styles.contentLayout}>
          {/* Left Panel: Notes & Legend */}
          <section className={styles.leftPanel}>
            <div className={styles.notesContainer}>
              <h3 className={styles.notesTitle}>Notes — {MONTH_NAMES[currentMonth]} {currentYear}</h3>
              <div className={styles.textareaWrapper}>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your thoughts..."
                  className={styles.notesArea}
                />
                <div className={`${styles.saveIndicator} ${isSaved ? styles.showSave : ""}`}>
                  Saved ✓
                </div>
              </div>
            </div>

            <div className={styles.metaSection}>
              {startDate && (
                <div className={styles.rangeSummary}>
                  <span className={styles.rangeDates}>
                    {formatDate(startDate)} {endDate ? `→ ${formatDate(endDate)}` : "→ ..."}
                  </span>
                  {endDate && <span className={styles.rangeDays}>{rangeCount} days</span>}
                </div>
              )}

              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotToday}`} /> 
                  <span>Today</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotSelected}`} /> 
                  <span>Selected</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotRange}`} /> 
                  <span>Range</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel: Calendar Grid */}
          <section className={styles.rightPanel}>
            <header className={styles.gridHeader}>
              <button 
                ref={el => magneticRefs.current[0] = el}
                onMouseMove={(e) => handleMouseMove(e, 0)}
                onMouseLeave={() => handleMouseLeave(0)}
                onClick={() => navigateMonth(-1)} 
                className={styles.navBtn}
              >
                ←
              </button>
              
              <div className={styles.titleWrapper} onClick={jumpToToday} title="Jump to Today">
                <h2 className={styles.monthTitle}>
                  {MONTH_NAMES[currentMonth].charAt(0) + MONTH_NAMES[currentMonth].slice(1).toLowerCase()} {currentYear}
                </h2>
              </div>

              <button 
                ref={el => magneticRefs.current[1] = el}
                onMouseMove={(e) => handleMouseMove(e, 1)}
                onMouseLeave={() => handleMouseLeave(1)}
                onClick={() => navigateMonth(1)} 
                className={styles.navBtn}
              >
                →
              </button>
            </header>

            <div className={styles.gridContainer}>
              <div className={styles.weekdayRow}>
                {WEEKDAYS.map(day => (
                  <div key={day} className={styles.weekdayHeader}>{day}</div>
                ))}
              </div>

              <div className={`${styles.daysGrid} ${isTransitioning ? styles.gridFading : ""}`}>
                {calendarGrid.map((dayObj, idx) => {
                  const isStart = isSelectionBound(dayObj, startDate);
                  const isEnd = isSelectionBound(dayObj, endDate);
                  const inRange = isInRange(dayObj, startDate, endDate);
                  const weekdayIndex = idx % 7;
                  const isSaturday = weekdayIndex === 5;
                  const isSunday = weekdayIndex === 6;

                  return (
                    <div 
                      key={`${dayObj.year}-${dayObj.month}-${dayObj.day}-${idx}`}
                      className={`
                        ${styles.dayCell} 
                        ${!dayObj.isCurrentMonth ? styles.otherMonth : ""}
                        ${isStart ? styles.dayStart : ""}
                        ${isEnd ? styles.dayEnd : ""}
                        ${inRange ? styles.dayInRange : ""}
                        ${dayObj.isToday ? styles.dayToday : ""}
                        ${isSaturday ? styles.saturday : ""}
                        ${isSunday ? styles.sunday : ""}
                      `}
                      onClick={() => handleDayClick(dayObj)}
                    >
                      <span className={styles.dayNumber}>{dayObj.day}</span>
                      
                      {dayObj.isHoliday && dayObj.isCurrentMonth && (
                        <div 
                          className={styles.holidayDot} 
                          style={{ backgroundColor: dayObj.holidayColor }}
                        >
                          <div className={styles.tooltip}>{dayObj.holidayName}</div>
                        </div>
                      )}
                      
                      {dayObj.isToday && <div className={styles.todayIndicator} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Status Bar */}
            <div className={`${styles.selectionStatus} ${(startDate) ? styles.statusVisible : ""}`}>
              {startDate && !endDate && <p className={styles.mutedText}>Select an end date...</p>}
              {startDate && endDate && (
                <p>{fullDateName(startDate)} &nbsp;→&nbsp; {fullDateName(endDate)} &nbsp;({rangeCount} days)</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
