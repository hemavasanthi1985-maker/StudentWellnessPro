// Firebase App
import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Firebase Firestore
import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {

    apiKey: "AIzaSyCF5H3d3my19mDuWQ1XNLDsBEeK1liZKCE",

    authDomain:
        "student-wellness-project-13924.firebaseapp.com",

    projectId:
        "student-wellness-project-13924",

    storageBucket:
        "student-wellness-project-13924.firebasestorage.app",

    messagingSenderId:
        "404548138413",

    appId:
        "1:404548138413:web:f4f8d687488ded566c5d24"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Authentication
const auth = getAuth(app);


// Initialize Firestore
const db = getFirestore(app);


// Export Firebase services
export { auth, db };