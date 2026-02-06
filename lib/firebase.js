import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  // Asegúrate de que estos datos sean los del "SDK Web" que copiaste
  apiKey: "AIzaSyD7QgwPe2GzN6JI-P0G9TZX5P9SlBF0yqg",
  authDomain: "ciclismo-846ad.firebaseapp.com",
  projectId: "ciclismo-846ad",
  storageBucket: "ciclismo-846ad.firebasestorage.app",
  messagingSenderId: "234213679467",
  appId: "1:234213679467:web:8d58f8309bcd63a9eaac2e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. IMPORTANTE: Aquí especificamos el nombre de tu base de datos "dbciclismo"
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache()
}, "dbciclismo"); // <--- AGREGAMOS EL NOMBRE AQUÍ

const storage = getStorage(app);

export { db, storage };