import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPU3nc6GRbd_vcsNLm1olIu_cCBXM6eac",
  authDomain: "mylifeos-proxy-viswam-777.firebaseapp.com",
  projectId: "mylifeos-proxy-viswam-777",
  storageBucket: "mylifeos-proxy-viswam-777.firebasestorage.app",
  messagingSenderId: "691965598458",
  appId: "1:691965598458:web:2c2568eb01bf8905e64743"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
