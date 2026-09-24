import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");


loginForm.addEventListener("submit", async function (event) {

    // Prevent the browser from reloading the page
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";
    message.style.color = "blue";

    try {

        // Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        console.log("Login successful:", user.uid);

        // Get user information from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {

            message.textContent = "User profile not found.";
            message.style.color = "red";

            return;
        }

        const userData = userSnapshot.data();

        console.log("User data:", userData);
        console.log("Role:", userData.role);


        // Student login
        if (userData.role === "student") {

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(function () {

                window.location.href = "dashboard.html";

            }, 500);

        } else {

            message.textContent =
                "This account is not registered as a student.";

            message.style.color = "red";
        }


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        message.style.color = "red";

        if (error.code === "auth/invalid-credential") {

            message.textContent =
                "Incorrect email or password.";

        } else if (error.code === "auth/user-not-found") {

            message.textContent =
                "No account found with this email.";

        } else if (error.code === "auth/wrong-password") {

            message.textContent =
                "Incorrect password.";

        } else {

            message.textContent =
                "Login failed. Check the browser console.";
        }
    }

});