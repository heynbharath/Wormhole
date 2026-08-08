(function () {
  // Check if we are on the Attendance Summary page
  function findAttendanceTable() {
    let attTable = null;
    document.querySelectorAll("table").forEach((t) => {
      t.querySelectorAll("th").forEach((th) => {
        if (th.textContent.trim().toLowerCase() === "conducted") {
          attTable = t;
        }
      });
    });
    return attTable;
  }

  function init() {
    const table = findAttendanceTable();
    if (!table) return;

    // Check if button already injected
    if (document.getElementById("wormhole-sync-floating-btn")) return;

    // Create floating action button
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

    // Hover effects
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

    button.addEventListener("click", () => {
      try {
        button.disabled = true;
        button.innerHTML = `
          <span style="display: inline-block; animation: spin 1s linear infinite; font-size: 16px;">🔄</span>
          <span>Syncing...</span>
        `;

        // Extract student name
        let studentName = "";
        document.querySelectorAll("h1, h2, h3, h4, h5").forEach((el) => {
          const t = el.innerText || el.textContent;
          if (t.includes("Attendance Summary")) {
            studentName = t.split("Attendance Summary").pop().replace(/of\s*Semester\s*\d+/i, "").trim();
          }
        });
        if (!studentName) {
          const uel = document.querySelector(".user-name, .student-name, [class*=username], [class*=user-info]");
          if (uel) studentName = uel.textContent.trim();
        }

        const attTable = findAttendanceTable();
        if (!attTable) {
          alert("❌ Cannot find attendance table on this page.");
          resetButton();
          return;
        }

        const courses = [];
        let tc = 0;
        let tp = 0;

        attTable.querySelectorAll("tbody tr").forEach((row) => {
          const c = row.querySelectorAll("td");
          if (c.length < 6) return;
          const courseText = (c[2].innerText || c[2].textContent).trim();
          const condText = (c[3].innerText || c[3].textContent).trim();
          if (!courseText || courseText.toLowerCase() === "total" || !/\d/.test(condText)) return;

          const conducted = parseInt(condText) || 0;
          const present = parseInt((c[4].innerText || c[4].textContent).trim()) || 0;
          const absent = parseInt((c[5].innerText || c[5].textContent).trim()) || 0;
          const slotType = (c[1].innerText || c[1].textContent).trim();
          const codeM = courseText.match(/^(24[A-Z]{2}\d{4})/);
          const code = codeM ? codeM[1] : courseText.substring(0, 10).replace(/\s/g, "");
          const name = courseText.replace(/^24[A-Z]{2}\d{4}\s*[-\u2013\u2014]?\s*/, "").trim() || courseText;
          const pct = conducted > 0 ? parseFloat(((present / conducted) * 100).toFixed(2)) : 100;

          courses.push({
            code,
            name,
            type: slotType,
            conducted,
            present,
            absent,
            pct,
            faculty: ""
          });
          tc += conducted;
          tp += present;
        });

        if (!courses.length) {
          alert("❌ No attendance records found. Make sure you are on the Attendance Summary tab.");
          resetButton();
          return;
        }

        const overallPct = tc > 0 ? parseFloat(((tp / tc) * 100).toFixed(2)) : 100;
        const payload = JSON.stringify({
          student: {
            name: studentName,
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

        // Success animation state
        button.innerHTML = `
          <span style="font-size: 16px;">✅</span>
          <span>Synced!</span>
        `;
        button.style.background = "linear-gradient(135deg, #10b981, #059669)";
        button.style.boxShadow = "0 8px 24px rgba(5, 150, 105, 0.45)";

        setTimeout(resetButton, 3000);
      } catch (err) {
        alert("Wormhole Extension Error: " + err.message);
        resetButton();
      }
    });

    function resetButton() {
      button.disabled = false;
      button.innerHTML = `
        <span style="font-size: 16px;">⚡</span>
        <span style="font-weight: 700; letter-spacing: 0.3px;">Sync to Wormhole</span>
      `;
      button.style.background = "linear-gradient(135deg, #8b5cf6, #6d28d9)";
      button.style.boxShadow = "0 8px 24px rgba(109, 40, 217, 0.45)";
    }

    // Injected spin animation
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

  // Observe page loads/SPA changes
  const observer = new MutationObserver(() => {
    init();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial check
  init();
})();
