import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const configuracion = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Sin estas claves no hay proyecto al que conectarse. */
export function hayConfiguracion() {
  return Boolean(
    configuracion.apiKey && configuracion.authDomain && configuracion.appId,
  );
}

/** Firebase se despierta tarde, solo cuando el navegador lo necesita. */
function aplicacion(): FirebaseApp {
  return getApps().length
    ? getApp()
    : initializeApp({
        apiKey: configuracion.apiKey!,
        authDomain: configuracion.authDomain!,
        projectId: configuracion.projectId,
        storageBucket: configuracion.storageBucket,
        messagingSenderId: configuracion.messagingSenderId,
        appId: configuracion.appId!,
      });
}

export function autenticacion(): Auth {
  return getAuth(aplicacion());
}

export function baseDeDatos(): Firestore {
  return getFirestore(aplicacion());
}

export function funciones(): Functions {
  return getFunctions(aplicacion());
}

export function almacenamiento(): FirebaseStorage {
  return getStorage(aplicacion());
}
