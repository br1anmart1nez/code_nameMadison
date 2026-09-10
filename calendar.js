// ==========================
// 1. MEETINGS DATA (EDIT THIS)
// ==========================

const MEETINGS = [
  
  
  
  // Add more meetings here as needed, up to May 2027.
  // Example:
  // {
  //   date: "2027-05-15",
  //   title: "End-of-Year Celebration",
  //   time: "4:00 PM",
  //   location: "Cafeteria",
  //   notes: "Awards and reflections."
  // }
];

// ==========================
// 2. HELPER FUNCTIONS
// ==========================

// Parse "YYYY-MM-DD" into a Date at local midnight
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Format Date as "YYYY-MM-DD"
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Format Date as "September 2026"
function formatMonthLabel(date) {
  return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

// Format Date as "Thu, Sep 10, 2026"
function formatDayTitle(date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Build a map: "YYYY-MM-DD" -> array of meetings on that day
function buildMeetingsMap(meetings) {
  const map = {};
  for (const m of meetings) {
    const key = m.date;
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return map;
}

// ==========================
// 3. CALENDAR STATE
// ==========================

const currentMonth = new Date(); // start at current month
currentMonth.setDate(1);

// Limit navigation: from this month up to May 2027
const minMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
const maxMonth = new Date(2027, 4, 1); // May 2027 (month is 0-based: 4 = May)

const meetingsMap = buildMeetingsMap(MEETINGS);

const calendarDaysEl = document.getElementById("calendar-days");
const currentMonthLabelEl = document.getElementById("current-month-label");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

const dayDetailsEl = document.getElementById("day-details");
const selectedDateTitleEl = document.getElementById("selected-date-title");
const meetingListEl = document.getElementById("meeting-list");

// ==========================
// 4. RENDER CALENDAR
// ==========================

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  currentMonthLabelEl.textContent = formatMonthLabel(currentMonth);

  // Disable prev/next buttons if out of range
  prevBtn.disabled = !(year > minMonth.getFullYear() || (year === minMonth.getFullYear() && month > minMonth.getMonth()));
  nextBtn.disabled = !(year < maxMonth.getFullYear() || (year === maxMonth.getFullYear() && month < maxMonth.getMonth()));

  calendarDaysEl.innerHTML = "";

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = formatDateKey(new Date());

  // Previous month days (empty or grayed)
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const cell = createDayCell(dayNum, true);
    calendarDaysEl.appendChild(cell);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = formatDateKey(date);
    const hasMeetings = !!meetingsMap[key];
    const isToday = key === todayKey;

    const cell = createDayCell(day, false, key, hasMeetings, isToday);
    calendarDaysEl.appendChild(cell);
  }

  // Next month days to fill grid to 42 cells (6 rows * 7 cols)
  const totalCells = 42;
  const filledCells = startDay + daysInMonth;
  const remaining = totalCells - filledCells;

  for (let day = 1; day <= remaining; day++) {
    const cell = createDayCell(day, true);
    calendarDaysEl.appendChild(cell);
  }
}

function createDayCell(dayNumber, isOtherMonth, dateKey = null, hasMeetings = false, isToday = false) {
  const div = document.createElement("div");
  div.className = "calendar-day";
  if (isOtherMonth) div.classList.add("other-month");
  if (isToday) div.classList.add("today");

  const numberEl = document.createElement("div");
  numberEl.className = "day-number";
  numberEl.textContent = dayNumber;
  div.appendChild(numberEl);

  if (!isOtherMonth && hasMeetings) {
    const dot = document.createElement("span");
    dot.className = "meeting-dot";
    div.appendChild(dot);
  }

  if (!isOtherMonth && dateKey) {
    div.addEventListener("click", () => showDayDetails(dateKey));
  }

  return div;
}

function showDayDetails(dateKey) {
  const meetings = meetingsMap[dateKey] || [];
  const dateObj = parseDate(dateKey);

  dayDetailsEl.hidden = false;
  selectedDateTitleEl.textContent = formatDayTitle(dateObj);

  meetingListEl.innerHTML = "";

  if (meetings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No meetings scheduled.";
    meetingListEl.appendChild(li);
  } else {
    for (const m of meetings) {
      const li = document.createElement("li");
      const timeLoc = [m.time, m.location].filter(Boolean).join(" • ");
      li.innerHTML = `<strong>${m.title}</strong>${timeLoc ? " — " + timeLoc : ""}${m.notes ? "<br><small>" + m.notes + "</small>" : ""}`;
      meetingListEl.appendChild(li);
    }
  }
}

// ==========================
// 5. NAVIGATION
// ==========================

prevBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  dayDetailsEl.hidden = true;
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  dayDetailsEl.hidden = true;
  renderCalendar();
});

// Initial render
renderCalendar();