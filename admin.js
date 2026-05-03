import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, get
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPbN_dr1LzVhksnFmzeKOLpHAZZRSxWv4",
  authDomain: "tecnologiasonix-733fc.firebaseapp.com",
  databaseURL: "https://tecnologiasonix-733fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tecnologiasonix-733fc",
  storageBucket: "tecnologiasonix-733fc.firebasestorage.app",
  messagingSenderId: "139377195491",
  appId: "1:139377195491:web:0727f6e57cc23351bd88d6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let products = [];
let restaurantId = null;

const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("adminLoginBtn");
const emailInput = document.getElementById("adminEmail");
const passInput = document.getElementById("adminPassword");
const loginError = document.getElementById("loginErrorMsg");
const loginErrorText = document.getElementById("loginErrorText");
const toggleAdminBtn = document.getElementById("toggleAdmin");
const adminPanel = document.getElementById("adminPanel");
const container = document.getElementById("adminTableContainer");

adminPanel.style.display = "none";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginModal.style.display = "none";
    const snap = await get(ref(db, `usuarios/${user.uid}/restaurantId`));
    if (snap.exists()) {
      restaurantId = snap.val();
      loadProducts();
    } else {
      showToast("Tu cuenta no tiene un restaurante asociado.", "error");
      await signOut(auth);
      loginModal.style.display = "flex";
    }
  } else {
    loginModal.style.display = "flex";
    restaurantId = null;
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passInput.value;
  loginError.style.display = "none";

  if (!email || !password) {
    loginErrorText.textContent = "Introduce email y contraseña.";
    loginError.style.display = "block";
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    loginErrorText.textContent = "Credenciales incorrectas.";
    loginError.style.display = "block";
  }
});

[emailInput, passInput].forEach(el => {
  el.addEventListener("keyup", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });
});

const logoutBtn = document.createElement("button");
logoutBtn.className = "btn-manage";
logoutBtn.style.marginLeft = "10px";
logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Salir';
logoutBtn.addEventListener("click", () => signOut(auth));
document.querySelector("header").appendChild(logoutBtn);

async function loadProducts() {
  if (!restaurantId) return;
  const snap = await get(ref(db, `restaurantes/${restaurantId}/productos`));
  products = [];
  if (snap.exists()) {
    snap.forEach(child => products.push({ id: child.key, ...child.val() }));
  }
  renderProducts();
}

function renderProducts() {
  if (!products.length) {
    container.innerHTML = "<p>No hay productos en la base de datos.</p>";
    return;
  }
  container.innerHTML = `
    <table>
      <tr><th>Nombre</th><th>Precio</th></tr>
      ${products.map(p => `
        <tr>
          <td>${p.name || "Sin nombre"}</td>
          <td>${p.price ? p.price.toFixed(2) : '0.00'}€</td>
        </tr>
      `).join("")}
    </table>`;
}

toggleAdminBtn.addEventListener("click", () => {
  adminPanel.classList.toggle("open");
  if (adminPanel.classList.contains("open")) {
    loadProducts();
  }
});

function showToast(msg, type = "") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show " + type;
  setTimeout(() => toast.classList.remove("show"), 3000);
}
