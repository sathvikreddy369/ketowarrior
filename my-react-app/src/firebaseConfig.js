// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { updatePassword, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBU7_XSpBDPmroTPCDpBV8-XyCmzPSpEp8",
  authDomain: "blackpanther-2ee05.firebaseapp.com",
  projectId: "blackpanther-2ee05",
  storageBucket: "blackpanther-2ee05.firebasestorage.app",
  messagingSenderId: "955207509801",
  appId: "1:955207509801:web:f34965a97258fe34627938"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { updatePassword, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider };