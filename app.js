```javascript
// =======================
// DATA (ONLY DATA HERE)
// =======================
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
    "25 putts desde 50 pies"
  ],
  "Libro 2": [
    "20 yardas pitch - distancia promedio (10 tiros)",
    "40 yardas pitch - distancia promedio (10 tiros)",
    "60 yardas pitch - distancia promedio (10 tiros)",
    "80 yardas pitch - bolas en green (10 bolas)",
    "100 yardas pitch - bolas en green (10 bolas)",
    "Hierros rectas 100 yardas",
    "Hierros izquierda 100 yardas",
    "Hierros derecha 100 yardas",
    "Driver bolas dentro de 30 yds"
  ]
};

// =======================
// STATE
// =======================
let currentUser = null;
const STORAGE_KEY = "golfData_v1";

// =======================
// AUTH
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
    alert("Ingresa usuario");
    return;
  }

  if (password !== "1234") {
    alert("Password incorrecto (1234)");
    return;
  }

  currentUser = { name: username, role };
  localStorage.setItem("golfCurrentUser", JSON.stringify(currentUser));

  hideLogin();
  updateAuthBar();
  loadWorkbooks();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("golfCurrentUser");
  updateAuthBar();
  document.getElementById("workbooks").innerHTML = "";
}

// =======================
// UI
// =======================
function updateAuthBar() {
  const authStatus = document.getElementById("authStatus");

  if (currentUser) {
    authStatus.textContent = "Usuario: " + currentUser.name;
  } else {
    authStatus.textContent = "No conectado";
  }
}

// =======================
// STORAGE
// =======================
function getUserKey() {
  if (!currentUser) return null;
  return STORAGE_KEY + "_" + currentUser.name;
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
// WORKBOOKS
// =======================
function loadWorkbooks() {
  const container = document.getElementById("workbooks");
  container.innerHTML = "";

  if (!currentUser) {
    container.textContent = "Login primero";
    return;
  }

  const data = loadUserData();

  Object.keys(workbooks).forEach(book => {
    const div = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = book;
    div.appendChild(title);

    workbooks[book].forEach(ex => {
      const row = document.createElement("div");

      const label = document.createElement("span");
      label.textContent = ex;

      const input = document.createElement("input");
      input.type = "number";
      input.value = data?.[book]?.[ex] || "";

      input.onchange = () => {
        saveResult(book, ex, input.value);
      };

      row.appendChild(label);
      row.appendChild(input);
      div.appendChild(row);
    });

    container.appendChild(div);
  });
}

function saveResult(book, ex, value) {
  let data = loadUserData();
  if (!data[book]) data[book] = {};

  data[book][ex] = value;
  saveUserData(data);
}

// =======================
// SERVICE WORKER
// =======================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("SW OK"))
    .catch(err => console.log("SW error", err));
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("golfCurrentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
  }

  updateAuthBar();
  loadWorkbooks();
});
```
