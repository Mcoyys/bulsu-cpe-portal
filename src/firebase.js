import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import { getStorage } from "firebase/storage"; // 🚀 NEW: Added Storage for image uploads

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEYnLJ0ueYZaq8otCoZKNGDtz1MWbSmc0",
  authDomain: "bulsu-portal-91a82.firebaseapp.com",
  projectId: "bulsu-portal-91a82",
  storageBucket: "bulsu-portal-91a82.firebasestorage.app",
  messagingSenderId: "614521342977",
  appId: "1:614521342977:web:c171d905bd1b2e1c23c400"
};

// 1. Initialize Firebase and EXPORT it
export const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore (Database) and EXPORT it
export const db = getFirestore(app);

// 3. Initialize Auth and EXPORT it
export const auth = getAuth(app);

// 4. Initialize Storage and EXPORT it
export const storage = getStorage(app); // 🚀 NEW: Exported so Profile.jsx can use it