/**
 * WORMHOLE Flagship Spacetime Engine
 * Multi-Section Squad Sync (2-8 batches), Live Quantum Radar Beacon, Command Palette (⌘K), & Magic URLs.
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
const CAT_LABELS = { free: "FREE · 100%", skiphigh: "FLEX · PE-1", skiplow: "SKIP · CTS", fixed: "" };

class WormholeApp {
  constructor() {
    this.currentSection = "H";
    this.squad = ["H", "L", "A"]; // Default multi-section squad
    this.searchQuery = "";
    this.vortex = null;
    this.commandPaletteOpen = false;

    this.init();
  }

  init() {
    // 1. Initialize Gravitational Singularity Canvas
    this.vortex = new WormholeVortex("vortexCanvas");

    // 2. Parse URL Hash State (e.g. #squad=H,L,A&sec=H)
    this.parseURLHash();

    // 3. Setup UI & Modules
    this.initNavigation();
    this.initAudioToggle();
    this.initKeyboardShortcuts();
    this.initCommandPalette();
    this.initSquadSync();
    this.buildSectionPigeonholes();
    this.initICSExporter();
    this.initShareLink();
    this.initSearch();

    // 4. Render Initial Views
    this.renderChronosGrid();
    this.renderSquadSync();
    this.renderElectives();
    this.renderAnalytics();

    // 5. Start Live Quantum Beacon Clock
    this.startLiveRadar();
  }

  /* ===================== URL HASH STATE SERIALIZATION ===================== */
  parseURLHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    if (params.has("squad")) {
      const s = params.get("squad").split(",").filter((k) => SECTIONS[k.toUpperCase()]);
      if (s.length >= 2) this.squad = s.map((k) => k.toUpperCase());
    }
    if (params.has("sec")) {
      const s = params.get("sec").toUpperCase();
      if (SECTIONS[s]) this.currentSection = s;
    }
  }

  updateURLHash() {
    const params = new URLSearchParams();
    params.set("squad", this.squad.join(","));
    params.set("sec", this.currentSection);
    history.replaceState(null, "", "#" + params.toString());
  }

  initShareLink() {
    const btn = document.getElementById("copyShareLinkBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      this.updateURLHash();
      navigator.clipboard.writeText(window.location.href).then(() => {
        WormholeAudio.resonance();
        btn.textContent = "✓ Link Copied!";
        setTimeout(() => {
          btn.innerHTML = "🔗 Share Squad Link";
        }, 2000);
      });
    });
  }

  /* ===================== COMMAND PALETTE (⌘K) ===================== */
  initCommandPalette() {
    const modal = document.getElementById("commandPaletteModal");
    const input = document.getElementById("cmdSearchInput");
    const results = document.getElementById("cmdSearchResults");
    if (!modal || !input || !results) return;

    window.openCommandPalette = () => {
      WormholeAudio.tick();
      this.commandPaletteOpen = true;
      modal.classList.add("open");
      input.value = "";
      input.focus();
      this.renderCommandResults("");
    };

    window.closeCommandPalette = () => {
      this.commandPaletteOpen = false;
      modal.classList.remove("open");
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeCommandPalette();
    });

    input.addEventListener("input", (e) => {
      this.renderCommandResults(e.target.value.trim());
    });
  }

  renderCommandResults(query) {
    const results = document.getElementById("cmdSearchResults");
    if (!results) return;
    results.innerHTML = "";

    const q = query.toLowerCase();
    const items = [];

    // Search Sections
    Object.keys(SECTIONS).forEach((k) => {
      const s = SECTIONS[k];
      if (!q || `section 5${k} ${s.advisor} ${s.room}`.toLowerCase().includes(q)) {
        items.push({
          type: "Section",
          title: `Jump to Section 5${k}`,
          sub: `Advisor: ${s.advisor} · Room: ${s.room}`,
          badge: `5${k}`,
          action: () => {
            this.currentSection = k;
            this.buildSectionPigeonholes();
            this.renderChronosGrid();
            this.renderAnalytics();
            document.querySelector('[data-view="chronos"]').click();
          },
        });
      }
    });

    // Search Courses across all sections
    const seenCourses = new Set();
    Object.values(SECTIONS).forEach((sec) => {
      (sec.courses || []).forEach((c) => {
        if (seenCourses.has(c.code)) return;
        seenCourses.add(c.code);
        if (!q || `${c.code} ${c.name} ${c.faculty}`.toLowerCase().includes(q)) {
          items.push({
            type: "Course",
            title: `${c.code}: ${c.name}`,
            sub: `Faculty: ${c.faculty}`,
            badge: "COURSE",
            action: () => {
              document.querySelector('[data-view="chronos"]').click();
              const filterInput = document.getElementById("facultySearchInput");
              if (filterInput) {
                filterInput.value = c.code;
                filterInput.dispatchEvent(new Event("input"));
              }
            },
          });
        }
      });
    });

    // Quick Actions
    if (!q || "export ics calendar download".includes(q)) {
      items.push({
        type: "Action",
        title: `Export Section 5${this.currentSection} Calendar (.ICS)`,
        sub: "Sync timetable to Apple Calendar, Google Calendar or Outlook",
        badge: "CALENDAR",
        action: () => {
          const exportBtn = document.getElementById("exportIcsBtn");
          if (exportBtn) exportBtn.click();
        },
      });
    }

    if (!q || "squad compare sync".includes(q)) {
      items.push({
        type: "Action",
        title: "Open Multi-Section Squad Sync",
        sub: `Currently comparing ${this.squad.map((k) => "5" + k).join(" + ")}`,
        badge: "SQUAD",
        action: () => {
          document.querySelector('[data-view="squad"]').click();
        },
      });
    }

    if (items.length === 0) {
      results.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-dim); font-size:13px;">No results found for "${query}"</div>`;
      return;
    }

    items.slice(0, 8).forEach((item) => {
      const div = document.createElement("div");
      div.className = "cmd-item";
      div.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--text-main); font-size:13.5px;">${item.title}</div>
          <div style="font-size:11.5px; color:var(--text-dim); margin-top:2px;">${item.sub}</div>
        </div>
        <span class="kbd-badge" style="font-size:10px;">${item.badge}</span>
      `;
      div.addEventListener("click", () => {
        WormholeAudio.tick();
        window.closeCommandPalette();
        item.action();
      });
      results.appendChild(div);
    });
  }

  /* ===================== KEYBOARD SHORTCUTS ===================== */
  initKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      // ⌘K / Ctrl+K Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (this.commandPaletteOpen) window.closeCommandPalette();
        else window.openCommandPalette();
        return;
      }

      if (e.key === "Escape" && this.commandPaletteOpen) {
        window.closeCommandPalette();
        return;
      }

      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

      const key = e.key.toUpperCase();

      // Number keys 1-4 switch views
      if (["1", "2", "3", "4"].includes(key)) {
        const views = ["squad", "chronos", "electives", "docs"];
        const btn = document.querySelector(`[data-view="${views[Number(key) - 1]}"]`);
        if (btn) btn.click();
      }

      // Letter keys A-L switch section in Chronos
      if (Object.keys(SECTIONS).includes(key)) {
        WormholeAudio.tick();
        this.currentSection = key;
        this.updateURLHash();
        this.buildSectionPigeonholes();
        this.renderChronosGrid();
        this.renderAnalytics();
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

  /* ===================== LIVE QUANTUM BEACON RADAR ===================== */
  startLiveRadar() {
    const clockEl = document.getElementById("liveClockTime");
    const statusEl = document.getElementById("livePeriodStatus");
    const countdownEl = document.getElementById("beaconCountdown");
    const freeSectionsList = document.getElementById("beaconFreeSections");

    const tickClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;

      const dayIndex = now.getDay();
      const currentDayName = DAYS[dayIndex - 1];

      let activePeriod = null;
      let remainingSec = 0;
      const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const currentTotalMin = now.getHours() * 60 + now.getMinutes();

      PERIODS.forEach((p) => {
        const [sh, sm] = p.start.split(":").map(Number);
        const [eh, em] = p.end.split(":").map(Number);
        const startSec = sh * 3600 + sm * 60;
        const endSec = eh * 3600 + em * 60;

        if (currentTotalSec >= startSec && currentTotalSec < endSec) {
          activePeriod = p;
          remainingSec = endSec - currentTotalSec;
        }
      });

      // Update Live Period Countdown HUD
      if (countdownEl) {
        if (activePeriod) {
          const remMin = Math.floor(remainingSec / 60);
          const remSec = remainingSec % 60;
          countdownEl.textContent = `${remMin}m ${String(remSec).padStart(2, "0")}s left`;
        } else {
          countdownEl.textContent = "Outside Academic Hours";
        }
      }

      if (statusEl) {
        if (dayIndex === 0) {
          statusEl.textContent = "Sunday · Off Grid";
        } else if (activePeriod) {
          statusEl.textContent = `Period ${activePeriod.id + 1} (${activePeriod.displayStart} – ${activePeriod.displayEnd})`;
        } else if (currentTotalMin >= 10 * 60 + 20 && currentTotalMin < 10 * 60 + 45) {
          statusEl.textContent = "Short Break Interval";
        } else if (currentTotalMin >= 12 * 60 + 35 && currentTotalMin < 13 * 60 + 50) {
          statusEl.textContent = "Midday Lunch Interval";
        } else {
          statusEl.textContent = "Campus Dormant";
        }
      }

      // Scanner: Which sections are currently 100% FREE right now?
      if (freeSectionsList && currentDayName && activePeriod !== null) {
        const freeSecs = [];
        Object.keys(SECTIONS).forEach((secKey) => {
          const sub = SECTIONS[secKey].days[currentDayName][activePeriod.id];
          if (categorizePeriod(sub) === "free") {
            freeSecs.push({ key: secKey, sub });
          }
        });

        if (freeSecs.length > 0) {
          freeSectionsList.innerHTML = freeSecs
            .map(
              (f) => `
              <span class="beacon-chip" onclick="window.Wormhole.switchSection('${f.key}')" title="Currently has ${f.sub}">
                <span class="status-dot"></span> 5${f.key} (${f.sub})
              </span>
            `
            )
            .join("");
        } else {
          freeSectionsList.innerHTML = `<span style="color:var(--text-dim); font-size:12px;">All 12 sections currently in fixed classes or labs.</span>`;
        }
      }

      // Highlight active cell in current section grid
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

  switchSection(secKey) {
    WormholeAudio.tick();
    this.currentSection = secKey;
    this.updateURLHash();
    this.buildSectionPigeonholes();
    this.renderChronosGrid();
    this.renderAnalytics();
    document.querySelector('[data-view="chronos"]').click();
  }

  /* ===================== MULTI-SECTION SQUAD SYNC ===================== */
  initSquadSync() {
    this.renderSquadChips();
    this.buildAddSquadDropdown();
  }

  renderSquadChips() {
    const container = document.getElementById("squadChipsContainer");
    if (!container) return;
    container.innerHTML = "";

    this.squad.forEach((secKey) => {
      const chip = document.createElement("div");
      chip.className = "squad-chip";
      chip.innerHTML = `
        <span>Section 5${secKey}</span>
        ${this.squad.length > 2 ? `<button class="chip-remove" title="Remove">&times;</button>` : ""}
      `;

      const removeBtn = chip.querySelector(".chip-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          WormholeAudio.tick();
          this.squad = this.squad.filter((k) => k !== secKey);
          this.updateURLHash();
          this.renderSquadChips();
          this.renderSquadSync();
        });
      }

      container.appendChild(chip);
    });
  }

  buildAddSquadDropdown() {
    const select = document.getElementById("addSquadSectionSelect");
    if (!select) return;
    select.innerHTML = '<option value="">+ Add Section to Squad</option>';

    Object.keys(SECTIONS).forEach((k) => {
      if (!this.squad.includes(k)) {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = `+ Add Section 5${k}`;
        select.appendChild(opt);
      }
    });

    select.onchange = () => {
      if (select.value) {
        WormholeAudio.warp();
        if (this.vortex) this.vortex.triggerWarp();
        this.squad.push(select.value);
        this.updateURLHash();
        this.renderSquadChips();
        this.buildAddSquadDropdown();
        this.renderSquadSync();
      }
    };
  }

  renderSquadSync() {
    const sectionsArr = this.squad.map((k) => ({ key: k, data: SECTIONS[k] }));

    // Calculate N-way set intersection
    const windows = [];
    let sharedFreeSlotsCount = 0;
    let totalSlots = 6 * 7; // 42 slots

    DAYS.forEach((day) => {
      let i = 0;
      while (i < 7) {
        // Find minimum score across all squad sections for this slot
        const scores = sectionsArr.map((s) => CAT_LEVELS[categorizePeriod(s.data.days[day][i])]);
        const minScore = Math.min(...scores);

        if (minScore > 0) {
          sharedFreeSlotsCount++;
          let j = i;
          while (j + 1 < 7) {
            const nextScores = sectionsArr.map((s) => CAT_LEVELS[categorizePeriod(s.data.days[day][j + 1])]);
            const nextMin = Math.min(...nextScores);
            if (nextMin === minScore) {
              sharedFreeSlotsCount++;
              j++;
            } else break;
          }
          windows.push({ day, start: i, end: j, score: minScore });
          i = j + 1;
        } else {
          i++;
        }
      }
    });

    // Compute collective alignment score percentage
    const squadAlignment = Math.min(98, Math.round(50 + (sharedFreeSlotsCount / 12) * 45));
    const scoreBadge = document.getElementById("squadSyncScoreBadge");
    if (scoreBadge) {
      scoreBadge.textContent = `${squadAlignment}% Collective Alignment`;
    }

    windows.sort((x, y) => y.score - x.score || y.end - y.start - (x.end - x.start));

    const rankList = document.getElementById("squadRankList");
    if (rankList) {
      rankList.innerHTML = "";
      if (windows.length === 0) {
        rankList.innerHTML = `
          <li class="card-minimal rank-item" style="justify-content:center; color:var(--text-dim); padding:20px;">
            No direct class overlaps across all ${this.squad.length} sections — utilize morning break (10:20 AM) and lunch (12:35 PM).
          </li>
        `;
      } else {
        if (windows.some((w) => w.score === 3)) WormholeAudio.resonance();

        windows.forEach((w, idx) => {
          const li = document.createElement("li");
          li.className = "card-minimal rank-item";
          const startT = PERIODS[w.start].displayStart;
          const endT = PERIODS[w.end].displayEnd;
          const tierClass = `tier-${w.score}`;
          const scoreLabel =
            w.score === 3
              ? "All Free (MOOC / Office)"
              : w.score === 2
              ? "PE-1 Elective Overlap"
              : "CTS Low Friction";

          const details = sectionsArr
            .map((s) => `5${s.key}: ${s.data.days[w.day].slice(w.start, w.end + 1).join(" ")}`)
            .join(" · ");

          li.innerHTML = `
            <div class="rank-num">0${idx + 1}</div>
            <div class="rank-main">
              <div class="rank-header">${w.day}, ${startT} – ${endT}</div>
              <div class="rank-sub">${details}</div>
            </div>
            <div class="tier-pill ${tierClass}">${scoreLabel}</div>
          `;
          rankList.appendChild(li);
        });
      }
    }

    // Render Multi-Squad Heatmap Matrix
    const matrixTable = document.getElementById("squadOverlayTable");
    if (matrixTable) {
      matrixTable.innerHTML = this.generateMultiGridHTML(sectionsArr);
    }
  }

  generateMultiGridHTML(sectionsArr) {
    let html = "<thead><tr><th class='day-cell'>Day</th>";
    PERIODS.forEach((p, i) => {
      html += `<th>${p.label}<span class="th-time">${p.displayStart} – ${p.displayEnd}</span></th>`;
      if (i === 1 || i === 3) html += `<th class="break-cell"></th>`;
    });
    html += "</tr></thead><tbody>";

    DAYS.forEach((day) => {
      html += `<tr><td class="day-cell">${day.substring(0, 3)}</td>`;
      for (let i = 0; i < 7; i++) {
        const scores = sectionsArr.map((s) => CAT_LEVELS[categorizePeriod(s.data.days[day][i])]);
        const minScore = Math.min(...scores);
        const cls =
          minScore === 3
            ? "cat-free"
            : minScore === 2
            ? "cat-skiphigh"
            : minScore === 1
            ? "cat-skiplow"
            : "";

        const badge =
          minScore > 0
            ? `<span class="cell-tag">${minScore === 3 ? "ALL FREE" : minScore === 2 ? "FLEX" : "SKIP"}</span>`
            : "";

        const lines = sectionsArr
          .map((s) => `<div class="cell-name"><span style="color:var(--text-dim); font-size:10.5px;">5${s.key}:</span> ${s.data.days[day][i]}</div>`)
          .join("");

        html += `
          <td class="cell-slot ${cls}">
            ${lines}
            ${badge}
          </td>
        `;

        if (i === 1 || i === 3) html += `<td class="break-cell"></td>`;
      }
      html += "</tr>";
    });

    html += "</tbody>";
    return html;
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
        this.updateURLHash();
        this.buildSectionPigeonholes();
        this.renderChronosGrid();
        this.renderAnalytics();
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
      tableEl.innerHTML = this.generateSingleGridHTML(secData);
    }

    this.renderDirectory(secData.courses);
  }

  generateSingleGridHTML(secData) {
    let html = "<thead><tr><th class='day-cell'>Day</th>";
    PERIODS.forEach((p, i) => {
      html += `<th>${p.label}<span class="th-time">${p.displayStart} – ${p.displayEnd}</span></th>`;
      if (i === 1 || i === 3) html += `<th class="break-cell"></th>`;
    });
    html += "</tr></thead><tbody>";

    DAYS.forEach((day) => {
      html += `<tr><td class="day-cell">${day.substring(0, 3)}</td>`;
      for (let i = 0; i < 7; i++) {
        const label = secData.days[day][i];
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

        if (i === 1 || i === 3) html += `<td class="break-cell"></td>`;
      }
      html += "</tr>";
    });

    html += "</tbody>";
    return html;
  }

  renderDirectory(courses) {
    const tbody = document.getElementById("directoryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = (courses || []).filter((c) => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.faculty.toLowerCase().includes(q) ||
        (c.labs || []).some((l) => l.faculty.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q))
      );
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

  /* ===================== ATTENDANCE & FRICTION ANALYTICS ===================== */
  renderAnalytics() {
    const secData = SECTIONS[this.currentSection];
    let freeHours = 0;
    let flexHours = 0;
    let skipHours = 0;

    DAYS.forEach((day) => {
      for (let i = 0; i < 7; i++) {
        const cat = categorizePeriod(secData.days[day][i]);
        if (cat === "free") freeHours += 0.92; // ~55 mins per period
        if (cat === "skiphigh") flexHours += 0.92;
        if (cat === "skiplow") skipHours += 0.92;
      }
    });

    const freeHoursEl = document.getElementById("analyticsFreeHours");
    if (freeHoursEl) freeHoursEl.textContent = `${freeHours.toFixed(1)} hrs`;

    const flexHoursEl = document.getElementById("analyticsFlexHours");
    if (flexHoursEl) flexHoursEl.textContent = `${flexHours.toFixed(1)} hrs`;
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
