// Importa los módulos necesarios desde Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// CONFIGURACIÓN DE FIREBASE:
const firebaseConfig = {
  apiKey: "AIzaSyCzZBL-GfbxbWtPzMHOkSgnfF0UXD7wt4Y",
  authDomain: "pruebacamarero-b7f54.firebaseapp.com",
  databaseURL: "https://pruebacamarero-b7f54-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "pruebacamarero-b7f54",
  storageBucket: "pruebacamarero-b7f54.firebasestorage.app",
  messagingSenderId: "191387429666",
  appId: "1:191387429666:web:ae8472198e543c6de5d37b",
  measurementId: "G-KXDVQLNQW2"
};

// Inicializa la aplicación Firebase y la base de datos
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Guarda un pedido en Firebase Realtime Database.
 */
export function guardarPedido(orderData) {
  if (!orderData.fecha) {
    orderData.fecha = new Date().toISOString();
  }
  const pedidosRef = ref(db, 'pedidos');
  return push(pedidosRef, orderData);
}

/**
 * Carga todos los productos desde Firebase Realtime Database.
 * Los productos se guardan en /productos/{id} con los campos:
 * id, name, description, price, image, category, subcategory, menuOptions (opcional)
 * @returns {Promise<Array>} Array de productos
 */
export async function cargarProductos() {
  const productosRef = ref(db, 'productos');
  const snapshot = await get(productosRef);
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

// Exporta la configuración y la instancia de Firebase
export { firebaseConfig, db };