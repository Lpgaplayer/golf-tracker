// ====== 1. WORKBOOKS (paste your full workbooks object here) ======
const workbooks = {
  // ... use the big object we built earlier ...
};

// ====== 2. AUTH / STATE ======
let currentUser = null;      // username
let currentRole = null;      // "student" or "coach"

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function showLogin() {
    document.getElementById("loginModal").style.display = "block";
}

function hideLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function login() {
    const role = document.getElementById("roleSelect").value;
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value;

    if (!username) {
        alert("Escribe un nombre de usuario.");
        return;
    }
    if (password !== "1234") {
        alert("Contraseña incorrecta (demo: 1234).");
        return;
    }

    currentUser = username;
    currentRole = role;

    localStorage.setItem("golfCurrentUser", JSON.stringify({ username, role }));

    document.getElementById("authStatus").textContent =
        `Conectado como ${username} (${role})`;
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("currentUserLabel").textContent =
        `Usuario actual: ${username}`;

    hideLogin();
    loadWorkbooks();
    loadHistory();
    updateDashboardVisibility();
}

function logout() {
    currentUser = null;
    currentRole = null;
    localStorage.removeItem("golfCurrentUser");

    document.getElementById("authStatus").textContent = "No conectado";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("currentUserLabel").textContent = "";

    document.getElementById("workbooks").innerHTML = "";
    document.getElementById("historyContent").innerHTML = "";
    updateDashboardVisibility();
}

function restoreSession() {
    const saved = localStorage.getItem("golfCurrentUser");
    if (!saved) {
        document.getElementById("authStatus").textContent = "No conectado";
        return;
    }
    const { username, role } = JSON.parse(saved);
    currentUser = username;
    currentRole = role;

    document.getElementById("authStatus").textContent =
        `Conectado como ${username} (${role})`;
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("currentUserLabel").textContent =
        `Usuario actual: ${username}`;

    loadWorkbooks();
    loadHistory();
    updateDashboardVisibility();
}

// ====== 3. DATA ACCESS (per user) ======
function getAllData() {
    return JSON.parse(localStorage.getItem("golfData") || "{}");
}

function getUserData(username) {
    const all = getAllData();
    return all[username] || {};
}

function setUserData(username, userData) {
    const all = getAllData();
    all[username] = userData;
    localStorage.setItem("golfData", JSON.stringify(all));
}

// ====== 4. WORKBOOK RENDERING ======
function loadWorkbooks() {
    if (!currentUser) return;

    const container = document.getElementById("workbooks");
    container.innerHTML = "";

    const userData = getUserData(currentUser);

    Object.keys(workbooks).forEach(book => {
        const div = document.createElement("div");
        div.className = "workbook";

        const title = document.createElement("h3");
        title.textContent = book;
        div.appendChild(title);

        workbooks[book].forEach(ex => {
            const exDiv = document.createElement("div");
            exDiv.className = "exercise";

            const value = (userData[book] && userData[book][ex]) || "";

            exDiv.innerHTML = `
                <label>${ex}</label>
                <input type="number" value="${value}"
                    onchange="saveResult('${book}', '${ex.replace(/'/g, "\\'")}', this.value)">
            `;

            div.appendChild(exDiv);
        });

        container.appendChild(div);
    });
}

function saveResult(book, exercise, value) {
    if (!currentUser) {
        alert("Primero inicia sesión.");
        return;
    }

    const userData = getUserData(currentUser);
    if (!userData[book]) userData[book] = {};
    userData[book][exercise] = value;

    setUserData(currentUser, userData);
    loadHistory();
    if (currentRole === "coach") {
        buildDashboard();
    }
}

// ====== 5. HISTORY (per user) ======
function loadHistory() {
    if (!currentUser) return;

    const historyDiv = document.getElementById("historyContent");
    const userData = getUserData(currentUser);

    historyDiv.innerHTML = "";

    Object.keys(userData).forEach(book => {
        const div = document.createElement("div");
        div.className = "workbook";

        div.innerHTML = `<h3>${book}</h3>`;

        Object.keys(userData[book]).forEach(ex => {
            div.innerHTML += `<p>${ex}: <strong>${userData[book][ex]}</strong></p>`;
        });

        historyDiv.appendChild(div);
    });
}

