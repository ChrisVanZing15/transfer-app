import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDliJJpYY-cdHwXAjTV700K7GBkBLia9fg",
  authDomain: "transfer-planner.firebaseapp.com",
  projectId: "transfer-planner",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
