// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCX-W5VrB8a3jHDmm-R1Slsi1jkOrSeSHk",
  authDomain: "sightform-fill.firebaseapp.com",
  projectId: "sightform-fill",
  storageBucket: "sightform-fill.firebasestorage.app",
  messagingSenderId: "283310643499",
  appId: "1:283310643499:web:60841e0778110b32c6cd6e",
  measurementId: "G-DCCDHVLNE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);