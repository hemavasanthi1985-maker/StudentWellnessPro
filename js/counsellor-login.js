import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const loginForm =
    document.getElementById("counsellorLoginForm");

const message =
    document.getElementById("message");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    message.textContent = "Logging in...";
    message.style.color = "blue";


    try {

        // Firebase Authentication
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Get the current Firebase Authentication UID
        const uid = user.uid;


        console.log("AUTHENTICATION UID:", uid);
        console.log("EMAIL:", user.email);


        // Find the Firestore profile using the same UID
        const userRef =
            doc(db, "users", uid);

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            message.innerHTML =
                "User profile not found.<br><br>" +
                "<strong>Authentication UID:</strong><br>" +
                uid +
                "<br><br>" +
                "Create the Firestore document using this exact UID.";

            message.style.color = "red";

            return;
        }


        const userData =
            userSnapshot.data();


        console.log(
            "FIRESTORE PROFILE:",
            userData
        );


        // Check role
        if (userData.role !== "counsellor") {

            message.textContent =
                "This account is not registered as a counsellor.";

            message.style.color = "red";

            return;
        }


        // Successful login
        message.textContent =
            "Login successful!";

        message.style.color = "green";


        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 500);


    } catch (error) {

        console.error(
            "COUNSELLOR LOGIN ERROR:",
            error
        );


        message.style.color = "red";


        if (error.code === "auth/invalid-credential") {

            message.textContent =
                "Incorrect email or password.";

        } else if (error.code === "auth/invalid-email") {

            message.textContent =
                "Please enter a valid email address.";

        } else if (error.code === "auth/user-disabled") {

            message.textContent =
                "This account has been disabled.";

        } else if (error.code === "auth/too-many-requests") {

            message.textContent =
                "Too many login attempts. Please try again later.";

        } else {

            message.textContent =
                "Login failed: " + error.message;

        }

    }

});