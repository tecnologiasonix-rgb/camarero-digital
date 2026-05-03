import { initializeApp }    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, get }
                            from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut }
                            from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDPbN_dr1LzVhksnFmzeKOLpHAZZRSxWv4",
  authDomain:        "tecnologiasonix-733fc.firebaseapp.com",
  databaseURL:       "https://tecnologiasonix-733fc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "tecnologiasonix-733fc",
  storageBucket:     "tecnologiasonix-733fc.firebasestorage.app",
  messagingSenderId: "139377195491",
  appId:             "1:139377195491:web:0727f6e57cc23351bd88d6"
};

const app  = initializeApp(firebaseConfig);
export const db   = getDatabase(app);
export const auth = getAuth(app);

// ─── AUTH ────────────────────────────────────────────────────────────────────

/** Login con email y contraseña */
export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

/**
 * Obtiene el restaurantId del usuario autenticado.
 * Lee /usuarios/{uid}/restaurantId en la base de datos.
 */
export async function getRestaurantId() {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay sesión activa.");
  const snap = await get(ref(db, `usuarios/${user.uid}/restaurantId`));
  if (!snap.exists()) throw new Error("Usuario sin restaurante asignado.");
  return snap.val();
}

/**
 * Espera a que Firebase Auth resuelva el estado del usuario.
 * Útil para proteger páginas de admin/recepcion.
 */
export function esperarAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, resolve);
  });
}

// ─── DATOS ───────────────────────────────────────────────────────────────────

/**
 * ANTES: guardarPedido(orderData)
 *        → push(ref(db, 'pedidos'), orderData)
 *
 * DESPUÉS: guardarPedido(orderData, restaurantId)
 *          → push(ref(db, 'restaurantes/{restaurantId}/pedidos'), orderData)
 */
export function guardarPedido(orderData, restaurantId) {
  if (!restaurantId) throw new Error("restaurantId requerido");
  if (!orderData.fecha) orderData.fecha = new Date().toISOString();
  orderData.restaurantId = restaurantId; // incluido por seguridad
  return push(ref(db, `restaurantes/${restaurantId}/pedidos`), orderData);
}

/**
 * ANTES: cargarProductos()
 *        → get(ref(db, 'productos'))
 *
 * DESPUÉS: cargarProductos(restaurantId)
 *          → get(ref(db, 'restaurantes/{restaurantId}/productos'))
 */
export async function cargarProductos(restaurantId) {
  if (!restaurantId) throw new Error("restaurantId requerido");
  const snapshot = await get(ref(db, `restaurantes/${restaurantId}/productos`));
  if (!snapshot.exists()) return [];

  const productos = [];
  snapshot.forEach(child => {
    const data = child.val();
    productos.push({
      id:          child.key,
      name:        data.name        || "",
      description: data.description || "",
      price:       parseFloat(data.price) || 0,
      image:       data.image       || "",
      category:    data.category    || "",
      subcategory: data.subcategory || "",
      menuOptions: data.menuOptions || null,
    });
  });
  return productos.filter(p => p.name);
}

export { firebaseConfig };
