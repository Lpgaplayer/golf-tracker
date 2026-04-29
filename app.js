const workbooks = {
  "Libro 1": [
    "1. Habilidades del Putt (Anotar número de putts metidos)",
    "10 putts caída der→izq 3 pies",
    "10 putts caída izq→der 3 pies",
    "10 putts rectos 3 pies",
    "",
    "10 putts caída der→izq 6 pies",
    "10 putts caída izq→der 6 pies",
    "10 putts rectos 6 pies",
    "",
    "10 putts caída der→izq 9 pies",
    "10 putts caída izq→der 9 pies",
    "10 putts rectos 9 pies",
    "",
    "10 putts caída der→izq 12 pies",
    "10 putts caída izq→der 12 pies",
    "10 putts rectos 12 pies",
    "",
    "10 putts caída der→izq 15 pies",
    "10 putts caída izq→der 15 pies",
    "10 putts rectos 15 pies",
    "",
    "2. Prueba de Putt de Acercamiento (Anota cuántos quedan a 3 pies del hoyo)",
    "25 putts desde 20 pies",
    "25 putts desde 30 pies",
    "25 putts desde 40 pies",
    "25 putts desde 50 pies",
    "",
    "3. Chipping desde el Fringe (Anota el número de chips a cada distancia)",
    "50 chips a bandera roja (corta), a una distancia de 3 pies",
    "50 chips a bandera amarilla (media), a una distancia de 4 pies",
    "50 chips a bandera azul (larga), a una distancia de 5 pies",
    "",
    "4. Chipping desde el Rough (Anota el número de chips a cada distancia)",
    "50 chips a bandera roja (corta), a una distancia de 3 pies",
    "50 chips a bandera amarilla (media), a una distancia de 4 pies",
    "50 chips a bandera azul (larga), a una distancia de 5 pies"
  ],

  "Libro 2": [
    "1. Pitching (En cuántos tiros lograste hacerlo)",
    "20 yardas pitch - Distancia promedio desde el hoyo (10 tiros)",
    "40 yardas pitch - Distancia promedio desde el hoyo (10 tiros)",
    "60 yardas pitch - Distancia promedio desde el hoyo (10 tiros)",
    "80 yardas pitch - Número de bolas en el green de 10 bolas",
    "80 yardas pitch - Distancia promedio desde el hoyo",
    "100 yardas pitch - Número de bolas en el green de 10 bolas",
    "100 yardas pitch - Distancia promedio desde el hoyo",
    "",
    "2. Hierros (En cuántos tiros lograste hacerlo)",
    "Cuenta el número de bolas rectas a la bandera de 100 yardas",
    "Cuenta el número de bolas a la izquierda a la bandera de 100 yardas",
    "Cuenta el número de bolas a la derecha a la bandera de 100 yardas",
    "",
    "Cuenta el número de bolas rectas a la bandera de 125 yardas",
    "Cuenta el número de bolas a la izquierda a la bandera de 125 yardas",
    "Cuenta el número de bolas a la derecha a la bandera de 125 yardas",
    "",
    "Cuenta el número de bolas rectas a la bandera de 150 yardas",
    "Cuenta el número de bolas a la izquierda a la bandera de 150 yardas",
    "Cuenta el número de bolas a la derecha a la bandera de 150 yardas",
    "",
    "Cuenta el número de bolas rectas a la bandera de 175 yardas",
    "Cuenta el número de bolas a la izquierda a la bandera de 175 yardas",
    "Cuenta el número de bolas a la derecha a la bandera de 175 yardas",
    "",
    "Cuenta el número de bolas rectas a la bandera de 200 yardas",
    "Cuenta el número de bolas a la izquierda a la bandera de 200 yardas",
    "Cuenta el número de bolas a la derecha a la bandera de 200 yardas",
    "",
    "3. Driver",
    "Número de bolas que cayeron dentro de un área de 30 yds del objetivo"
  ]
};

