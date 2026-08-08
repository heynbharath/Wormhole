/**
 * WORMHOLE Flagship Spacetime Engine (v5.0)
 * DSU ERP Live Attendance Sync, Student Personalization Profile, 75% Bunk Simulator & Multi-Section Hive.
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
    this.attendanceModalOpen = false;
    this.profileModalOpen = false;

    // Load or initialize Student Profile & DSU Attendance
    this.profile = this.loadProfile();
    this.attendance = this.loadAttendance();
    this.simulatedAttendance = JSON.parse(JSON.stringify(this.attendance));

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
    this.initWhatsAppBroadcaster();
    this.initSearch();
    this.initProfileManager();
    this.initAttendanceEngine();

    // 4. Render Initial Views
    this.renderProfileBanner();
    this.renderChronosGrid();
    this.renderSquadSync();
    this.renderElectives();
    this.renderAnalytics();
    this.renderAttendanceDashboard();

    // 5. Start Live Quantum Beacon Clock
    this.startLiveRadar();
  }

  /* ===================== STUDENT PROFILE MANAGEMENT ===================== */
  loadProfile() {
    try {
      const saved = localStorage.getItem("wormhole_student_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.pe1 && parsed.pe1.code) {
          // Validate that elective exists
          const exists = ELECTIVES.find((e) => e.code === parsed.pe1.code);
          if (exists) return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load stored profile, using defaults", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STUDENT_PROFILE));
  }

  saveProfile(newProfile) {
    this.profile = { ...this.profile, ...newProfile };
    try {
      localStorage.setItem("wormhole_student_profile", JSON.stringify(this.profile));
    } catch (e) {}
    this.currentSection = this.profile.section;
    this.renderProfileBanner();
    this.buildSectionPigeonholes();
    this.renderChronosGrid();
    this.renderElectives();
    this.renderAnalytics();
    this.renderSquadSync();
  }

  initProfileManager() {
    const modal = document.getElementById("profileModal");
    const closeBtn = document.getElementById("closeProfileModalBtn");
    const saveBtn = document.getElementById("saveProfileBtn");

    const populateElectives = () => {
      const electiveSelect = document.getElementById("profileElectiveSelect");
      if (!electiveSelect) return;
      electiveSelect.innerHTML = "";
      ELECTIVES.forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e.code;
        opt.textContent = `${e.name}`;
        if (this.profile.pe1 && this.profile.pe1.code === e.code) {
          opt.selected = true;
        }
        electiveSelect.appendChild(opt);
      });
    };

    window.openProfileModal = () => {
      WormholeAudio.tick();
      this.profileModalOpen = true;
      if (modal) modal.classList.add("open");

      // Fill current values
      const secSelect = document.getElementById("profileSectionSelect");
      const batchSelect = document.getElementById("profileBatchSelect");
      const electiveSelect = document.getElementById("profileElectiveSelect");

      if (secSelect) secSelect.value = this.profile.section;
      if (batchSelect) batchSelect.value = String(this.profile.labBatch);

      populateElectives();
      if (electiveSelect && this.profile.pe1 && this.profile.pe1.code) {
        electiveSelect.value = this.profile.pe1.code;
      }

      this.updateElectiveFacultyOptions();
    };

    window.closeProfileModal = () => {
      this.profileModalOpen = false;
      if (modal) modal.classList.remove("open");
    };

    if (closeBtn) closeBtn.addEventListener("click", window.closeProfileModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) window.closeProfileModal();
      });
    }

    const electiveSelect = document.getElementById("profileElectiveSelect");
    if (electiveSelect) {
      electiveSelect.addEventListener("change", () => this.updateElectiveFacultyOptions());
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const sec = document.getElementById("profileSectionSelect").value;
        const batch = parseInt(document.getElementById("profileBatchSelect").value, 10);
        const electiveCode = document.getElementById("profileElectiveSelect").value;
        const facultyVal = document.getElementById("profileElectiveFacultySelect").value;

        let facultyName = "Prof. Goutham T R (Gowtham)";
        let room = "A432";
        if (facultyVal && facultyVal.includes("||")) {
          const parts = facultyVal.split("||");
          facultyName = parts[0];
          room = parts[1];
        }

        const electiveObj = ELECTIVES.find((e) => e.code === electiveCode) || ELECTIVES[0];
        const cleanName = electiveObj.name.includes("—") ? electiveObj.name.split("—")[1].trim() : electiveObj.name;

        this.saveProfile({
          section: sec,
          labBatch: batch,
          pe1: {
            code: electiveCode,
            name: cleanName,
            faculty: facultyName,
            room: room,
          },
        });

        WormholeAudio.resonance();
        window.closeProfileModal();
      });
    }
  }

  updateElectiveFacultyOptions() {
    const electiveSelect = document.getElementById("profileElectiveSelect");
    const facultySelect = document.getElementById("profileElectiveFacultySelect");
    if (!electiveSelect || !facultySelect) return;

    const code = electiveSelect.value;
    const electiveObj = ELECTIVES.find((e) => e.code === code) || ELECTIVES[0];
    facultySelect.innerHTML = "";

    (electiveObj.facultyList || []).forEach((f) => {
      const opt = document.createElement("option");
      opt.value = `${f.name}||${f.room}`;
      opt.textContent = `${f.name} (Room ${f.room})`;

      if (this.profile.pe1 && this.profile.pe1.faculty) {
        const pFac = this.profile.pe1.faculty.toLowerCase();
        const fName = f.name.toLowerCase();
        if (pFac === fName || fName.includes(pFac) || pFac.includes(fName) || (pFac.includes("gowtham") && fName.includes("goutham"))) {
          opt.selected = true;
        }
      }
      facultySelect.appendChild(opt);
    });
  }

  renderProfileBanner() {
    const nameEl = document.getElementById("profileStudentName");
    const usnEl = document.getElementById("profileStudentUsn");
    const secEl = document.getElementById("profileStudentSection");
    const batchEl = document.getElementById("profileStudentBatch");
    const pe1El = document.getElementById("profileStudentElective");
    const navTag = document.getElementById("profileNavTag");

    if (nameEl) nameEl.textContent = this.profile.name;
    if (usnEl) usnEl.textContent = this.profile.usn;
    if (secEl) secEl.textContent = `Section 5${this.profile.section}`;
    if (batchEl) batchEl.textContent = `Batch 5${this.profile.section}${this.profile.labBatch}`;
    if (pe1El) {
      const facName = this.profile.pe1.faculty ? this.profile.pe1.faculty.replace("Prof. ", "").replace("Dr. ", "").split(" (")[0] : "";
      pe1El.textContent = `${this.profile.pe1.name} (${facName} · ${this.profile.pe1.room})`;
    }
    if (navTag) navTag.textContent = `Profile: 5${this.profile.section}${this.profile.labBatch}`;
  }

  /* ===================== DSU ERP ATTENDANCE SYNC ===================== */
  loadAttendance() {
    try {
      const saved = localStorage.getItem("wormhole_dsu_attendance");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load stored attendance, using defaults", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DSU_ATTENDANCE));
  }

  saveAttendance(data) {
    this.attendance = data;
    this.simulatedAttendance = JSON.parse(JSON.stringify(data));
    try {
      localStorage.setItem("wormhole_dsu_attendance", JSON.stringify(data));
    } catch (e) {}
    this.renderAttendanceDashboard();
    this.renderChronosGrid();
  }

  initAttendanceEngine() {
    const modal = document.getElementById("attendanceModal");
    const closeBtn = document.getElementById("closeAttendanceModalBtn");
    const parseBtn = document.getElementById("parseAttendanceTextBtn");
    const resetBtn = document.getElementById("resetAttendanceBtn");

    window.openAttendanceModal = () => {
      WormholeAudio.tick();
      this.attendanceModalOpen = true;
      if (modal) modal.classList.add("open");
      this.renderAttendanceModalTable();
    };

    window.closeAttendanceModal = () => {
      this.attendanceModalOpen = false;
      if (modal) modal.classList.remove("open");
    };

    if (closeBtn) closeBtn.addEventListener("click", window.closeAttendanceModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) window.closeAttendanceModal();
      });
    }

    if (parseBtn) {
      parseBtn.addEventListener("click", () => {
        const txt = document.getElementById("attendancePasteArea")?.value || "";
        this.parseERPText(txt);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        WormholeAudio.tick();
        this.saveAttendance(JSON.parse(JSON.stringify(DEFAULT_DSU_ATTENDANCE)));
        this.renderAttendanceModalTable();
      });
    }

    // Bookmarklet generator
    const bookmarkletBtn = document.getElementById("dsuBookmarkletLink");
    if (bookmarkletBtn) {
      const code = `javascript:(function(){
        try {
          var rows = document.querySelectorAll('table tbody tr');
          var text = document.body.innerText;
          alert('Wormhole: Attendance copied! Open Wormhole and click Sync DSU ERP to paste.');
          navigator.clipboard.writeText(text);
        } catch(e) { alert('Error reading DSU ERP: ' + e); }
      })();`;
      bookmarkletBtn.setAttribute("href", code);
    }
  }

  parseERPText(text) {
    if (!text.trim()) return;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const courses = [];
    let totalConducted = 0;
    let totalPresent = 0;
    let totalAbsent = 0;

    // Look for course lines with 24CS35XX codes
    lines.forEach((line) => {
      const match = line.match(/(24CS35\d{2})\s*[-—]?\s*([A-Za-z &]+)/i);
      if (match) {
        const code = match[1].toUpperCase();
        const name = match[2].trim();
        // Look for numbers nearby
        const nums = line.match(/\b\d+(\.\d+)?\b/g);
        let conducted = 0,
          present = 0,
          absent = 0;
        if (nums && nums.length >= 3) {
          conducted = parseInt(nums[0], 10) || 0;
          present = parseInt(nums[1], 10) || 0;
          absent = parseInt(nums[2], 10) || 0;
        }

        const pct = conducted > 0 ? (present / conducted) * 100 : 100;
        totalConducted += conducted;
        totalPresent += present;
        totalAbsent += absent;

        courses.push({
          code,
          name,
          conducted,
          present,
          absent,
          pct: parseFloat(pct.toFixed(2)),
          type: "Theory",
        });
      }
    });

    if (courses.length > 0) {
      const overallPct = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 100;
      this.saveAttendance({
        student: {
          ...this.attendance.student,
          totalConducted,
          totalPresent,
          totalAbsent,
          overallPct: parseFloat(overallPct.toFixed(2)),
        },
        courses,
      });
      WormholeAudio.resonance();
      alert(`✓ Successfully synced ${courses.length} courses from DSU ERP!`);
      this.renderAttendanceModalTable();
    } else {
      alert("Could not detect standard 24CS35XX format. Please check text or use default dataset.");
    }
  }

  calculateHealth(conducted, present) {
    const absent = conducted - present;
    const pct = conducted > 0 ? (present / conducted) * 100 : 100;
    const isSafe = pct >= 75.0;

    // Buffer classes you can safely skip
    const bunkBuffer = Math.max(0, Math.floor((present - 0.75 * conducted) / 0.75));

    // Classes needed consecutively to cross 75%
    const classesNeeded = Math.max(0, Math.ceil(3 * absent - present));

    return {
      pct: parseFloat(pct.toFixed(2)),
      isSafe,
      bunkBuffer,
      classesNeeded,
      status: pct >= 85 ? "EXCELLENT" : pct >= 75 ? "SAFE" : pct >= 65 ? "WARNING" : "CRITICAL",
    };
  }

  renderAttendanceDashboard() {
    const overallPctEl = document.getElementById("overallAttendancePct");
    const overallConductedEl = document.getElementById("overallConductedSlots");
    const overallPresentEl = document.getElementById("overallPresentSlots");
    const overallAbsentEl = document.getElementById("overallAbsentSlots");
    const statusBadgeEl = document.getElementById("overallAttendanceStatusBadge");

    const st = this.attendance.student;
    const health = this.calculateHealth(st.totalConducted, st.totalPresent);

    if (overallPctEl) overallPctEl.textContent = `${health.pct}%`;
    if (overallConductedEl) overallConductedEl.textContent = `${st.totalConducted} Slots`;
    if (overallPresentEl) overallPresentEl.textContent = `${st.totalPresent} Present`;
    if (overallAbsentEl) overallAbsentEl.textContent = `${st.totalAbsent} Absent`;

    if (statusBadgeEl) {
      statusBadgeEl.textContent = health.status;
      statusBadgeEl.className = `status-pill ${health.isSafe ? "safe" : "danger"}`;
      statusBadgeEl.style.color = health.isSafe ? "var(--free-text)" : "#EF4444";
      statusBadgeEl.style.borderColor = health.isSafe ? "var(--free-border)" : "rgba(239, 68, 68, 0.4)";
      statusBadgeEl.style.background = health.isSafe ? "var(--free-bg)" : "rgba(239, 68, 68, 0.1)";
    }
  }

  renderAttendanceModalTable() {
    const tbody = document.getElementById("attendanceModalTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    this.simulatedAttendance.courses.forEach((c, idx) => {
      const h = this.calculateHealth(c.conducted, c.present);
      const tr = document.createElement("tr");

      const badgeColor = h.isSafe ? "var(--free-text)" : "#EF4444";
      const adviceText = h.isSafe
        ? `<span style="color:var(--free-text);">✓ Safe · Can skip <b>${h.bunkBuffer}</b> class${h.bunkBuffer === 1 ? "" : "es"}</span>`
        : `<span style="color:#EF4444; font-weight:600;">🚨 Must attend next <b>${h.classesNeeded}</b> class${h.classesNeeded === 1 ? "" : "es"} for 75%</span>`;

      tr.innerHTML = `
        <td class="mono-code">${c.code}</td>
        <td>
          <div style="font-weight:600; color:var(--text-main);">${c.name}</div>
          <div style="font-size:11px; color:var(--text-dim);">${c.faculty || ""}</div>
        </td>
        <td>${c.conducted}</td>
        <td>${c.present}</td>
        <td>${c.absent}</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:${badgeColor}; font-size:14px;">
          ${h.pct}%
        </td>
        <td>${adviceText}</td>
        <td style="white-space:nowrap;">
          <div class="stepper-wrap">
            <button class="step-btn step-minus" title="Simulate Missed Class" onclick="Wormhole.simulateClassChange(${idx}, 'miss')">-1</button>
            <button class="step-btn step-plus" title="Simulate Attended Class" onclick="Wormhole.simulateClassChange(${idx}, 'attend')">+1</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  simulateClassChange(courseIndex, action) {
    WormholeAudio.tick();
    const c = this.simulatedAttendance.courses[courseIndex];
    if (!c) return;

    if (action === "attend") {
      c.conducted += 1;
      c.present += 1;
    } else if (action === "miss") {
      c.conducted += 1;
      c.absent += 1;
    }

    c.pct = parseFloat(((c.present / c.conducted) * 100).toFixed(2));
    this.renderAttendanceModalTable();
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
      if (SECTIONS[s]) {
        this.currentSection = s;
        this.profile.section = s;
      }
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

  initWhatsAppBroadcaster() {
    const btn = document.getElementById("whatsappBroadcastBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      this.updateURLHash();
      const squadNames = this.squad.map((k) => "5" + k).join(" + ");
      const msg = `🚀 *WORMHOLE SQUAD COORDINATION* (${squadNames})\n\nHey squad! Here is our real-time free time overlap on campus:\n🔗 View Live Heatmap: ${window.location.href}\n\n⚡ Computed via Wormhole Spacetime Engine`;

      navigator.clipboard.writeText(msg).then(() => {
        WormholeAudio.resonance();
        btn.textContent = "✓ WhatsApp Invite Copied!";
        setTimeout(() => {
          btn.innerHTML = "📲 Copy WhatsApp Invite";
        }, 2500);
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

    // Profile & Attendance Quick Actions
    items.push({
      type: "Action",
      title: "⚙️ Personalize Profile (Lab Batch & PE-1)",
      sub: `Currently: 5${this.profile.section}${this.profile.labBatch} · ${this.profile.pe1.name}`,
      badge: "PROFILE",
      action: () => window.openProfileModal(),
    });

    items.push({
      type: "Action",
      title: `📊 DSU ERP Attendance Copilot (${this.attendance.student.overallPct}%)`,
      sub: "View 75% bunk buffer & simulate future attendance",
      badge: "ATTENDANCE",
      action: () => window.openAttendanceModal(),
    });

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

      if (e.key === "Escape") {
        if (this.commandPaletteOpen) window.closeCommandPalette();
        if (this.attendanceModalOpen) window.closeAttendanceModal();
        if (this.profileModalOpen) window.closeProfileModal();
        return;
      }

      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA") return;

      const key = e.key.toUpperCase();

      // Number keys 1-4 switch views
      if (["1", "2", "3", "4"].includes(key)) {
        const viewMap = { "1": "squad", "2": "chronos", "3": "electives", "4": "docs" };
        const targetBtn = document.querySelector(`[data-view="${viewMap[key]}"]`);
        if (targetBtn) targetBtn.click();
        return;
      }

      // Letter keys A-L switch section
      if (SECTIONS[key]) {
        this.switchSection(key);
        return;
      }

      // Space toggles audio
      if (e.code === "Space") {
        e.preventDefault();
        WormholeAudio.toggle();
        const btn = document.getElementById("audioToggleBtn");
        if (btn) {
          btn.innerHTML = WormholeAudio.enabled ? "🔊 Audio <span class='kbd-badge'>Space</span>" : "🔇 Muted <span class='kbd-badge'>Space</span>";
        }
      }
    });
  }

  initNavigation() {
    const tabs = document.querySelectorAll(".seg-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        WormholeAudio.tick();
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const targetView = tab.getAttribute("data-view");
        document.querySelectorAll(".view-panel").forEach((p) => p.classList.remove("active"));
        const panel = document.getElementById(`panel-${targetView}`);
        if (panel) panel.classList.add("active");
      });
    });
  }

  initAudioToggle() {
    const btn = document.getElementById("audioToggleBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      WormholeAudio.toggle();
      btn.innerHTML = WormholeAudio.enabled ? "🔊 Audio <span class='kbd-badge'>Space</span>" : "🔇 Muted <span class='kbd-badge'>Space</span>";
    });
  }

  /* ===================== QUANTUM RADAR BEACON ===================== */
  startLiveRadar() {
    const tickClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false });
      const clockEl = document.getElementById("liveClockTime");
      if (clockEl) clockEl.textContent = timeStr;

      const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
      const curMins = now.getHours() * 60 + now.getMinutes();
      const curSecs = now.getSeconds();

      // Find current period
      let activeP = null;
      let activePIndex = -1;
      let minsRemaining = 0;
      let secsRemaining = 0;

      PERIODS.forEach((p, idx) => {
        const [sh, sm] = p.start.split(":").map(Number);
        const [eh, em] = p.end.split(":").map(Number);
        const sTotal = sh * 60 + sm;
        const eTotal = eh * 60 + em;

        if (curMins >= sTotal && curMins < eTotal) {
          activeP = p;
          activePIndex = idx;
          const totalSecsRemaining = (eTotal - curMins) * 60 - curSecs;
          minsRemaining = Math.floor(totalSecsRemaining / 60);
          secsRemaining = totalSecsRemaining % 60;
        }
      });

      const statusEl = document.getElementById("livePeriodStatus");
      const countdownEl = document.getElementById("beaconCountdown");
      const freeSectionsEl = document.getElementById("beaconFreeSections");

      if (activeP) {
        if (statusEl) statusEl.textContent = `${activeP.label} (${activeP.displayStart} – ${activeP.displayEnd})`;
        if (countdownEl) countdownEl.textContent = `${minsRemaining}m ${secsRemaining < 10 ? "0" : ""}${secsRemaining}s left in ${activeP.label}`;

        // Scan who is 100% Free Right Now across campus
        if (freeSectionsEl && currentDay !== "Sunday") {
          const freeSecs = [];
          Object.keys(SECTIONS).forEach((k) => {
            const label = SECTIONS[k].days[currentDay]?.[activePIndex];
            if (categorizePeriod(label) === "free") {
              freeSecs.push(`5${k} (${label})`);
            }
          });

          if (freeSecs.length > 0) {
            freeSectionsEl.innerHTML = freeSecs
              .map((s) => `<span class="beacon-chip" onclick="Wormhole.switchSection('${s[1]}')">● Section ${s}</span>`)
              .join("");
          } else {
            freeSectionsEl.innerHTML = `<span style="color:var(--text-dim); font-size:12px;">All 12 sections currently in class</span>`;
          }
        }
      } else {
        if (statusEl) statusEl.textContent = "Outside Lecture Hours";
        if (countdownEl) countdownEl.textContent = "Next period starts 08:30 AM";
        if (freeSectionsEl) {
          freeSectionsEl.innerHTML = `<span style="color:var(--free-text); font-size:12px; font-weight:600;">Campus Wide Free Space</span>`;
        }
      }

      // Highlight active cell in matrix
      document.querySelectorAll(".cell-slot.active-period").forEach((el) => el.classList.remove("active-period"));
      if (activePIndex !== -1 && currentDay !== "Sunday") {
        const activeCell = document.querySelector(
          `#chronosTimetable td[data-day="${currentDay}"][data-period="${activePIndex}"]`
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

  /* ===================== CHRONOS MATRIX (Single Section & Personalization) ===================== */
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

  resolveCellSlot(rawLabel, day, periodIndex) {
    if (!rawLabel) return { text: "", cat: "fixed", tag: "", healthTag: "" };

    let text = rawLabel;
    let cat = categorizePeriod(rawLabel);
    let subInfo = "";

    // 1. Resolve PE-1 Elective Personalization
    if (rawLabel.includes("PE-1")) {
      text = `${this.profile.pe1.name} (${this.profile.pe1.room})`;
      subInfo = this.profile.pe1.faculty;
      cat = "skiphigh";
    }

    // 2. Resolve Lab Batch Personalization (e.g. ML-H1/GPU-H2 (514/509))
    if (rawLabel.includes("/")) {
      const isBatch2 = this.profile.labBatch === 2;
      if (rawLabel.includes("ML-H1/GPU-H2")) {
        text = isBatch2 ? "GPU Programming Lab (509)" : "Machine Learning Lab (514)";
        subInfo = isBatch2 ? "Batch 5H2 · Room 509" : "Batch 5H1 · Room 514";
      } else if (rawLabel.includes("ML-H2/GPU-H1")) {
        text = isBatch2 ? "Machine Learning Lab (514)" : "GPU Programming Lab (509)";
        subInfo = isBatch2 ? "Batch 5H2 · Room 514" : "Batch 5H1 · Room 509";
      } else if (rawLabel.includes("ML-A1/GPU-A2")) {
        text = isBatch2 ? "GPU Architecture Lab (508)" : "Machine Learning Lab (513)";
      } else if (rawLabel.includes("ML-A2/GPU-A1")) {
        text = isBatch2 ? "Machine Learning Lab (513)" : "GPU Architecture Lab (508)";
      }
    }

    // 3. Match with DSU ERP Attendance stats
    let healthTag = "";
    if (this.attendance && this.attendance.courses) {
      let matchedCourse = null;
      const tUpper = rawLabel.toUpperCase();
      if (tUpper.includes("GPU")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3501");
      else if (tUpper.includes("SEMP") || tUpper.includes("SEPM")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3502");
      else if (tUpper.includes("ML") || tUpper.includes("MACHINE")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3503");
      else if (tUpper.includes("IDS") || tUpper.includes("DATA")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3504");
      else if (tUpper.includes("OS")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3505");
      else if (tUpper.includes("ATC") || tUpper.includes("AUTOMATA")) matchedCourse = this.attendance.courses.find((c) => c.code === "24CS3506");

      if (matchedCourse) {
        const h = this.calculateHealth(matchedCourse.conducted, matchedCourse.present);
        if (!h.isSafe) {
          healthTag = `<span class="attendance-tag danger animate-pulse" title="${h.pct}% · Must attend next ${h.classesNeeded} classes">🚨 ${h.pct}% (${h.classesNeeded} req)</span>`;
        } else if (h.bunkBuffer > 0) {
          healthTag = `<span class="attendance-tag safe" title="${h.pct}% · Safe buffer: ${h.bunkBuffer} classes">🟢 ${h.pct}%</span>`;
        }
      }
    }

    return { text, cat, subInfo, healthTag };
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
        const rawLabel = secData.days[day][i];
        const res = this.resolveCellSlot(rawLabel, day, i);
        const badge = CAT_LABELS[res.cat]
          ? `<span class="cell-tag">${CAT_LABELS[res.cat]}</span>`
          : "";

        html += `
          <td class="cell-slot cat-${res.cat}" data-day="${day}" data-period="${i}">
            <div class="cell-name">${res.text}</div>
            ${res.subInfo ? `<div style="font-size:10px; color:var(--text-dim); margin-top:2px;">${res.subInfo}</div>` : ""}
            <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap; margin-top:4px;">
              ${badge}
              ${res.healthTag}
            </div>
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
      const list = e.facultyList || (e.rows || []).map((r) => ({ name: r[0], room: r[1] }));
      list.forEach((f, idx) => {
        const isMyElective =
          this.profile.pe1 &&
          this.profile.pe1.code === e.code &&
          (this.profile.pe1.faculty === f.name ||
            (this.profile.pe1.faculty &&
              (f.name.toLowerCase().includes(this.profile.pe1.faculty.toLowerCase()) ||
                this.profile.pe1.faculty.toLowerCase().includes(f.name.toLowerCase()) ||
                (this.profile.pe1.faculty.toLowerCase().includes("gowtham") && f.name.toLowerCase().includes("goutham")))));

        const tr = document.createElement("tr");
        if (isMyElective) {
          tr.style.background = "rgba(99, 102, 241, 0.12)";
          tr.style.borderLeft = "2px solid var(--accent-indigo)";
        }

        tr.innerHTML = `
          <td class="mono-code">${idx === 0 ? `Track 0${e.no}` : ""}</td>
          <td style="font-weight:500; color:var(--text-main);">${idx === 0 ? `${e.name} <span class="mono-code" style="font-size:11px; color:var(--text-dim);">(${e.code})</span>` : ""}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${f.name}</span>
              ${isMyElective ? '<span class="status-pill safe" style="font-size:10px; padding:2px 8px; border-radius:12px;">Assigned Mentor</span>' : ""}
            </div>
          </td>
          <td class="mono-code" style="color:var(--text-main); font-weight:600;">${f.room}</td>
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
