import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByYLDBPLdFlUZvz5IKC6_oiLiS60eKYmw",
  authDomain: "we-connect-now.firebaseapp.com",
  projectId: "we-connect-now",
  storageBucket: "we-connect-now.firebasestorage.app",
  messagingSenderId: "947607466255",
  appId: "1:947607466255:web:10576b2372d2a6640e0e7a",
  measurementId: "G-HZYHR74Q8C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
