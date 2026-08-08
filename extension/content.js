(function () {
  // ─── Attendance Table Detection ─────────────────────────────────────────────
  function findAttendanceTable() {
    const keywords = ["conducted", "present", "absent", "attendance"];
    let best = null;
    let bestScore = 0;
    document.querySelectorAll("table").forEach((t) => {
      let score = 0;
      t.querySelectorAll("th, td").forEach((cell) => {
        const txt = cell.textContent.trim().toLowerCase();
        keywords.forEach((kw) => { if (txt === kw) score++; });
      });
      if (score > bestScore) { bestScore = score; best = t; }
    });
    return bestScore >= 2 ? best : null;
  }

  // ─── Parse Column Indices Dynamically ──────────────────────────────────────
  function getColumnMap(table) {
    const map = { course: -1, conducted: -1, present: -1, absent: -1, slotType: -1 };
    const header = table.querySelector("thead tr, tr");
    if (!header) return map;
    header.querySelectorAll("th, td").forEach((cell, i) => {
      const txt = cell.textContent.trim().toLowerCase().replace(/\s+/g, " ");
      if (txt.includes("course") || txt.includes("subject")) map.course = i;
      else if (txt === "conducted" || txt === "total classes") map.conducted = i;
      else if (txt === "present" || txt === "attended") map.present = i;
      else if (txt === "absent") map.absent = i;
      else if (txt.includes("type") || txt.includes("slot") || txt.includes("theory") || txt.includes("lab")) map.slotType = i;
    });
    // Fallback heuristic if headers not found: assume common DSU ERP order
    // Typical: [Sr, Type, Course, Conducted, Present, Absent, %, Status]
    if (map.course === -1) map.course = 2;
    if (map.conducted === -1) map.conducted = 3;
    if (map.present === -1) map.present = 4;
    if (map.absent === -1) map.absent = 5;
    if (map.slotType === -1) map.slotType = 1;
    return map;
  }

  // ─── Student Info Extraction ────────────────────────────────────────────────
  function extractStudentInfo() {
    const bodyText = document.body.innerText || document.body.textContent;

    // Name: try multiple selectors + page-wide scan
    let name = "";
    const nameSelectors = [
      ".student-name", ".user-name", ".username", ".profile-name",
      "[class*=student]", "[class*=profile]", "[class*=user-name]",
      "h1", "h2", "h3", "h4", ".navbar-brand"
    ];
    for (const sel of nameSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const t = (el.innerText || el.textContent).trim();
        // Filter out generic strings
        if (t.length > 2 && t.length < 80 && !/attendance|timetable|erp|portal|summary/i.test(t)) {
          name = t.split(/\n/)[0].trim(); // Take first line
          break;
        }
      }
    }
    // Fallback: look for "Welcome, <Name>" or "Name: <Name>" patterns
    if (!name) {
      const m = bodyText.match(/(?:welcome[,\s]+|student\s*name\s*:\s*|name\s*:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})/i);
      if (m) name = m[1].trim();
    }
    // Last resort: biggest proper-name-like text in header/nav
    if (!name) {
      document.querySelectorAll("header *, nav *, .navbar *").forEach((el) => {
        if (el.children.length === 0) {
          const t = (el.innerText || el.textContent).trim();
          if (/^[A-Z][a-z]+ [A-Z]/.test(t) && t.length < 60) name = t;
        }
      });
    }

    // USN: flexible pattern covers ENG24CS0001, 24CSE001, etc.
    let usn = "";
    const usnPatterns = [
      /\b(ENG\d{2}[A-Z]{2}\d{4})\b/i,
      /\b(\d{2}[A-Z]{2,4}\d{3,5})\b/,
      /USN\s*[:\-]?\s*([A-Z0-9]{6,12})/i,
      /Roll\s*No\s*[:\-]?\s*([A-Z0-9]{6,12})/i,
    ];
    for (const pat of usnPatterns) {
      const m = bodyText.match(pat);
      if (m) { usn = m[1].toUpperCase(); break; }
    }

    // Section (A–L)
    let section = "";
    const secPatterns = [
      /Section\s*[:\-]?\s*([A-L])\b/i,
      /Sec\s*[:\-]?\s*([A-L])\b/i,
      /CSE\s*-\s*([A-L])\b/i,
      /\bGroup\s*([A-L])\b/i,
    ];
    for (const pat of secPatterns) {
      const m = bodyText.match(pat);
      if (m) { section = m[1].toUpperCase(); break; }
    }

    // Batch
    let batch = 0; // 0 = unknown
    const batchM = bodyText.match(/Batch\s*[:\-]?\s*([12])\b|B\s*([12])\b/i);
    if (batchM) batch = parseInt(batchM[1] || batchM[2], 10) || 0;

    return { name, usn, section, batch };
  }

  // ─── Course Row Parsing ─────────────────────────────────────────────────────
  function parseCourses(table) {
    const colMap = getColumnMap(table);
    const courses = [];
    let tc = 0, tp = 0;

    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) return; // need at least 3 columns

      const getCellText = (idx) => {
        if (idx < 0 || idx >= cells.length) return "";
        return (cells[idx].innerText || cells[idx].textContent).replace(/\s+/g, " ").trim();
      };

      const courseText = getCellText(colMap.course);
      const condText = getCellText(colMap.conducted);
      const presentText = getCellText(colMap.present);
      const absentText = getCellText(colMap.absent);
      const slotText = getCellText(colMap.slotType);

      // Skip header-like rows, totals, empty rows
      if (!courseText || /^(course|subject|sl|sr|#|total|grand total)$/i.test(courseText.toLowerCase())) return;
      if (!/\d/.test(condText)) return; // skip rows without numeric conducted count

      const conducted = parseInt(condText) || 0;
      const present = parseInt(presentText) || 0;
      // Infer absent if column not found
      const absent = colMap.absent >= 0 ? (parseInt(absentText) || 0) : (conducted - present);
      const slotType = slotText || "Theory";

      // Course code: try 24XXYYYY pattern first, then fallback
      const codeM = courseText.match(/^(24[A-Z]{2,3}\d{3,5})\b/) || courseText.match(/^(\w{6,12})\b/);
      const code = codeM ? codeM[1] : courseText.substring(0, 10).replace(/\s/g, "");
      // Course name: remove code prefix
      const name = courseText.replace(/^24[A-Z]{2,3}\d{3,5}\s*[-–—]?\s*/, "").trim() || courseText;
      const pct = conducted > 0 ? parseFloat(((present / conducted) * 100).toFixed(2)) : 100;

      courses.push({ code, name, type: slotType, conducted, present, absent, pct, faculty: "" });
      tc += conducted;
      tp += present;
    });

    return { courses, totalConducted: tc, totalPresent: tp };
  }

  // ─── Button Init ────────────────────────────────────────────────────────────
  function init() {
    const table = findAttendanceTable();
    if (!table) return;
    if (document.getElementById("wormhole-sync-floating-btn")) return;

    const container = document.createElement("div");
    container.id = "wormhole-sync-floating-btn";
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    const button = document.createElement("button");
    button.innerHTML = `
      <span style="font-size: 16px;">⚡</span>
      <span style="font-weight: 700; letter-spacing: 0.3px;">Sync to Wormhole</span>
    `;
    button.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      color: #ffffff;
      border: none;
      border-radius: 50px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(109, 40, 217, 0.45);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    `;

    button.addEventListener("mouseover", () => {
      button.style.transform = "translateY(-3px) scale(1.03)";
      button.style.boxShadow = "0 12px 30px rgba(109, 40, 217, 0.6)";
      button.style.filter = "brightness(1.1)";
    });
    button.addEventListener("mouseout", () => {
      button.style.transform = "translateY(0) scale(1)";
      button.style.boxShadow = "0 8px 24px rgba(109, 40, 217, 0.45)";
      button.style.filter = "none";
    });

    const resetButton = () => {
      button.disabled = false;
      button.innerHTML = `
        <span style="font-size: 16px;">⚡</span>
        <span style="font-weight: 700; letter-spacing: 0.3px;">Sync to Wormhole</span>
      `;
      button.style.background = "linear-gradient(135deg, #8b5cf6, #6d28d9)";
      button.style.boxShadow = "0 8px 24px rgba(109, 40, 217, 0.45)";
    };

    button.addEventListener("click", () => {
      try {
        button.disabled = true;
        button.innerHTML = `
          <span style="display: inline-block; animation: spin 1s linear infinite; font-size: 16px;">🔄</span>
          <span>Syncing...</span>
        `;

        const attTable = findAttendanceTable();
        if (!attTable) {
          alert("❌ Cannot find attendance table on this page.\nMake sure you're on the Attendance Summary tab.");
          resetButton();
          return;
        }

        const { name, usn, section, batch } = extractStudentInfo();
        const { courses, totalConducted: tc, totalPresent: tp } = parseCourses(attTable);

        if (!courses.length) {
          alert("❌ No attendance records found.\nMake sure you are on the Attendance Summary tab and data is loaded.");
          resetButton();
          return;
        }

        const overallPct = tc > 0 ? parseFloat(((tp / tc) * 100).toFixed(2)) : 100;
        const payload = JSON.stringify({
          student: {
            name,
            usn,
            section,
            labBatch: batch,
            totalConducted: tc,
            totalPresent: tp,
            totalAbsent: tc - tp,
            overallPct,
            syncedAt: new Date().toISOString()
          },
          courses
        });

        const encoded = btoa(unescape(encodeURIComponent(payload)));
        const targetUrl = `https://wormhole-snowy.vercel.app/#att=${encoded}`;
        window.open(targetUrl, "_blank");

        button.innerHTML = `<span style="font-size: 16px;">✅</span><span>Synced!</span>`;
        button.style.background = "linear-gradient(135deg, #10b981, #059669)";
        button.style.boxShadow = "0 8px 24px rgba(5, 150, 105, 0.45)";
        setTimeout(resetButton, 3000);
      } catch (err) {
        alert("Wormhole Extension Error: " + err.message);
        resetButton();
      }
    });

    // Spin animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    container.appendChild(button);
    document.body.appendChild(container);
  }

  // SPA observer + initial run
  const observer = new MutationObserver(() => init());
  observer.observe(document.body, { childList: true, subtree: true });
  init();
})();
