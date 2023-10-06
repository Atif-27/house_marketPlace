// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYa3a25UryuH43jq7NHHtpsdTdwbp3xfM",
  authDomain: "house-marketplace-3ef19.firebaseapp.com",
  projectId: "house-marketplace-3ef19",
  storageBucket: "house-marketplace-3ef19.appspot.com",
  messagingSenderId: "143741697589",
  appId: "1:143741697589:web:34f91d5ed0dd2a91ee7b7c"
};

// Initialize Firebase
initializeApp(firebaseConfig)

export const db = getFirestore()