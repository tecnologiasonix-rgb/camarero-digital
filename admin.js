import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, get, set, push, remove, update
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/* ================= FIREBASE ================= */

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

/* ================= STATE ================= */

let products = [];
let restaurantId = null;

/* ================= UI ================= */

const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const showLoader = () => loader.classList.add("active");
const hideLoader = () => loader.classList.remove("active");

function showToast(msg, type = "") {
  toast.textContent = msg;
  toast.className = "toast show " + type;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ================= AUTH ================= */

const user = await new Promise(r => onAuthStateChanged(auth, r));

if (!user) {
  showToast("No autenticado", "error");
} else {
  const snap = await get(ref(db, `usuarios/${user.uid}/restaurantId`));

  if (!snap.exists()) {
    showToast("Sin restaurante asignado", "error");
    await signOut(auth);
  } else {
    restaurantId = snap.val();
    loadProducts();
  }
}

/* ================= FIREBASE ================= */

async function loadProducts() {
  showLoader();

  const snap = await get(ref(db, `restaurantes/${restaurantId}/productos`));

  products = [];

  if (snap.exists()) {
    snap.forEach(child => {
      products.push({ id: child.key, ...child.val() });
    });
  }

  renderProducts();
  hideLoader();
}

/* ================= RENDER ================= */

function renderProducts() {
  const container = document.getElementById("adminTableContainer");

  if (!products.length) {
    container.innerHTML = "<p>No hay productos</p>";
    return;
  }

  container.innerHTML = `
    <table>
      <tr>
        <th>Nombre</th>
        <th>Precio</th>
      </tr>
      ${products.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.price}€</td>
        </tr>
      `).join("")}
    </table>
  `;
}

/* ================= EVENTS ================= */

document.getElementById("toggleAdmin").onclick = () => {
  document.getElementById("adminPanel").classList.toggle("open");
  loadProducts();
};
