import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = { 
  apiKey: "AIzaSyB65LTTfgvKkUO2LM7EbB5dJDSbB10kka8",
  authDomain: "didi-delight.firebaseapp.com",
  projectId: "didi-delight",
  storageBucket: "didi-delight.firebasestorage.app",
  messagingSenderId: "747650559227",
  appId: "1:747650559227:web:c966d7d1be3dadbb39d45e",
  measurementId: "G-WVTPK4FV5S",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app