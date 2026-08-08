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

    // 2. Parse URL Hash State (e.g. #squad=H,L,A&sec=H) and detect ERP import
    this.parseURLHash();
    // Check for ERP attendance import via URL hash bridge
    if (window.location.hash.startsWith("#att=")) {
      setTimeout(() => this.handleERPHashImport(), 600);
    }

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

      // Fill identity fields
      const nameInput = document.getElementById("profileNameInput");
      const usnInput = document.getElementById("profileUsnInput");
      if (nameInput) nameInput.value = this.profile.name || "";
      if (usnInput) usnInput.value = this.profile.usn || "";

      // Fill academic fields
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

      // Hide status
      const status = document.getElementById("profileSaveStatus");
      if (status) status.style.opacity = "0";
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
        const nameVal = (document.getElementById("profileNameInput")?.value || "").trim().toUpperCase() || this.profile.name;
        const usnVal = (document.getElementById("profileUsnInput")?.value || "").trim().toUpperCase() || this.profile.usn;
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
          name: nameVal,
          usn: usnVal,
          section: sec,
          labBatch: batch,
          pe1: {
            code: electiveCode,
            name: cleanName,
            faculty: facultyName,
            room: room,
          },
        });

        // Show inline save confirmation
        const status = document.getElementById("profileSaveStatus");
        if (status) {
          status.textContent = "✓ Saved";
          status.style.opacity = "1";
          setTimeout(() => { status.style.opacity = "0"; }, 2000);
        }

        WormholeAudio.resonance();
        setTimeout(() => window.closeProfileModal(), 400);
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

    this.activeScenario = "actual"; // track current scenario

    window.openAttendanceModal = () => {
      WormholeAudio.tick();
      this.attendanceModalOpen = true;
      if (modal) modal.classList.add("open");
      this.activeScenario = "actual";
      this.applyScenario("actual");
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
        this.activeScenario = "actual";
        this.applyScenario("actual");
      });
    }

    // Scenario buttons
    document.getElementById("scenarioBtnGroup")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".scenario-btn");
      if (!btn) return;
      const scen = btn.dataset.scenario;
      this.activeScenario = scen;
      document.querySelectorAll(".scenario-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const customPanel = document.getElementById("customScenarioPanel");
      if (customPanel) customPanel.style.display = scen === "custom" ? "block" : "none";

      if (scen !== "custom") this.applyScenario(scen);
    });

    // Custom apply button
    document.getElementById("applyCustomScenarioBtn")?.addEventListener("click", () => {
      this.applyScenario("custom");
    });

    // Smart Bookmarklet — DOM parser + URL bridge
    const bookmarkletBtn = document.getElementById("dsuBookmarkletLink");
    if (bookmarkletBtn) {
      // Set the smart bookmarklet that parses ERP DOM and opens Wormhole with #att= hash
      bookmarkletBtn.setAttribute("href", this.generateSmartBookmarklet());
      bookmarkletBtn.setAttribute("title", "Drag to bookmarks bar. Then go to ums.mydsi.org Attendance Summary and click it. Wormhole opens with your live data pre-loaded.");
      bookmarkletBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showERPSyncGuide();
      });
    }

    // Also wire the "How to Sync" guide button if present
    const howToBtn = document.getElementById("erpHowToSyncBtn");
    if (howToBtn) {
      howToBtn.addEventListener("click", () => this.showERPSyncGuide());
    }
  }

  showERPSyncGuide() {
    const existing = document.getElementById("erpSyncGuideModal");
    if (existing) { existing.remove(); return; }

    const bookmarkletCode = this.generateSmartBookmarklet();
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = /chrome/i.test(navigator.userAgent) && !/edge/i.test(navigator.userAgent);

    // Method C — Chrome Extension (Recommended, crazy fast)
    const extensionMethod = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:var(--radius-sm); padding:10px 12px; font-size:12px; color:var(--primary-light);">
          🔥 <b>Recommended: Get the Wormhole Copilot extension!</b> Installs in 30 seconds and adds a floating 1-click sync button directly inside the DSU ERP Attendance page.
        </div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">1</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Download/Access the Extension</div>
            <div style="font-size:12px; color:var(--text-dim); margin-bottom:8px;">Locate the extension directory in the project files (<code>/extension</code> folder).</div>
          </div>
        </div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">2</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Install in Chrome / Edge / Brave</div>
            <div style="font-size:12px; color:var(--text-dim);">
              Open <b>chrome://extensions</b> in your browser.<br>
              Enable <b>"Developer mode"</b> (top right toggle).<br>
              Click <b>"Load unpacked"</b> (top left button) and select the <b><code>extension</code></b> folder.
            </div>
          </div>
        </div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">3</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">1-Click Sync on DSU ERP</div>
            <div style="font-size:12px; color:var(--text-dim);">Go to your ERP Attendance Summary page. A beautiful floating <b>⚡ Sync to Wormhole</b> button will appear at the bottom-right. Click it to sync instantly!</div>
          </div>
        </div>
      </div>
    `;

    // Method A — Chrome/Firefox: drag bookmarklet
    const chromeMethod = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">1</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Drag this button to your bookmarks bar</div>
            <div style="font-size:12px; color:var(--text-dim); margin-bottom:8px;">Drag the button below into your browser bookmarks/favorites bar. Do this <b>once</b>.</div>
            <a href="${bookmarkletCode}" id="erpBookmarkletDrag" style="display:inline-block; padding:8px 16px; background:rgba(139,92,246,0.15); border:1px dashed rgba(139,92,246,0.5); border-radius:var(--radius-sm); color:var(--primary-light); font-size:13px; font-weight:700; cursor:grab; text-decoration:none; user-select:none;">⭐ Wormhole ERP Sync ← drag me</a>
            <div style="font-size:10.5px; color:var(--text-dim); margin-top:6px;">If you accidentally click it instead of dragging, nothing will break — just drag it next time.</div>
          </div>
        </div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">2</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Go to ums.mydsi.org → Attendance Summary</div>
            <div style="font-size:12px; color:var(--text-dim);">Log in. Navigate to <b>Timetable → Attendance Summary</b>. Select the <b>Attendance Summary</b> tab (not Absent Days).</div>
          </div>
        </div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0;">3</div>
          <div>
            <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;">Click ⭐ Wormhole ERP Sync from your bookmarks bar</div>
            <div style="font-size:12px; color:var(--text-dim);">Wormhole opens in a new tab and automatically shows your live attendance data — ready to import.</div>
          </div>
        </div>
      </div>
    `;

    // Method B — Safari: copy code, manually add bookmark
    const safariMethod = `
      <div style="display:flex; flex-direction:column; gap:14px;">

        <div style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25); border-radius:var(--radius-sm); padding:10px 12px; font-size:12px; color:#FBBF24;">
          ⚠️ <b>Safari blocks JavaScript bookmarklets when clicked as links.</b> Use one of these methods instead:
        </div>

        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-dim); margin-bottom:-6px;">Option A — Enable Bookmarklets in Safari (Recommended)</div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:24px; height:24px; border-radius:50%; background:rgba(251,191,36,0.2); border:1px solid rgba(251,191,36,0.4); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#FBBF24; flex-shrink:0;">→</div>
          <div style="font-size:12px; color:var(--text-dim);">
            Safari → <b>Settings</b> (⌘,) → <b>Advanced</b> → tick <b>"Show features for web developers"</b><br>
            Then: <b>Develop menu → "Allow JavaScript from Smart Search Field"</b><br>
            After enabling, drag the bookmarklet button above normally.
          </div>
        </div>

        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-dim); margin-bottom:-6px;">Option B — Manually save the bookmarklet</div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="min-width:24px; height:24px; border-radius:50%; background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:var(--primary-light); flex-shrink:0;">1</div>
          <div style="font-size:12px; color:var(--text-dim);">
            Click <b>Copy Code</b> below → then go to Safari Bookmarks → Edit Bookmarks → New Bookmark → name it anything → <b>replace the URL with the copied code</b>.
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button id="copyBookmarkletBtn" class="btn-solid" style="font-size:12px; padding:7px 14px;">📋 Copy Bookmarklet Code</button>
          <span id="copyBookmarkletStatus" style="font-size:12px; color:var(--free-text); align-self:center; opacity:0; transition:opacity 0.3s;">✓ Copied!</span>
        </div>

        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-dim); margin-bottom:-6px;">Option C — Paste & Sync (works everywhere, no setup)</div>
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="font-size:12px; color:var(--text-dim);">
            On ums.mydsi.org attendance page: press <b>⌘A</b> then <b>⌘C</b> to copy all text. Then paste it in the <b>"Paste raw text"</b> section at the bottom of the Attendance Copilot.
          </div>
        </div>
      </div>
    `;

    // Always show tabs so users can switch
    const modal = document.createElement("div");
    modal.id = "erpSyncGuideModal";
    modal.className = "cmd-backdrop open";
    modal.innerHTML = `
      <div class="cmd-box" style="max-width:580px; width:95vw; animation:fadeInUp 0.3s ease;">
        <div class="modal-header">
          <h3 style="font-size:16px; font-weight:800;">🔗 Sync ERP Attendance to Wormhole</h3>
          <button onclick="document.getElementById('erpSyncGuideModal').remove()" style="background:none;border:none;color:var(--text-dim);font-size:22px;cursor:pointer;">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Browser tabs -->
          <div style="display:flex; gap:0; margin-bottom:16px; border-bottom:1px solid var(--border-subtle);">
            <button id="syncTabExtension" onclick="Wormhole._switchSyncTab('extension')" style="padding:8px 16px; background:${!isSafari ? 'rgba(139,92,246,0.15)' : 'transparent'}; border:none; border-bottom:2px solid ${!isSafari ? 'var(--primary)' : 'transparent'}; color:${!isSafari ? 'var(--primary-light)' : 'var(--text-dim)'}; font-size:12px; font-weight:700; cursor:pointer;">🔥 Chrome Extension</button>
            <button id="syncTabChrome" onclick="Wormhole._switchSyncTab('chrome')" style="padding:8px 16px; background:transparent; border:none; border-bottom:2px solid transparent; color:var(--text-dim); font-size:12px; font-weight:700; cursor:pointer;">🟢 Drag Bookmarklet</button>
            <button id="syncTabSafari" onclick="Wormhole._switchSyncTab('safari')" style="padding:8px 16px; background:${isSafari ? 'rgba(139,92,246,0.15)' : 'transparent'}; border:none; border-bottom:2px solid ${isSafari ? 'var(--primary)' : 'transparent'}; color:${isSafari ? 'var(--primary-light)' : 'var(--text-dim)'}; font-size:12px; font-weight:700; cursor:pointer;">🧭 Safari / Manual</button>
          </div>
          <div id="syncMethodExtension" style="display:${!isSafari ? 'block' : 'none'}">${extensionMethod}</div>
          <div id="syncMethodChrome" style="display:none">${chromeMethod}</div>
          <div id="syncMethodSafari" style="display:${isSafari ? 'block' : 'none'}">${safariMethod}</div>

          <div style="margin-top:16px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-sm); padding:10px 12px; font-size:11.5px; color:var(--free-text);">
            🔒 <strong>Zero privacy risk.</strong> All data stays in your browser. Nothing is sent to any server.
          </div>
        </div>
        <div class="modal-footer" style="justify-content:flex-end;">
          <button onclick="document.getElementById('erpSyncGuideModal').remove()" class="btn-solid">Got it</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

    // Set drag bookmarklet
    const drag = document.getElementById("erpBookmarkletDrag");
    if (drag) {
      drag.setAttribute("href", bookmarkletCode);
      drag.addEventListener("click", (e) => {
        e.preventDefault();
        alert("💡 How to use this Bookmarklet:\n\n1. Do NOT click or open this button in a new tab directly.\n2. DRAG this button to your browser's Bookmarks Bar.\n   (If your Bookmarks Bar is hidden, press Ctrl+Shift+B or Cmd+Shift+B to show it)\n3. Navigate to ums.mydsi.org → Attendance Summary page, then click the bookmark you just saved.\n\nIf dragging doesn't work, click the 'Safari' tab at the top of this popup to copy the bookmarklet code manually!");
      });
    }

    // Copy code button
    const copyBtn = document.getElementById("copyBookmarkletBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(bookmarkletCode).then(() => {
          const status = document.getElementById("copyBookmarkletStatus");
          if (status) { status.style.opacity = "1"; setTimeout(() => status.style.opacity = "0", 2000); }
        });
      });
    }

    // Tab switching
    window.Wormhole._switchSyncTab = (tab) => {
      document.getElementById("syncMethodExtension").style.display = tab === "extension" ? "block" : "none";
      document.getElementById("syncMethodChrome").style.display = tab === "chrome" ? "block" : "none";
      document.getElementById("syncMethodSafari").style.display = tab === "safari" ? "block" : "none";
      const extBtn = document.getElementById("syncTabExtension");
      const chromeBtn = document.getElementById("syncTabChrome");
      const safariBtn = document.getElementById("syncTabSafari");
      if (extBtn) {
        extBtn.style.background = tab === "extension" ? "rgba(139,92,246,0.15)" : "transparent";
        extBtn.style.borderBottomColor = tab === "extension" ? "var(--primary)" : "transparent";
        extBtn.style.color = tab === "extension" ? "var(--primary-light)" : "var(--text-dim)";
      }
      if (chromeBtn) {
        chromeBtn.style.background = tab === "chrome" ? "rgba(139,92,246,0.15)" : "transparent";
        chromeBtn.style.borderBottomColor = tab === "chrome" ? "var(--primary)" : "transparent";
        chromeBtn.style.color = tab === "chrome" ? "var(--primary-light)" : "var(--text-dim)";
      }
      if (safariBtn) {
        safariBtn.style.background = tab === "safari" ? "rgba(139,92,246,0.15)" : "transparent";
        safariBtn.style.borderBottomColor = tab === "safari" ? "var(--primary)" : "transparent";
        safariBtn.style.color = tab === "safari" ? "var(--primary-light)" : "var(--text-dim)";
      }
    };
  }

  applyScenario(scenario) {

    // Deep-clone real attendance as base
    const base = JSON.parse(JSON.stringify(this.attendance));

    // "remaining weeks" estimate — roughly 15 weeks × 5 theory days × 1 slot avg = ~75 left
    const REMAINING_PER_COURSE = 30; // approx remaining slots per course in semester

    base.courses = base.courses.map((c) => {
      let { conducted, present } = c;

      if (scenario === "actual") {
        // No change
      } else if (scenario === "attend5") {
        conducted += 5; present += 5;
      } else if (scenario === "miss5") {
        conducted += 5; // present stays same
      } else if (scenario === "attendall") {
        conducted += REMAINING_PER_COURSE; present += REMAINING_PER_COURSE;
      } else if (scenario === "missall") {
        conducted += REMAINING_PER_COURSE; // present stays same
      } else if (scenario === "custom") {
        const attend = parseInt(document.getElementById("customAttend")?.value || "0", 10);
        const miss = parseInt(document.getElementById("customMiss")?.value || "0", 10);
        conducted += attend + miss;
        present += attend;
      }

      const absent = conducted - present;
      const pct = conducted > 0 ? parseFloat(((present / conducted) * 100).toFixed(2)) : 100;
      return { ...c, conducted, present, absent, pct };
    });

    this.simulatedAttendance = base;
    this.renderAttendanceSummaryStrip(scenario);
    this.renderAttendanceModalTable();
    this.renderScenarioInsight(scenario, base);
  }

  renderAttendanceSummaryStrip(scenario) {
    const strip = document.getElementById("attendanceSummaryStrip");
    if (!strip) return;

    // Hide ERP sync banner if data has been synced from ERP
    const syncBanner = document.getElementById("erpSyncBanner");
    if (syncBanner && this.attendance.student && this.attendance.student.syncedAt) {
      syncBanner.style.display = "none";
    }

    const courses = this.simulatedAttendance.courses;
    const totalConducted = courses.reduce((s, c) => s + c.conducted, 0);
    const totalPresent = courses.reduce((s, c) => s + c.present, 0);
    const totalAbsent = totalConducted - totalPresent;
    const overallPct = totalConducted > 0 ? ((totalPresent / totalConducted) * 100).toFixed(1) : "100.0";
    const isSafe = parseFloat(overallPct) >= 75;
    const dangerCount = courses.filter((c) => this.calculateHealth(c.conducted, c.present).pct < 75).length;

    const cards = [
      { label: "Overall Attendance", value: `${overallPct}%`, color: isSafe ? "var(--free-text)" : "#EF4444" },
      { label: "Classes Attended", value: `${totalPresent} / ${totalConducted}`, color: "var(--text-main)" },
      { label: "Absences", value: `${totalAbsent}`, color: totalAbsent > 0 ? "#FBBF24" : "var(--free-text)" },
      { label: scenario === "actual" ? "Subjects at Risk" : "At Risk (Simulated)", value: `${dangerCount} subject${dangerCount !== 1 ? "s" : ""}`, color: dangerCount > 0 ? "#EF4444" : "var(--free-text)" },
    ];

    strip.innerHTML = cards.map((c) => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px 14px;">
        <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-dim); margin-bottom:4px;">${c.label}</div>
        <div style="font-size:20px; font-weight:800; font-family:var(--font-mono); color:${c.color};">${c.value}</div>
      </div>
    `).join("");
  }

  renderScenarioInsight(scenario, simData) {
    const banner = document.getElementById("scenarioInsightBanner");
    if (!banner) return;

    if (scenario === "actual") {
      banner.style.display = "none";
      return;
    }

    const courses = simData.courses;
    const safe = courses.filter((c) => this.calculateHealth(c.conducted, c.present).pct >= 75).length;
    const danger = courses.filter((c) => this.calculateHealth(c.conducted, c.present).pct < 75).length;
    const totalPct = (() => {
      const tc = courses.reduce((s, c) => s + c.conducted, 0);
      const tp = courses.reduce((s, c) => s + c.present, 0);
      return tc > 0 ? ((tp / tc) * 100).toFixed(1) : "100.0";
    })();

    const scenarioLabels = {
      attend5: "📋 Scenario: If you attend the next 5 classes in each subject",
      miss5: "⚠️ Scenario: If you skip the next 5 classes in each subject",
      attendall: "🚀 Scenario: If you attend ALL remaining classes",
      missall: "💀 Worst Case: If you miss ALL remaining classes",
      custom: "🎛 Custom Scenario applied",
    };

    const isGood = parseFloat(totalPct) >= 75;
    banner.style.display = "block";
    banner.style.background = isGood ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)";
    banner.style.borderColor = isGood ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";
    banner.style.color = isGood ? "var(--free-text)" : "#EF4444";
    banner.innerHTML = `
      <span style="opacity:0.7; font-size:11px;">${scenarioLabels[scenario] || ""}</span><br>
      Overall attendance would be <b>${totalPct}%</b> · ${safe} subject${safe !== 1 ? "s" : ""} safe
      ${danger > 0 ? ` · <span style="color:#EF4444;">${danger} at risk</span>` : " · <b>All clear!</b>"}
    `;
  }

  parseERPText(text) {
    if (!text.trim()) {
      this.showToast("Please paste some text first.", "error");
      return;
    }

    const courses = [];
    let totalConducted = 0;
    let totalPresent = 0;
    let studentName = "";

    // Split into lines, remove blank
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // Try to extract student name from heading line
    lines.forEach((line) => {
      if (line.includes("Attendance Summary")) {
        const after = line.split("Attendance Summary").pop().replace(/of\s*Semester\s*\d+/i, "").trim();
        if (after) studentName = after;
      }
    });

    lines.forEach((line) => {
      // Skip header/footer lines
      if (/^(sr\.|slot type|course|total|search|absent days|month view|attendance summary)/i.test(line)) return;
      if (/^\d+\s*$/.test(line)) return; // page numbers

      // Strategy 1: Tab-separated rows from copy-paste
      // Format: "1\tTheory\t24CS3501 - GPU ARCHITECTURE\t3\t3\t0\t100.00 %"
      const tabParts = line.split(/\t/);
      if (tabParts.length >= 5) {
        // Try to find the course code column
        let codeIdx = -1;
        tabParts.forEach((p, i) => { if (/^24[A-Z]{2}\d{4}/i.test(p.trim())) codeIdx = i; });

        if (codeIdx !== -1) {
          const courseText = tabParts[codeIdx].trim();
          const codeMatch = courseText.match(/^(24[A-Z]{2}\d{4})/i);
          if (codeMatch) {
            const code = codeMatch[1].toUpperCase();
            const name = courseText.replace(/^24[A-Z]{2}\d{4}\s*[-–—]?\s*/, "").trim() || courseText;
            const slotType = tabParts.find((p) => /^(theory|practical|lab)/i.test(p.trim())) || "Theory";

            // Numbers come after course column
            const numCols = tabParts.slice(codeIdx + 1).map((p) => parseInt(p.trim())).filter((n) => !isNaN(n));
            const conducted = numCols[0] || 0;
            const present = numCols[1] !== undefined ? numCols[1] : conducted;
            const absent = numCols[2] !== undefined ? numCols[2] : conducted - present;

            if (conducted > 0) {
              const pct = parseFloat(((present / conducted) * 100).toFixed(2));
              courses.push({ code, name, type: slotType.trim(), conducted, present, absent, pct, faculty: "" });
              totalConducted += conducted;
              totalPresent += present;
            }
            return; // handled
          }
        }
      }

      // Strategy 2: Space-separated — extract 24CSXXXX code + trailing numbers
      const codeMatch = line.match(/\b(24[A-Z]{2}\d{4})\b/i);
      if (codeMatch) {
        const code = codeMatch[1].toUpperCase();
        // Get name: everything between code and first standalone number
        const afterCode = line.slice(line.indexOf(codeMatch[1]) + codeMatch[1].length);
        const name = afterCode.replace(/[-–—]/g, "").replace(/\d+.*$/, "").trim() || code;

        // Extract up to 3 standalone integers (conducted, present, absent)
        const nums = (line.match(/\b(\d{1,3})\b(?!\s*%)/g) || []).map(Number).filter((n) => n <= 200);
        // Remove the row number at start if present
        const cleaned = nums.filter((n, i) => i > 0 || n > 9); // row nums are usually 1-9
        const conducted = cleaned[0] || 0;
        const present = cleaned[1] !== undefined ? cleaned[1] : conducted;
        const absent = cleaned[2] !== undefined ? cleaned[2] : conducted - present;
        const slotType = /practical|lab/i.test(line) ? "Practical" : "Theory";

        if (conducted > 0 && !courses.find((c) => c.code === code)) {
          const pct = parseFloat(((present / conducted) * 100).toFixed(2));
          courses.push({ code, name, type: slotType, conducted, present, absent, pct, faculty: "" });
          totalConducted += conducted;
          totalPresent += present;
        }
      }
    });

    if (courses.length > 0) {
      const overallPct = totalConducted > 0 ? parseFloat(((totalPresent / totalConducted) * 100).toFixed(2)) : 100;
      const importData = {
        student: {
          name: studentName || this.attendance.student?.name || "",
          totalConducted,
          totalPresent,
          totalAbsent: totalConducted - totalPresent,
          overallPct,
          syncedAt: new Date().toISOString(),
        },
        courses,
      };

      // Show import preview modal instead of alert
      this.showERPImportModal(importData);

      // Clear paste area
      const pasteArea = document.getElementById("attendancePasteArea");
      if (pasteArea) pasteArea.value = "";
    } else {
      this.showToast("Could not detect course data. Make sure you copied from the Attendance Summary tab.", "error");
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

    const isSimulated = this.activeScenario && this.activeScenario !== "actual";

    this.simulatedAttendance.courses.forEach((c, idx) => {
      const h = this.calculateHealth(c.conducted, c.present);
      const tr = document.createElement("tr");

      // Status badge
      const statusColor = { EXCELLENT: "#10B981", SAFE: "#34D399", WARNING: "#FBBF24", CRITICAL: "#EF4444" };
      const statusBg = { EXCELLENT: "rgba(16,185,129,0.1)", SAFE: "rgba(52,211,153,0.1)", WARNING: "rgba(251,191,36,0.1)", CRITICAL: "rgba(239,68,68,0.1)" };
      const sc = statusColor[h.status] || "#aaa";
      const sb = statusBg[h.status] || "transparent";

      // Advice
      const adviceText = h.isSafe
        ? `<span style="color:var(--free-text);">✓ Can skip <b>${h.bunkBuffer}</b> more</span>`
        : `<span style="color:#EF4444; font-weight:600;">🚨 Need <b>${h.classesNeeded}</b> more classes</span>`;

      // Progress bar width
      const barW = Math.min(100, h.pct);
      const barColor = h.pct >= 85 ? "#10B981" : h.pct >= 75 ? "#34D399" : h.pct >= 65 ? "#FBBF24" : "#EF4444";

      tr.innerHTML = `
        <td style="min-width:180px;">
          <div style="font-weight:600; color:var(--text-main); font-size:12.5px;">${c.name}</div>
          <div style="font-size:10.5px; color:var(--text-dim); margin-top:1px;">${c.code} · ${c.faculty || ""}</div>
        </td>
        <td style="text-align:center; font-family:var(--font-mono); font-size:13px;">${c.conducted}</td>
        <td style="text-align:center; font-family:var(--font-mono); color:var(--free-text); font-size:13px;">${c.present}</td>
        <td style="text-align:center; font-family:var(--font-mono); color:${c.absent > 0 ? "#FBBF24" : "var(--text-dim)"}; font-size:13px;">${c.absent}</td>
        <td style="min-width:110px; text-align:center;">
          <div style="font-family:var(--font-mono); font-weight:800; font-size:15px; color:${sc};">${h.pct}%</div>
          <div style="height:4px; border-radius:2px; background:rgba(255,255,255,0.06); margin-top:4px;">
            <div style="width:${barW}%; height:100%; border-radius:2px; background:${barColor}; transition:width 0.4s;"></div>
          </div>
          <div style="font-size:10px; text-align:center; margin-top:3px; color:${sc}; background:${sb}; border-radius:3px; padding:1px 5px; display:inline-block;">${h.status}</div>
        </td>
        <td>${adviceText}</td>
        <td style="text-align:center; white-space:nowrap;">
          <div class="stepper-wrap">
            <button class="step-btn step-minus" title="Simulate one miss" onclick="Wormhole.simulateClassChange(${idx}, 'miss')">−</button>
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-dim); min-width:12px; text-align:center;">${isSimulated ? "~" : ""}</span>
            <button class="step-btn step-plus" title="Simulate one attend" onclick="Wormhole.simulateClassChange(${idx}, 'attend')">+</button>
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
      c.absent = (c.absent || 0) + 1;
    }

    c.absent = c.conducted - c.present;
    c.pct = parseFloat(((c.present / c.conducted) * 100).toFixed(2));

    this.renderAttendanceSummaryStrip(this.activeScenario || "actual");
    this.renderAttendanceModalTable();
    this.renderScenarioInsight(this.activeScenario || "actual", this.simulatedAttendance);
  }


  /* ===================== URL HASH STATE SERIALIZATION ===================== */
  parseURLHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash || hash.startsWith("att=")) return; // skip ERP import hash

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

  /* ===================== DSU ERP URL-BRIDGE SYNC ===================== */

  /**
   * Generates a smart bookmarklet that:
   * 1. Runs on ums.mydsi.org attendance page
   * 2. Parses the DOM table (not raw text)
   * 3. Encodes structured JSON as base64
   * 4. Opens Wormhole with #att=<base64> hash — zero server calls
   */
  generateSmartBookmarklet() {
    const wormholeBase = window.location.href.split("#")[0];

    // Minified bookmarklet — runs on DSU ERP, no server involved
    const code = `javascript:(function(){
  var h=window.location.hostname;
  if(!h.includes('mydsi')&&!h.includes('dsu.ac.in')&&!h.includes('localhost')){
    alert('\u26a0\ufe0f Open this bookmarklet on ums.mydsi.org \u2192 Attendance Summary page.');
    return;
  }
  try{
    // Extract student name from heading
    var sName='';
    document.querySelectorAll('h1,h2,h3,h4,h5').forEach(function(el){
      var t=el.innerText||el.textContent;
      if(t.includes('Attendance Summary')){
        sName=t.split('Attendance Summary').pop().replace(/of\s*Semester\s*\d+/i,'').trim();
      }
    });
    if(!sName){
      var uel=document.querySelector('.user-name,.student-name,[class*=username],[class*=user-info]');
      if(uel)sName=uel.textContent.trim();
    }
    // Find attendance table
    var attTable=null;
    document.querySelectorAll('table').forEach(function(t){
      t.querySelectorAll('th').forEach(function(th){
        if(th.textContent.trim().toLowerCase()==='conducted')attTable=t;
      });
    });
    if(!attTable){alert('\u274c Cannot find attendance table.\nPlease navigate to Attendance Summary tab on ums.mydsi.org.');return;}
    var courses=[],tc=0,tp=0;
    attTable.querySelectorAll('tbody tr').forEach(function(row){
      var c=row.querySelectorAll('td');
      if(c.length<6)return;
      var courseText=(c[2].innerText||c[2].textContent).trim();
      var condText=(c[3].innerText||c[3].textContent).trim();
      if(!courseText||courseText.toLowerCase()==='total'||!/\d/.test(condText))return;
      var conducted=parseInt(condText)||0;
      var present=parseInt((c[4].innerText||c[4].textContent).trim())||0;
      var absent=parseInt((c[5].innerText||c[5].textContent).trim())||0;
      var slotType=(c[1].innerText||c[1].textContent).trim();
      var codeM=courseText.match(/^(24[A-Z]{2}\d{4})/);
      var code=codeM?codeM[1]:courseText.substring(0,10).replace(/\s/g,'');
      var name=courseText.replace(/^24[A-Z]{2}\d{4}\s*[-\u2013\u2014]?\s*/,'').trim()||courseText;
      var pct=conducted>0?parseFloat(((present/conducted)*100).toFixed(2)):100;
      courses.push({code:code,name:name,type:slotType,conducted:conducted,present:present,absent:absent,pct:pct,faculty:''});
      tc+=conducted;tp+=present;
    });
    if(!courses.length){alert('\u274c No course rows found. Navigate to Attendance Summary > Attendance Summary tab.');return;}
    var overallPct=tc>0?parseFloat(((tp/tc)*100).toFixed(2)):100;
    var payload=JSON.stringify({
      student:{name:sName,totalConducted:tc,totalPresent:tp,totalAbsent:tc-tp,overallPct:overallPct,syncedAt:new Date().toISOString()},
      courses:courses
    });
    var encoded=btoa(unescape(encodeURIComponent(payload)));
    var url='${wormholeBase}#att='+encoded;
    window.open(url,'_blank');
  }catch(e){alert('Wormhole Sync Error: '+e.message);}
})();`;

    return code;
  }

  handleERPHashImport() {
    const hash = window.location.hash;
    if (!hash.startsWith("#att=")) return;

    try {
      const encoded = hash.slice(5);
      const decoded = decodeURIComponent(escape(atob(encoded)));
      const data = JSON.parse(decoded);

      if (!data || !data.courses || !Array.isArray(data.courses) || data.courses.length === 0) {
        throw new Error("Invalid or empty attendance data");
      }

      // Clear hash from URL without reload
      history.replaceState(null, "", window.location.pathname + window.location.search);

      // Show import preview modal
      this.showERPImportModal(data);
    } catch (e) {
      console.error("ERP Import failed:", e);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  showERPImportModal(data) {
    const existing = document.getElementById("erpImportModal");
    if (existing) existing.remove();

    const st = data.student || {};
    const courses = data.courses || [];
    const syncedAt = st.syncedAt ? new Date(st.syncedAt).toLocaleString("en-IN", { hour12: true, hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "just now";
    const isSafe = st.overallPct >= 75;

    // Preserve faculty from existing attendance data
    const existingFacultyMap = {};
    (this.attendance.courses || []).forEach((c) => {
      if (c.faculty) existingFacultyMap[c.code] = c.faculty;
    });

    const courseRows = courses.map((c) => {
      const pct = c.pct || (c.conducted > 0 ? (c.present / c.conducted) * 100 : 100);
      const barW = Math.min(100, pct);
      const barColor = pct >= 85 ? "#10B981" : pct >= 75 ? "#34D399" : pct >= 65 ? "#FBBF24" : "#EF4444";
      const safe = pct >= 75;
      return `
        <tr>
          <td style="padding:6px 8px;">
            <div style="font-weight:600; color:var(--text-main); font-size:12px;">${c.name}</div>
            <div style="font-size:10.5px; color:var(--text-dim);">${c.code} · ${c.type || "Theory"}</div>
          </td>
          <td style="text-align:center; font-family:var(--font-mono); font-size:12px; padding:6px 8px;">${c.conducted}</td>
          <td style="text-align:center; font-family:var(--font-mono); color:var(--free-text); font-size:12px; padding:6px 8px;">${c.present}</td>
          <td style="padding:6px 8px; min-width:100px;">
            <div style="font-family:var(--font-mono); font-weight:800; font-size:13px; color:${barColor};">${pct.toFixed(1)}%</div>
            <div style="height:3px; border-radius:2px; background:rgba(255,255,255,0.06); margin-top:3px;">
              <div style="width:${barW}%; height:100%; border-radius:2px; background:${barColor};"></div>
            </div>
          </td>
          <td style="text-align:center; padding:6px 8px;">
            <span style="font-size:10px; color:${safe ? "var(--free-text)" : "#EF4444"}; font-weight:700;">${safe ? "✓ SAFE" : "⚠ AT RISK"}</span>
          </td>
        </tr>
      `;
    }).join("");

    const modal = document.createElement("div");
    modal.id = "erpImportModal";
    modal.className = "cmd-backdrop open";
    modal.innerHTML = `
      <div class="cmd-box" style="max-width:680px; width:95vw; animation:fadeInUp 0.35s ease;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#10B981,#34D399); display:flex; align-items:center; justify-content:center; font-size:18px;">🔗</div>
            <div>
              <div style="font-size:15px; font-weight:800; color:var(--text-main);">DSU ERP Attendance Sync</div>
              <div style="font-size:11px; color:var(--text-dim);">Synced at ${syncedAt} · ums.mydsi.org</div>
            </div>
          </div>
          <button onclick="document.getElementById('erpImportModal').remove()" style="background:none;border:none;color:var(--text-dim);font-size:22px;cursor:pointer;line-height:1;">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Summary Strip -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid var(--border-subtle);">
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px;">
              <div style="font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;">Student</div>
              <div style="font-size:13px; font-weight:700; color:var(--text-main);">${st.name || "Unknown"}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px;">
              <div style="font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;">Overall</div>
              <div style="font-size:20px; font-weight:800; font-family:var(--font-mono); color:${isSafe ? "var(--free-text)" : "#EF4444"}">${st.overallPct}%</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px;">
              <div style="font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;">Attended</div>
              <div style="font-size:20px; font-weight:800; font-family:var(--font-mono); color:var(--text-main);">${st.totalPresent}/${st.totalConducted}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:10px;">
              <div style="font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px;">Courses</div>
              <div style="font-size:20px; font-weight:800; font-family:var(--font-mono); color:var(--text-main);">${courses.length}</div>
            </div>
          </div>

          <!-- Course Preview -->
          <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px;">Course Breakdown from ERP</div>
          <div style="max-height:260px; overflow-y:auto; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); margin-bottom:14px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <thead>
                <tr style="background:rgba(255,255,255,0.04);">
                  <th style="text-align:left; padding:7px 8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim); text-transform:uppercase;">Course</th>
                  <th style="text-align:center; padding:7px 8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim);">Total</th>
                  <th style="text-align:center; padding:7px 8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim);">Present</th>
                  <th style="padding:7px 8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim);">%</th>
                  <th style="text-align:center; padding:7px 8px; font-family:var(--font-mono); font-size:10px; color:var(--text-dim);">Status</th>
                </tr>
              </thead>
              <tbody>${courseRows}</tbody>
            </table>
          </div>

          <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-sm); padding:10px 12px; font-size:12px; color:var(--free-text); margin-bottom:14px;">
            🔒 <strong>100% Private.</strong> This data was read directly from your browser — nothing was sent to any external server. Only you can see it.
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <button onclick="document.getElementById('erpImportModal').remove()" class="btn-outline">Cancel</button>
          <div style="display:flex; gap:10px;">
            <div id="erpImportQrContainer" style="display:none;"></div>
            <button id="erpImportQrBtn" class="btn-outline" style="font-size:12px;">📱 QR for Mobile</button>
            <button id="erpImportConfirmBtn" class="btn-solid" style="background:linear-gradient(135deg,#10B981,#059669);">⚡ Import ${courses.length} Courses</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Confirm import
    const confirmBtn = document.getElementById("erpImportConfirmBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        // Merge faculty from existing data
        const mergedCourses = data.courses.map((c) => ({
          ...c,
          faculty: existingFacultyMap[c.code] || c.faculty || "",
        }));

        const mergedData = {
          student: {
            ...this.attendance.student,
            ...st,
          },
          courses: mergedCourses,
        };

        this.saveAttendance(mergedData);
        WormholeAudio.resonance();
        modal.remove();

        // Show toast
        this.showToast(`✓ Imported ${mergedCourses.length} courses from DSU ERP`, "success");
      });
    }

    // QR Code for mobile
    const qrBtn = document.getElementById("erpImportQrBtn");
    if (qrBtn) {
      qrBtn.addEventListener("click", () => {
        const qrContainer = document.getElementById("erpImportQrContainer");
        const currentUrl = window.location.href.split("#")[0] + window.location.hash;
        if (qrContainer) {
          qrContainer.style.display = "flex";
          qrContainer.style.alignItems = "center";
          qrContainer.style.gap = "8px";
          // Use Google Charts QR API (public, no auth needed)
          const encoded = encodeURIComponent(window.location.href.split("#")[0] + "#att=" + hash.slice(5));
          qrContainer.innerHTML = `
            <img src="https://chart.googleapis.com/chart?chs=120x120&cht=qr&chl=${encoded}&choe=UTF-8"
                 style="border-radius:6px; background:#fff; padding:4px;" width="80" height="80" alt="QR Code" />
            <span style="font-size:11px; color:var(--text-dim);">Scan to open<br>on mobile</span>
          `;
          qrBtn.style.display = "none";
        }
      });
    }

    // Close on backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  showToast(message, type = "success") {
    const existing = document.getElementById("wormholeToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "wormholeToast";
    toast.style.cssText = `
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: ${ type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"};
      border: 1px solid ${ type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"};
      color: ${ type === "success" ? "#10B981" : "#EF4444"};
      padding: 10px 22px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      backdrop-filter: blur(12px);
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s ease;
      white-space: nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
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

    // ── Step 1: For each day, compute per-slot minimum score across all squad sections
    const DAY_SCORE_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const DAY_LABEL = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

    const dayMap = {}; // day → { slots: [{idx, minScore, labels}], windows: [{start, end, score}] }

    DAY_SCORE_ORDER.forEach((day) => {
      const slotScores = [];
      for (let i = 0; i < 7; i++) {
        const scores = sectionsArr.map((s) => CAT_LEVELS[categorizePeriod(s.data.days[day][i])]);
        const minScore = Math.min(...scores);
        const rawLabels = sectionsArr.map((s) => s.data.days[day][i]);
        slotScores.push({ idx: i, minScore, rawLabels });
      }

      // ── Step 2: Merge contiguous slots with same minScore > 0 into windows
      const windows = [];
      let i = 0;
      while (i < 7) {
        if (slotScores[i].minScore > 0) {
          let j = i;
          while (j + 1 < 7 && slotScores[j + 1].minScore === slotScores[i].minScore) j++;
          windows.push({ start: i, end: j, score: slotScores[i].minScore });
          i = j + 1;
        } else {
          i++;
        }
      }

      // ── Step 3: Also detect adjacent windows with different scores → merge into day summary
      dayMap[day] = { slotScores, windows };
    });

    // ── Step 4: Build per-day summary cards (one card per day, showing all its windows)
    const dayCards = [];
    let sharedFreeSlotsCount = 0;

    DAY_SCORE_ORDER.forEach((day) => {
      const { windows } = dayMap[day];
      if (windows.length === 0) return;

      sharedFreeSlotsCount += windows.reduce((sum, w) => sum + (w.end - w.start + 1), 0);

      // Best score across all windows on this day
      const bestScore = Math.max(...windows.map((w) => w.score));

      // Total free periods on this day
      const totalFreePeriods = windows.reduce((sum, w) => sum + (w.end - w.start + 1), 0);

      dayCards.push({ day, windows, bestScore, totalFreePeriods });
    });

    // ── Step 5: Sort by bestScore DESC, then totalFreePeriods DESC
    dayCards.sort((a, b) => b.bestScore - a.bestScore || b.totalFreePeriods - a.totalFreePeriods);

    // ── Step 6: Collective alignment badge
    const squadAlignment = Math.min(98, Math.round(50 + (sharedFreeSlotsCount / 12) * 45));
    const scoreBadge = document.getElementById("squadSyncScoreBadge");
    if (scoreBadge) scoreBadge.textContent = `${squadAlignment}% Collective Alignment`;

    // ── Step 7: Render day cards
    const rankList = document.getElementById("squadRankList");
    if (!rankList) return;
    rankList.innerHTML = "";

    if (dayCards.length === 0) {
      rankList.innerHTML = `
        <li class="card-minimal rank-item" style="justify-content:center; color:var(--text-dim); padding:20px;">
          No direct free-slot overlaps across all ${this.squad.length} sections — try the 10:20 AM break or lunch window.
        </li>
      `;
      return;
    }

    if (dayCards.some((d) => d.bestScore === 3)) WormholeAudio.resonance();

    const SCORE_LABEL = {
      3: "All Free (MOOC / Office)",
      2: "PE-1 Elective Overlap",
      1: "CTS Low Friction",
    };
    const SCORE_CLASS = { 3: "tier-3", 2: "tier-2", 1: "tier-1" };

    const humanLabel = (raw) => {
      const r = raw.toUpperCase();
      if (/MOOC/.test(r)) return "MOOC";
      if (/SPORTS/.test(r)) return "Sports";
      if (/LIBRARY/.test(r)) return "Library";
      if (/MENTOR/.test(r)) return "Mentoring";
      if (/OFFICE/.test(r)) return "Office Hr";
      if (/PE-1/.test(r)) return "PE-1 Elective";
      if (/CTS/.test(r)) return "CTS";
      if (/SOFT\s*SKILL/.test(r)) return "Soft Skills";
      if (/GPU/.test(r)) return "GPU Lab";
      if (/ML/.test(r)) return "ML Lab";
      // fallback: strip room suffix
      return raw.replace(/[\-\s]*[A-Z]\d{2,3}.*/g, "").trim() || raw;
    };

    dayCards.forEach((dc, idx) => {
      const li = document.createElement("li");
      li.className = "card-minimal rank-item";

      // Build window rows for this day
      const windowRows = dc.windows.map((w) => {
        const startT = PERIODS[w.start].displayStart;
        const endT = PERIODS[w.end].displayEnd;
        const duration = w.end - w.start + 1;
        const durationLabel = duration === 1 ? "1 period" : `${duration} periods`;

        // Per-section slot detail (clean labels)
        const sectionDetails = sectionsArr
          .map((s) => {
            const slots = s.data.days[dc.day].slice(w.start, w.end + 1).map(humanLabel);
            const unique = [...new Set(slots)].join(" + ");
            return `<span class="rank-section-tag">5${s.key}: ${unique}</span>`;
          })
          .join(" ");

        const tierClass = SCORE_CLASS[w.score] || "tier-1";
        const scoreLabel = SCORE_LABEL[w.score] || "";

        return `
          <div class="squad-window-row">
            <div class="squad-window-time">
              <span class="rank-time-badge">${startT} – ${endT}</span>
              <span class="rank-duration">${durationLabel}</span>
            </div>
            <div class="rank-sub" style="margin-top:4px;">${sectionDetails}</div>
            <div class="tier-pill ${tierClass}" style="margin-top:6px; align-self:flex-start;">${scoreLabel}</div>
          </div>
        `;
      }).join('<div class="window-divider"></div>');

      const totalLabel = dc.totalFreePeriods === 1 ? "1 free slot" : `${dc.totalFreePeriods} free slots`;
      const overallTierClass = SCORE_CLASS[dc.bestScore] || "tier-1";

      li.innerHTML = `
        <div class="rank-num">${String(idx + 1).padStart(2, "0")}</div>
        <div class="rank-main" style="flex:1; min-width:0;">
          <div class="rank-header" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span>${dc.day}</span>
            <span class="rank-total-badge ${overallTierClass}">${totalLabel}</span>
          </div>
          <div class="squad-windows-container" style="margin-top:10px;">${windowRows}</div>
        </div>
      `;
      rankList.appendChild(li);
    });

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
