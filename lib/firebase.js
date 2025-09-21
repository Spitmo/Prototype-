// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhZ_58L-XRXOZ8TKMkq8TdWsDo_GcxQ6A",
  authDomain: "prototype-41cf8.firebaseapp.com",
  projectId: "prototype-41cf8",
  storageBucket: "prototype-41cf8.appspot.com", 
  messagingSenderId: "616062179431",
  appId: "1:616062179431:web:255dad243da07f3d575cc2",
  measurementId: "G-2V1F8PPMY2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
