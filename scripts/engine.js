/**
 * WORMHOLE Minimalist Engine
 * Spacetime Overlap Analytics, Live Radar, Keyboard Shortcuts & ICS Sync.
 */

function categorizePeriod(label) {
  if (!label) return "fixed";
  const s = label.toUpperCase();
  // 100% Free: MOOC, Sports, Library, Mentor, and Office
  if (/MOOC|SPORTS|LIBRARY|MENTOR|OFFICE/.test(s)) return "free";
  if (/PE-1/.test(s)) return "skiphigh";
  if (/CTS/.test(s)) return "skiplow";
  return "fixed";
}

const CAT_LEVELS = { free: 3, skiphigh: 2, skiplow: 1, fixed: 0 };
const CAT_LABELS = { free: "FREE", skiphigh: "FLEX · PE-1", skiplow: "SKIP · CTS", fixed: "" };

class WormholeApp {
  constructor() {
    this.currentSection = "H";
    this.secA = "H";
    this.secB = "L";
    this.searchQuery = "";
    this.vortex = null;

    this.init();
  }

  init() {
    // Initialize wireframe canvas
    this.vortex = new WormholeVortex("vortexCanvas");

    // Build controls & views
    this.buildSectionPigeonholes();
    this.buildRiftSelectors();
    this.initNavigation();
    this.initAudioToggle();
    this.initSearch();
    this.initKeyboardShortcuts();
    this.initICSExporter();

    // Render views
    this.renderChronosGrid();
    this.renderTheRift();
    this.renderElectives();

    // Start live clock radar
    this.startLiveRadar();
  }

  /* ===================== KEYBOARD NAVIGATION ===================== */
  initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Don't trigger if typing in search input
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      const key = e.key.toUpperCase();

      // Number keys 1-4 switch tabs
      if (["1", "2", "3", "4"].includes(key)) {
        const views = ["rift", "chronos", "electives", "docs"];
        const btn = document.querySelector(`[data-view="${views[Number(key) - 1]}"]`);
        if (btn) btn.click();
      }

      // Letter keys A-L switch sections
      if (Object.keys(SECTIONS).includes(key)) {
        WormholeAudio.tick();
        this.currentSection = key;
        this.buildSectionPigeonholes();
        this.renderChronosGrid();
        const chronosTab = document.querySelector('[data-view="chronos"]');
        if (chronosTab) chronosTab.click();
      }

