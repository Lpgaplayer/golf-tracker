const workbooks = {

"Libro 1": [
"10 putts caída der→izq 3 pies",
"10 putts caída izq→der 3 pies",
"10 putts rectos 3 pies",
"10 putts caída der→izq 6 pies",
"10 putts caída izq→der 6 pies",
"10 putts rectos 6 pies",
"10 putts caída der→izq 9 pies",
"10 putts caída izq→der 9 pies",
"10 putts rectos 9 pies",
"10 putts caída der→izq 12 pies",
"10 putts caída izq→der 12 pies",
"10 putts rectos 12 pies",
"10 putts caída der→izq 15 pies",
"10 putts caída izq→der 15 pies",
"10 putts rectos 15 pies",
"25 putts desde 20 pies",
"25 putts desde 30 pies",
"25 putts desde 40 pies",
"25 putts desde 50 pies",
"50 chips roja 3 pies",
"50 chips amarilla 4 pies",
"50 chips azul 5 pies",
"50 chips rough roja 3 pies",
"50 chips rough amarilla 4 pies",
"50 chips rough azul 5 pies"
],

"Libro 2": [
"20 yardas pitch - distancia promedio (10 tiros)",
"40 yardas pitch - distancia promedio (10 tiros)",
"60 yardas pitch - distancia promedio (10 tiros)",
"80 yardas pitch - bolas en green (10 bolas)",
"80 yardas pitch - distancia promedio",
"100 yardas pitch - bolas en green (10 bolas)",
"100 yardas pitch - distancia promedio",
"Hierros rectas 100 yardas",
"Hierros izquierda 100 yardas",
"Hierros derecha 100 yardas",
"Hierros rectas 125 yardas",
"Hierros izquierda 125 yardas",
"Hierros derecha 125 yardas",
"Hierros rectas 150 yardas",
"Hierros izquierda 150 yardas",
"Hierros derecha 150 yardas",
"Hierros rectas 175 yardas",
"Hierros izquierda 175 yardas",
"Hierros derecha 175 yardas",
"Hierros rectas 200 yardas",
"Hierros izquierda 200 yardas",
"Hierros derecha 200 yardas",
"Driver bolas dentro de 30 yds"
],


};
const workbooks = {
// =======================
// STATE
// =======================
let currentUser = null;   // { name, role }
const STORAGE_KEY = "golfData_v1"; // per-user data

// =======================
// AUTH / LOGIN
// =======================
function showLogin() {
    document.getElementById("loginModal").style.display = "block";
}

function hideLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function login() {
    const role = document.getElementById("roleSelect").value;
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    if (!username) {
        alert("Por favor ingresa un nombre de usuario.");
        return;
    }

    // Demo password
    if (password !== "1234") {
        alert("Contraseña incorrecta (demo: 1234).");
        return;
    }

    currentUser = { name: username, role };
    localStorage.setItem("golfCurrentUser", JSON.stringify(currentUser));

    hideLogin();
    updateAuthBar();
    loadWorkbooks();
    loadHistory();
    updateDashboardVisibility();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("golfCurrentUser");
    updateAuthBar();
    showPage("home");
    document.getElementById("workbooks").innerHTML = "";
    document.getElementById("historyContent").innerHTML = "";
    document.getElementById("dashboardContent").style.display = "none";
    document.getElementById("coachWarning").textContent = "";
}

function updateAuthBar() {
    const authStatus = document.getElementById("authStatus");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const currentUserLabel = document.getElementById("currentUserLabel");

    if (currentUser) {
        authStatus.textContent = `Conectado como: ${currentUser.name} (${currentUser.role})`;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        currentUserLabel.textContent = `Usuario actual: ${currentUser.name}`;
    } else {
        authStatus.textContent = "No has iniciado sesión.";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        currentUserLabel.textContent = "";
    }
}

// =======================
// NAVIGATION
// =======================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// =======================
// STORAGE HELPERS
// =======================
function getUserKey() {
    if (!currentUser) return null;
    return `${STORAGE_KEY}_${currentUser.name}`;
}

function loadUserData() {
    const key = getUserKey();
    if (!key) return {};
    return JSON.parse(localStorage.getItem(key) || "{}");
}

function saveUserData(data) {
    const key = getUserKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
}

// =======================
// WORKBOOK RENDERING
// =======================
function loadWorkbooks() {
    const container = document.getElementById("workbooks");
    container.innerHTML = "";

    if (!currentUser) {
        const msg = document.createElement("p");
        msg.textContent = "Inicia sesión para ver y guardar tus resultados.";
        container.appendChild(msg);
        return;
    }

    const data = loadUserData();

    Object.keys(workbooks).forEach(book => {
        const div = document.createElement("div");
        div.className = "workbook";

        const title = document.createElement("h3");
        title.textContent = book;
        div.appendChild(title);

        workbooks[book].forEach(ex => {
            const exDiv = document.createElement("div");
            exDiv.className = "exercise";

            const label = document.createElement("label");
            label.textContent = ex;

            const input = document.createElement("input");
            input.type = "number";
            input.value = (data[book] && data[book][ex]) ? data[book][ex] : "";
            input.onchange = () => saveResult(book, ex, input.value);

            exDiv.appendChild(label);
            exDiv.appendChild(input);
            div.appendChild(exDiv);
        });

        container.appendChild(div);
    });
}

function saveResult(book, exercise, value) {
    if (!currentUser) {
        alert("Debes iniciar sesión para guardar resultados.");
        return;
    }

    let data = loadUserData();
    if (!data[book]) data[book] = {};
    data[book][exercise] = value;
    saveUserData(data);
    loadHistory();
    updateDashboard();
}

// =======================
// HISTORY
// =======================
function loadHistory() {
    const historyDiv = document.getElementById("historyContent");
    historyDiv.innerHTML = "";

    if (!currentUser) {
        historyDiv.textContent = "Inicia sesión para ver tu historial.";
        return;
    }

    const data = loadUserData();

    if (Object.keys(data).length === 0) {
        historyDiv.textContent = "Sin resultados guardados todavía.";
        return;
    }

    Object.keys(data).forEach(book => {
        const div = document.createElement("div");
        div.className = "workbook";
        div.innerHTML = `<h3>${book}</h3>`;

        Object.keys(data[book]).forEach(ex => {
            const val = data[book][ex];
            div.innerHTML += `<p>${ex}: <strong>${val}</strong></p>`;
        });

        historyDiv.appendChild(div);
    });
}

// =======================
// EXPORT (PROFILE PAGE)
// =======================
function exportResults() {
    if (!currentUser) {
        alert("Debes iniciar sesión para exportar resultados.");
        return;
    }

    const data = loadUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `golf-results-${currentUser.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// =======================
// COACH DASHBOARD (BASIC)
// =======================
function updateDashboardVisibility() {
    const dashboardContent = document.getElementById("dashboardContent");
    const coachWarning = document.getElementById("coachWarning");

    if (!currentUser) {
        dashboardContent.style.display = "none";
        coachWarning.textContent = "Inicia sesión como Coach para ver el dashboard.";
        return;
    }

    if (currentUser.role !== "coach") {
        dashboardContent.style.display = "none";
        coachWarning.textContent = "Solo visible para el rol Coach.";
        return;
    }

    coachWarning.textContent = "";
    dashboardContent.style.display = "block";
    populateStudentSelect();
    updateDashboard();
}

function populateStudentSelect() {
    const select = document.getElementById("studentSelect");
    select.innerHTML = "";

    const option = document.createElement("option");
    option.value = currentUser.name;
    option.textContent = currentUser.name;
    select.appendChild(option);
}

function updateDashboard() {
    const summaryStats = document.getElementById("summaryStats");
    const progressBars = document.getElementById("progressBars");

    if (!currentUser || currentUser.role !== "coach") {
        summaryStats.innerHTML = "";
        progressBars.innerHTML = "";
        return;
    }

    const data = loadUserData();

    let totalExercises = 0;
    let completed = 0;

    Object.keys(workbooks).forEach(book => {
        totalExercises += workbooks[book].length;
    });

    Object.keys(data).forEach(book => {
        Object.keys(data[book]).forEach(ex => {
            if (data[book][ex] !== "" && data[book][ex] != null) {
                completed++;
            }
        });
    });

    const percent = totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0;

    summaryStats.innerHTML = `
        <p>Total ejercicios: <strong>${totalExercises}</strong></p>
        <p>Completados: <strong>${completed}</strong></p>
        <p>Progreso general: <strong>${percent}%</strong></p>
    `;

    progressBars.innerHTML = "";
    Object.keys(workbooks).forEach(book => {
        const total = workbooks[book].length;
        let done = 0;

        if (data[book]) {
            Object.keys(data[book]).forEach(ex => {
                if (data[book][ex] !== "" && data[book][ex] != null) {
                    done++;
                }
            });
        }

        const p = total > 0 ? Math.round((done / total) * 100) : 0;

        const row = document.createElement("div");
        row.className = "progress-row";
        row.innerHTML = `
            <span>${book}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${p}%;"></div>
            </div>
            <span>${p}%</span>
        `;
        progressBars.appendChild(row);
    });
}

// =======================
// PDF (SAFE STUB)
// =======================
function generateStudentPDF() {
    alert("PDF aún no está implementado en esta versión. Usa Exportar JSON en Perfil.");
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("golfCurrentUser");
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            currentUser = null;
        }
    }

    updateAuthBar();
    loadWorkbooks();
    loadHistory();
    updateDashboardVisibility();
});
