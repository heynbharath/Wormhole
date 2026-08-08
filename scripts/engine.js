/**
 * WORMHOLE Core Engine
 * Algorithms, Live Clock Radar, Rendering Pipeline & Calendar Exporter.
 */

// Categorization Tiers
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
    this.activeFilter = "all";
    this.searchQuery = "";
    this.vortex = null;

    this.init();
  }

  init() {
    // Initialize canvas vortex
    this.vortex = new WormholeVortex("vortexCanvas");

    // Build controls & views
    this.buildSectionPigeonholes();
    this.buildRiftSelectors();
    this.initNavigation();
    this.initAudioToggle();
    this.initSearch();
    this.initICSExporter();

    // Render initial views
    this.renderChronosGrid();
    this.renderTheRift();
    this.renderElectives();

    // Start live clock radar
    this.startLiveRadar();
  }

  /* ===================== NAVIGATION ===================== */
  initNavigation() {
    const tabs = document.querySelectorAll(".tab-btn");
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
      btn.classList.toggle("muted", isMuted);
      btn.innerHTML = isMuted ? `🔇 Audio Off` : `🔊 Audio On`;
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

      // Check active day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayIndex = now.getDay();
      const currentDayName = DAYS[dayIndex - 1]; // Monday is index 0 in DAYS

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
          statusEl.textContent = "Sunday · Campus Dormant";
        } else if (activePeriod) {
          statusEl.textContent = `Live: ${activePeriod.label} (${activePeriod.displayStart} – ${activePeriod.displayEnd})`;
        } else if (currentTotalMin >= 10 * 60 + 20 && currentTotalMin < 10 * 60 + 45) {
          statusEl.textContent = "Live: Short Break Interval";
        } else if (currentTotalMin >= 12 * 60 + 35 && currentTotalMin < 13 * 60 + 50) {
          statusEl.textContent = "Live: Lunch Interval Overlap";
        } else {
          statusEl.textContent = "Outside Academic Hours";
        }
      }

      // Highlight active cell in current section view
      document.querySelectorAll(".cell-quantum").forEach((c) => c.classList.remove("now-active"));
      if (currentDayName && activePeriod !== null) {
        const activeCell = document.querySelector(
          `[data-day="${currentDayName}"][data-period="${activePeriod.id}"]`
        );
        if (activeCell) activeCell.classList.add("now-active");
      }
    };

    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ===================== SECTION VIEW (CHRONOS GRID) ===================== */
  buildSectionPigeonholes() {
    const container = document.getElementById("sectionPigeonholes");
    if (!container) return;
    container.innerHTML = "";

    Object.keys(SECTIONS).forEach((secKey) => {
      const secData = SECTIONS[secKey];
      const tag = document.createElement("div");
      tag.className = "pigeon-tag" + (secKey === this.currentSection ? " active" : "");
      tag.innerHTML = `5${secKey} <small>${secData.room.split(",")[0].trim()}</small>`;
      tag.addEventListener("click", () => {
        WormholeAudio.tick();
        this.currentSection = secKey;
        this.buildSectionPigeonholes();
        this.renderChronosGrid();
      });
      container.appendChild(tag);
    });
  }

  renderChronosGrid() {
    const secData = SECTIONS[this.currentSection];
    const titleEl = document.getElementById("chronosSectionTitle");
    const metaEl = document.getElementById("chronosSectionMeta");
    const tableEl = document.getElementById("chronosTimetable");

    if (titleEl) titleEl.textContent = `Section 5${this.currentSection} Timetable`;
    if (metaEl) {
      metaEl.innerHTML = `Advisor: <b style="color:var(--neon-cyan);">${secData.advisor}</b> &nbsp;·&nbsp; Primary Room: <b style="color:var(--text-primary);">${secData.room}</b>`;
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
        <td class="code-cell">${c.code}</td>
        <td style="font-weight:600; color:var(--text-primary);">${c.name}</td>
        <td>${c.faculty}</td>
      `;
      tbody.appendChild(tr);

      (c.labs || []).forEach((l) => {
        const labTr = document.createElement("tr");
        labTr.className = "lab-row";
        labTr.innerHTML = `
          <td class="code-cell" style="padding-left:26px;">${l.tag}</td>
          <td style="color:var(--neon-purple); font-style:italic;">Practical Lab Division</td>
          <td>${l.faculty}</td>
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

  /* ===================== THE RIFT (SYNC ENGINE) ===================== */
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

    const heading = document.getElementById("riftHeading");
    if (heading) {
      heading.textContent = `Class-Time Overlaps: 5${this.secA} × 5${this.secB}`;
    }

    // Compute overlapping contiguous windows
    const windows = [];
    DAYS.forEach((day) => {
      let i = 0;
      while (i < 7) {
        const la = A.data.days[day][i];
        const lb = B.data.days[day][i];
        const score = Math.min(CAT_LEVELS[categorizePeriod(la)], CAT_LEVELS[categorizePeriod(lb)]);

        if (score > 0) {
          let j = i;
          while (j + 1 < 7) {
            const la2 = A.data.days[day][j + 1];
            const lb2 = B.data.days[day][j + 1];
            const s2 = Math.min(CAT_LEVELS[categorizePeriod(la2)], CAT_LEVELS[categorizePeriod(lb2)]);
            if (s2 === score) j++;
            else break;
          }
          windows.push({ day, start: i, end: j, score });
          i = j + 1;
        } else {
          i++;
        }
      }
    });

    // Sort by priority tier, then duration
    windows.sort((x, y) => y.score - x.score || y.end - y.start - (x.end - x.start));

    const rankList = document.getElementById("riftRankList");
    if (rankList) {
      rankList.innerHTML = "";
      if (windows.length === 0) {
        rankList.innerHTML = `
          <li class="wormhole-glass rank-card" style="justify-content:center; color:var(--text-secondary);">
            No direct class-time overlaps detected this week — leverage the guaranteed daily breaks above!
          </li>
        `;
      } else {
        if (windows.some((w) => w.score === 3)) {
          WormholeAudio.resonance();
        }

        windows.forEach((w, idx) => {
          const li = document.createElement("li");
          li.className = "wormhole-glass rank-card";
          const startT = PERIODS[w.start].displayStart;
          const endT = PERIODS[w.end].displayEnd;
          const tierClass = `tier-${w.score}`;
          const scoreLabel =
            w.score === 3
              ? "100% Quantum Free"
              : w.score === 2
              ? "Dual Flexible Shift"
              : "Low Friction Skip";

          const reason =
            w.score === 3
              ? `5${this.secA}: ${A.data.days[w.day][w.start]} &nbsp;·&nbsp; 5${this.secB}: ${B.data.days[w.day][w.start]}`
              : `5${this.secA}: ${A.data.days[w.day].slice(w.start, w.end + 1).join(" → ")} &nbsp;·&nbsp; 5${this.secB}: ${B.data.days[w.day].slice(w.start, w.end + 1).join(" → ")}`;

          li.innerHTML = `
            <div class="rank-index">${idx + 1}</div>
            <div class="rank-details">
              <div class="rank-time">${w.day}, ${startT} – ${endT}</div>
              <div class="rank-reason">${reason}</div>
            </div>
            <div class="rank-pill ${tierClass}">${scoreLabel}</div>
          `;
          rankList.appendChild(li);
        });
      }
    }

    // Render Overlay Matrix Table
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
          <td class="code-cell">${idx === 0 ? e.no : ""}</td>
          <td style="font-weight:600; color:var(--text-primary);">${idx === 0 ? e.name : ""}</td>
          <td>${r[0]}</td>
          <td style="font-family:var(--font-mono); color:var(--neon-cyan); font-weight:700;">${r[1]}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  /* ===================== GRID GENERATOR (Single & Dual Overlay) ===================== */
  generateGridHTML(sectionsArr, isOverlay) {
    let html = "<thead><tr><th class='day-col'>Day</th>";
    PERIODS.forEach((p, i) => {
      html += `<th>${p.label}<span class="period-time">${p.displayStart} – ${p.displayEnd}</span></th>`;
      if (i === 1 || i === 3) html += `<th class="break-col"></th>`;
    });
    html += "</tr></thead><tbody>";

    DAYS.forEach((day) => {
      html += `<tr><td class="day-col">${day}</td>`;
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
              : "cat-fixed";

          const badge =
            score > 0
              ? `<span class="cell-badge">${score === 3 ? "BOTH FREE" : score === 2 ? "FLEX OVERLAP" : "SKIP LOW"}</span>`
              : "";

          html += `
            <td class="cell-quantum ${cls}">
              <div class="cell-subject-lbl"><span style="color:var(--neon-cyan);">5${a.key}:</span> ${la}</div>
              <div class="cell-subject-lbl" style="margin-top:4px;"><span style="color:var(--neon-purple);">5${b.key}:</span> ${lb}</div>
              ${badge}
            </td>
          `;
        } else {
          const label = sectionsArr[0].data.days[day][i];
          const cat = categorizePeriod(label);
          const badge = CAT_LABELS[cat]
            ? `<span class="cell-badge">${CAT_LABELS[cat]}</span>`
            : "";

          html += `
            <td class="cell-quantum cat-${cat}" data-day="${day}" data-period="${i}">
              <div class="cell-subject-lbl">${label}</div>
              ${badge}
            </td>
          `;
        }

        if (i === 1 || i === 3) html += `<td class="break-col"></td>`;
      }
      html += "</tr>";
    });

    html += "</tbody>";
    return html;
  }

  /* ===================== ICS CALENDAR EXPORTER ===================== */
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

      // Generate recurring events for the semester
      DAYS.forEach((day, dayIndex) => {
        // Map day name to day of week
        const dayMap = ["MO", "TU", "WE", "TH", "FR", "SA"];
        const byDay = dayMap[dayIndex];

        PERIODS.forEach((p, pIndex) => {
          const subject = secData.days[day][pIndex];
          if (!subject) return;

          const [sh, sm] = p.start.split(":");
          const [eh, em] = p.end.split(":");

          // Create base ISO timestamp (e.g. 20260810T083000)
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

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.Wormhole = new WormholeApp();
});