let currentUser = null;
const STORAGE_KEY = "golfData_v1";

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

  if (role === "coach") {
  if (username.toLowerCase() !== "chela" || password !== "coach2026") {
    alert("Solo Chela puede entrar como Coach.");
    return;
  }
} else {
  if (password !== "1234") {
    alert("Contraseña incorrecta. Usa 1234.");
    return;
  }
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
  loadWorkbooks();
  loadHistory();
  updateDashboardVisibility();
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

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  if (id === "home") loadWorkbooks();
  if (id === "libro2") loadLibro2();
  if (id === "history") loadHistory();
  if (id === "dashboard") updateDashboardVisibility();
}

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

function isTitle(text) {
  return text.startsWith("1.") || text.startsWith("2.") || text.startsWith("3.") || text.startsWith("4.");
}

function renderWorkbook(bookName, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!currentUser) {
    container.textContent = "Inicia sesión para ver y guardar tus resultados.";
    return;
  }

  const data = loadUserData();
  const div = document.createElement("div");
  div.className = "workbook";

  workbooks[bookName].forEach(ex => {
    const row = document.createElement("div");
    row.className = "exercise";

    if (ex === "") {
      row.style.height = "15px";
      div.appendChild(row);
      return;
    }

    if (isTitle(ex)) {
      row.className = "section-title";
      row.textContent = ex;
      div.appendChild(row);
      return;
    }

    const label = document.createElement("label");
    label.textContent = ex;

    const input = document.createElement("input");
    input.type = "number";
    input.value = data?.[bookName]?.[ex] || "";

    input.onchange = () => {
      saveResult(bookName, ex, input.value);
    };

    row.appendChild(label);
    row.appendChild(input);
    div.appendChild(row);
  });

  container.appendChild(div);
}

function loadWorkbooks() {
  renderWorkbook("Libro 1", "workbooks");
}

function loadLibro2() {
  renderWorkbook("Libro 2", "libro2Content");
}

function saveResult(book, exercise, value) {
  if (!currentUser) {
    alert("Debes iniciar sesión para guardar resultados.");
    return;
  }

  const data = loadUserData();

  if (!data[book]) {
    data[book] = {};
  }

  data[book][exercise] = value;
  saveUserData(data);

  loadHistory();
  updateDashboard();
}

function loadHistory() {
  const historyDiv = document.getElementById("historyContent");
  if (!historyDiv) return;

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

    const title = document.createElement("h3");
    title.textContent = book;
    div.appendChild(title);

    Object.keys(data[book]).forEach(ex => {
      const p = document.createElement("p");
      p.innerHTML = `${ex}: <strong>${data[book][ex]}</strong>`;
      div.appendChild(p);
    });

    historyDiv.appendChild(div);
  });
}

function exportResults() {
  if (!currentUser) {
    alert("Debes iniciar sesión para exportar resultados.");
    return;
  }

  const data = loadUserData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `golf-results-${currentUser.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function updateDashboardVisibility() {
  const dashboardContent = document.getElementById("dashboardContent");
  const coachWarning = document.getElementById("coachWarning");

  if (!dashboardContent || !coachWarning) return;

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
  if (!select || !currentUser) return;

  select.innerHTML = "";

  const option = document.createElement("option");
  option.value = currentUser.name;
  option.textContent = currentUser.name;
  select.appendChild(option);
}

function updateDashboard() {
  const summaryStats = document.getElementById("summaryStats");
  const progressBars = document.getElementById("progressBars");

  if (!summaryStats || !progressBars) return;

  if (!currentUser || currentUser.role !== "coach") {
    summaryStats.innerHTML = "";
    progressBars.innerHTML = "";
    return;
  }

  const data = loadUserData();

  let totalExercises = 0;
  let completed = 0;

  Object.keys(workbooks).forEach(book => {
    totalExercises += workbooks[book].filter(ex => ex !== "" && !isTitle(ex)).length;
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
    const total = workbooks[book].filter(ex => ex !== "" && !isTitle(ex)).length;
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

function generateStudentPDF() {
  alert("PDF aún no está implementado. Usa Exportar JSON en Perfil.");
}

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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .catch(error => console.log("Service Worker error:", error));
}
