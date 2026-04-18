import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDliJJpYY-cdHwXAjTV700K7GBkBLia9fg",
  authDomain: "transfer-planner.firebaseapp.com",
  projectId: "transfer-planner",
  storageBucket: "transfer-planner.firebasestorage.app",
  messagingSenderId: "870407962646",
  appId: "1:870407962646:web:ae3d01473b276046c03537",
  measurementId: "G-B5G5D7DHH0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