      // Space key toggles audio
      if (e.code === "Space") {
        e.preventDefault();
        const btn = document.getElementById("audioToggleBtn");
        if (btn) btn.click();
      }
    });
  }

  /* ===================== NAVIGATION ===================== */
  initNavigation() {
    const tabs = document.querySelectorAll(".seg-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        WormholeAudio.tick();
        tabs.forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".view-panel").forEach((p) => p.classList.remove("active"));

        tab.classList.add("active");
        const target = tab.dataset.view;
        const panel = document.getElementById("panel-" + target);
        if (panel) panel.classList.add("active");
      });
    });
  }

  initAudioToggle() {
    const btn = document.getElementById("audioToggleBtn");
    if (!btn) return;

    const updateBtn = () => {
      const isMuted = WormholeAudio.isMuted();
      btn.innerHTML = isMuted ? `🔇 Muted` : `🔊 Audio`;
    };

    updateBtn();
    btn.addEventListener("click", () => {
      WormholeAudio.toggleMute();
      updateBtn();
      if (!WormholeAudio.isMuted()) WormholeAudio.tick();
    });
  }

  /* ===================== LIVE RADAR CLOCK ===================== */
  startLiveRadar() {
    const clockEl = document.getElementById("liveClockTime");
    const statusEl = document.getElementById("livePeriodStatus");

    const tickClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;

      const dayIndex = now.getDay();
      const currentDayName = DAYS[dayIndex - 1];

      let activePeriod = null;
      const currentTotalMin = now.getHours() * 60 + now.getMinutes();

      PERIODS.forEach((p) => {
        const [sh, sm] = p.start.split(":").map(Number);
        const [eh, em] = p.end.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        if (currentTotalMin >= startMin && currentTotalMin < endMin) {
          activePeriod = p;
        }
      });

      if (statusEl) {
        if (dayIndex === 0) {
          statusEl.textContent = "Sunday · Off Grid";
        } else if (activePeriod) {
          statusEl.textContent = `Period ${activePeriod.id + 1} Active (${activePeriod.displayStart} – ${activePeriod.displayEnd})`;
        } else if (currentTotalMin >= 10 * 60 + 20 && currentTotalMin < 10 * 60 + 45) {
          statusEl.textContent = "Short Break Interval";
        } else if (currentTotalMin >= 12 * 60 + 35 && currentTotalMin < 13 * 60 + 50) {
          statusEl.textContent = "Lunch Interval";
        } else {
          statusEl.textContent = "Campus Dormant";
        }
      }

      // Highlight active cell in current section view
      document.querySelectorAll(".cell-slot").forEach((c) => c.classList.remove("active-period"));
      if (currentDayName && activePeriod !== null) {
        const activeCell = document.querySelector(
          `[data-day="${currentDayName}"][data-period="${activePeriod.id}"]`
        );
        if (activeCell) activeCell.classList.add("active-period");
      }
    };

    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ===================== CHRONOS MATRIX (Single Section) ===================== */
  buildSectionPigeonholes() {
    const container = document.getElementById("sectionPigeonholes");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(SECTIONS).forEach((secKey) => {
      const secData = SECTIONS[secKey];
      const pill = document.createElement("div");
      pill.className = "sec-pill" + (secKey === this.currentSection ? " active" : "");
      pill.innerHTML = `<span>5${secKey}</span> <small>${secData.room.split(",")[0].trim()}</small>`;
      pill.addEventListener("click", () => {
        WormholeAudio.tick();
        this.currentSection = secKey;
        this.buildSectionPigeonholes();
        this.renderChronosGrid();
      });
      container.appendChild(pill);
    });
  }

  renderChronosGrid() {
    const secData = SECTIONS[this.currentSection];
    const titleEl = document.getElementById("chronosSectionTitle");
    const metaEl = document.getElementById("chronosSectionMeta");
    const tableEl = document.getElementById("chronosTimetable");

    if (titleEl) titleEl.textContent = `Section 5${this.currentSection}`;
    if (metaEl) {
      metaEl.innerHTML = `Advisor: <span style="color:var(--text-main); font-weight:500;">${secData.advisor}</span> · Primary Room: <span style="color:var(--text-main); font-weight:500;">${secData.room}</span>`;
    }

    if (tableEl) {
      tableEl.innerHTML = this.generateGridHTML([{ key: this.currentSection, data: secData }], false);
    }

    this.renderDirectory(secData.courses);
  }

  renderDirectory(courses) {
    const tbody = document.getElementById("directoryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = (courses || []).filter((c) => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(q);
      const nameMatch = c.name.toLowerCase().includes(q);
      const facMatch = c.faculty.toLowerCase().includes(q);
      const labMatch = (c.labs || []).some((l) => l.faculty.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q));
      return codeMatch || nameMatch || facMatch || labMatch;
    });

    filtered.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="mono-code">${c.code}</td>
        <td style="font-weight:500; color:var(--text-main);">${c.name}</td>
        <td>${c.faculty}</td>
      `;
      tbody.appendChild(tr);

      (c.labs || []).forEach((l) => {
        const labTr = document.createElement("tr");
        labTr.style.background = "rgba(255, 255, 255, 0.015)";
        labTr.innerHTML = `
          <td class="mono-code" style="padding-left:24px; color:var(--accent-violet);">${l.tag}</td>
          <td style="color:var(--text-dim); font-size:12px;">Practical Lab Division</td>
          <td style="font-size:12px;">${l.faculty}</td>
        `;
        tbody.appendChild(labTr);
      });
    });
  }

  initSearch() {
    const searchInput = document.getElementById("facultySearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderDirectory(SECTIONS[this.currentSection].courses);
      });
    }
  }

  /* ===================== THE RIFT (Dual Overlap) ===================== */
  buildRiftSelectors() {
    const selectA = document.getElementById("riftSecA");
    const selectB = document.getElementById("riftSecB");
    if (!selectA || !selectB) return;

    selectA.innerHTML = "";
    selectB.innerHTML = "";

    Object.keys(SECTIONS).forEach((k) => {
      const optA = document.createElement("option");
      optA.value = k;
      optA.textContent = `Section 5${k}`;
      selectA.appendChild(optA);

      const optB = document.createElement("option");
      optB.value = k;
      optB.textContent = `Section 5${k}`;
      selectB.appendChild(optB);
    });

    selectA.value = this.secA;
    selectB.value = this.secB;

    const onChange = () => {
      this.secA = selectA.value;
      this.secB = selectB.value;
      WormholeAudio.warp();
      if (this.vortex) this.vortex.triggerWarp();
      this.renderTheRift();
    };

    selectA.addEventListener("change", onChange);
    selectB.addEventListener("change", onChange);
  }

  renderTheRift() {
    const A = { key: this.secA, data: SECTIONS[this.secA] };
    const B = { key: this.secB, data: SECTIONS[this.secB] };

    // Compute overlapping contiguous windows & calculate sync score
    const windows = [];
    let totalFreeOrFlexSlots = 0;
    const totalSlots = 6 * 7; // 42 slots in a week

    DAYS.forEach((day) => {
      let i = 0;
      while (i < 7) {
        const la = A.data.days[day][i];
        const lb = B.data.days[day][i];
        const score = Math.min(CAT_LEVELS[categorizePeriod(la)], CAT_LEVELS[categorizePeriod(lb)]);

        if (score > 0) {
          totalFreeOrFlexSlots++;
          let j = i;
          while (j + 1 < 7) {
            const la2 = A.data.days[day][j + 1];
            const lb2 = B.data.days[day][j + 1];
            const s2 = Math.min(CAT_LEVELS[categorizePeriod(la2)], CAT_LEVELS[categorizePeriod(lb2)]);
            if (s2 === score) {
              totalFreeOrFlexSlots++;
              j++;
            } else break;
          }
          windows.push({ day, start: i, end: j, score });
          i = j + 1;
        } else {
          i++;
        }
      }
    });

    // Sync score percentage (including breaks)
    const syncPercentage = Math.min(96, Math.round(55 + (totalFreeOrFlexSlots / 14) * 40));
    const scoreBadge = document.getElementById("riftSyncScore");
    if (scoreBadge) {
      scoreBadge.textContent = `${syncPercentage}% Spacetime Alignment`;
    }

    windows.sort((x, y) => y.score - x.score || y.end - y.start - (x.end - x.start));

    const rankList = document.getElementById("riftRankList");
    if (rankList) {
      rankList.innerHTML = "";
      if (windows.length === 0) {
        rankList.innerHTML = `
          <li class="card-minimal rank-item" style="justify-content:center; color:var(--text-dim); padding:18px;">
            No direct class-time overlaps — make use of the guaranteed morning & lunch breaks.
          </li>
        `;
      } else {
        if (windows.some((w) => w.score === 3)) {
          WormholeAudio.resonance();
        }

        windows.forEach((w, idx) => {
          const li = document.createElement("li");
          li.className = "card-minimal rank-item";
          const startT = PERIODS[w.start].displayStart;
          const endT = PERIODS[w.end].displayEnd;
          const tierClass = `tier-${w.score}`;
          const scoreLabel =
            w.score === 3
              ? "Both Free (MOOC / Office)"
              : w.score === 2
              ? "PE-1 Elective Overlap"
              : "CTS Low Friction";

          const reason =
            w.score === 3
              ? `5${this.secA}: ${A.data.days[w.day][w.start]} · 5${this.secB}: ${B.data.days[w.day][w.start]}`
              : `5${this.secA}: ${A.data.days[w.day].slice(w.start, w.end + 1).join(" → ")} · 5${this.secB}: ${B.data.days[w.day].slice(w.start, w.end + 1).join(" → ")}`;

          li.innerHTML = `
            <div class="rank-num">0${idx + 1}</div>
            <div class="rank-main">
              <div class="rank-header">${w.day}, ${startT} – ${endT}</div>
              <div class="rank-sub">${reason}</div>
            </div>
            <div class="tier-pill ${tierClass}">${scoreLabel}</div>
          `;
          rankList.appendChild(li);
        });
      }
    }

    const tableEl = document.getElementById("riftOverlayTable");
    if (tableEl) {
      tableEl.innerHTML = this.generateGridHTML([A, B], true);
    }
  }

  /* ===================== ELECTIVES VIEW ===================== */
  renderElectives() {
    const tbody = document.getElementById("electivesTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    ELECTIVES.forEach((e) => {
      e.rows.forEach((r, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="mono-code">${idx === 0 ? `Track 0${e.no}` : ""}</td>
          <td style="font-weight:500; color:var(--text-main);">${idx === 0 ? e.name : ""}</td>
          <td>${r[0]}</td>
          <td class="mono-code" style="color:var(--text-main); font-weight:600;">${r[1]}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  /* ===================== GRID GENERATOR ===================== */
  generateGridHTML(sectionsArr, isOverlay) {
    let html = "<thead><tr><th class='day-cell'>Day</th>";
    PERIODS.forEach((p, i) => {
      html += `<th>${p.label}<span class="th-time">${p.displayStart} – ${p.displayEnd}</span></th>`;
      if (i === 1 || i === 3) html += `<th class="break-cell"></th>`;
    });
    html += "</tr></thead><tbody>";

    DAYS.forEach((day) => {
      html += `<tr><td class="day-cell">${day.substring(0, 3)}</td>`;
      for (let i = 0; i < 7; i++) {
        if (isOverlay) {
          const [a, b] = sectionsArr;
          const la = a.data.days[day][i];
          const lb = b.data.days[day][i];
          const ca = categorizePeriod(la);
          const cb = categorizePeriod(lb);
          const score = Math.min(CAT_LEVELS[ca], CAT_LEVELS[cb]);
          const cls =
            score === 3
              ? "cat-free"
              : score === 2
              ? "cat-skiphigh"
              : score === 1
              ? "cat-skiplow"
              : "";

          const badge =
            score > 0
              ? `<span class="cell-tag">${score === 3 ? "BOTH FREE" : score === 2 ? "FLEX" : "SKIP"}</span>`
              : "";

          html += `
            <td class="cell-slot ${cls}">
              <div class="cell-name"><span style="color:var(--text-dim); font-size:11px;">5${a.key}:</span> ${la}</div>
              <div class="cell-name" style="margin-top:2px;"><span style="color:var(--text-dim); font-size:11px;">5${b.key}:</span> ${lb}</div>
              ${badge}
            </td>
          `;
        } else {
          const label = sectionsArr[0].data.days[day][i];
          const cat = categorizePeriod(label);
          const badge = CAT_LABELS[cat]
            ? `<span class="cell-tag">${CAT_LABELS[cat]}</span>`
            : "";

          html += `
            <td class="cell-slot cat-${cat}" data-day="${day}" data-period="${i}">
              <div class="cell-name">${label}</div>
              ${badge}
            </td>
          `;
        }

        if (i === 1 || i === 3) html += `<td class="break-cell"></td>`;
      }
      html += "</tr>";
    });

    html += "</tbody>";
    return html;
  }

  /* ===================== ICS EXPORTER ===================== */
  initICSExporter() {
    const exportBtn = document.getElementById("exportIcsBtn");
    if (!exportBtn) return;

    exportBtn.addEventListener("click", () => {
      WormholeAudio.resonance();
      const secData = SECTIONS[this.currentSection];
      let icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WORMHOLE//DSU CSE Sem 5//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Wormhole - Section 5" + this.currentSection,
        "X-WR-TIMEZONE:Asia/Kolkata",
      ];

      DAYS.forEach((day, dayIndex) => {
        const dayMap = ["MO", "TU", "WE", "TH", "FR", "SA"];
        const byDay = dayMap[dayIndex];

        PERIODS.forEach((p, pIndex) => {
          const subject = secData.days[day][pIndex];
          if (!subject) return;

          const [sh, sm] = p.start.split(":");
          const [eh, em] = p.end.split(":");

          const baseDateStr = `2026081${0 + dayIndex}`;
          const dtStart = `${baseDateStr}T${sh}${sm}00`;
          const dtEnd = `${baseDateStr}T${eh}${em}00`;

          icsContent.push(
            "BEGIN:VEVENT",
            `UID:wormhole-5${this.currentSection}-${dayIndex}-${pIndex}@dsu.edu`,
            `SUMMARY:[5${this.currentSection}] ${subject}`,
            `LOCATION:${secData.room}`,
            `DESCRIPTION:WORMHOLE Timetable for Section 5${this.currentSection} · Advisor: ${secData.advisor}`,
            `DTSTART;TZID=Asia/Kolkata:${dtStart}`,
            `DTEND;TZID=Asia/Kolkata:${dtEnd}`,
            `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=20261231T235959Z`,
            "STATUS:CONFIRMED",
            "END:VEVENT"
          );
        });
      });

      icsContent.push("END:VCALENDAR");

      const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `WORMHOLE_Section_5${this.currentSection}_Timetable.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.Wormhole = new WormholeApp();
});