// ====== 6. EXPORT JSON (current user) ======
function exportResults() {
    if (!currentUser) {
        alert("Primero inicia sesión.");
        return;
    }
    const data = JSON.stringify(getUserData(currentUser), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `golf-results-${currentUser}.json`;
    a.click();
}

// ====== 7. COACH DASHBOARD ======
let avgChart = null;

function updateDashboardVisibility() {
    const warning = document.getElementById("coachWarning");
    const content = document.getElementById("dashboardContent");

    if (currentRole !== "coach") {
        warning.textContent = "Inicia sesión como Coach para ver el dashboard.";
        content.style.display = "none";
        return;
    }

    warning.textContent = "";
    content.style.display = "block";
    buildDashboard();
}

function buildDashboard() {
    const all = getAllData();

    // Build student list for PDF select
    const studentSelect = document.getElementById("studentSelect");
    studentSelect.innerHTML = "";
    Object.keys(all).forEach(username => {
        const opt = document.createElement("option");
        opt.value = username;
        opt.textContent = username;
        studentSelect.appendChild(opt);
    });

    // Summary stats: total students, total entries
    let totalStudents = Object.keys(all).length;
    let totalEntries = 0;

    Object.values(all).forEach(userData => {
        Object.values(userData).forEach(bookData => {
            totalEntries += Object.keys(bookData).length;
        });
    });

    document.getElementById("summaryStats").innerHTML =
        `<p>Estudiantes: <strong>${totalStudents}</strong></p>
         <p>Registros totales: <strong>${totalEntries}</strong></p>`;

    // Progress bars per workbook (average completion across students)
    const progressDiv = document.getElementById("progressBars");
    progressDiv.innerHTML = "";

    const workbookNames = Object.keys(workbooks);
    const avgValues = [];

    workbookNames.forEach(book => {
        const totalFields = workbooks[book].length;
        if (totalFields === 0) return;

        let filledCount = 0;
        let userCount = 0;

        Object.values(all).forEach(userData => {
            if (userData[book]) {
                userCount++;
                filledCount += Object.keys(userData[book]).length;
            }
        });

        const maxPossible = totalFields * (userCount || 1);
        const percent = maxPossible ? Math.round((filledCount / maxPossible) * 100) : 0;
        avgValues.push(percent);

        const container = document.createElement("div");
        container.className = "progress-container";

        container.innerHTML = `
          <div class="progress-label">${book}: ${percent}% completado</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width:${percent}%;"></div>
          </div>
        `;

        progressDiv.appendChild(container);
    });

    // Chart.js bar chart of completion %
    const ctx = document.getElementById("avgChart").getContext("2d");
    if (avgChart) avgChart.destroy();
    avgChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: workbookNames,
            datasets: [{
                label: "% completado (promedio)",
                data: avgValues,
                backgroundColor: "rgba(10,94,42,0.7)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

// ====== 8. PDF REPORT PER STUDENT ======
async function generateStudentPDF() {
    const select = document.getElementById("studentSelect");
    const username = select.value;
    if (!username) {
        alert("No hay estudiantes con datos.");
        return;
    }

    const userData = getUserData(username);
    if (!Object.keys(userData).length) {
        alert("Este estudiante no tiene datos.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;
    doc.setFontSize(16);
    doc.text(`Reporte de Práctica - ${username}`, 10, y);
    y += 8;

    doc.setFontSize(11);

    Object.keys(userData).forEach(book => {
        if (y > 270) { doc.addPage(); y = 10; }
        doc.setFont(undefined, "bold");
        doc.text(book, 10, y);
        y += 6;
        doc.setFont(undefined, "normal");

        Object.keys(userData[book]).forEach(ex => {
            if (y > 280) { doc.addPage(); y = 10; }
            const line = `${ex}: ${userData[book][ex]}`;
            doc.text(line.substring(0, 90), 12, y);
            y += 5;
        });

        y += 3;
    });

    doc.save(`reporte-${username}.pdf`);
}

// ====== 9. INIT ======
restoreSession();
