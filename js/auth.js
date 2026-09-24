import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const registerForm = document.getElementById("registerForm");


registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value;
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message = document.getElementById("message");


    // Check passwords
    if (password !== confirmPassword) {

        message.textContent = "Passwords do not match.";
        message.style.color = "red";

        return;
    }


    // Check password length
    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.style.color = "red";

        return;
    }


    try {

        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {

            name: name,
            email: email,
            role: "student",
            department: department,
            createdAt: serverTimestamp()

        });


        message.textContent =
            "Registration successful!";

        message.style.color = "green";


        // Clear form
        registerForm.reset();


        // Redirect after 2 seconds
        setTimeout(function () {

            window.location.href = "login.html";

        }, 2000);


    } catch (error) {

        console.error(error);

        message.style.color = "red";


        if (error.code === "auth/email-already-in-use") {

            message.textContent =
                "This email is already registered.";

        } else if (error.code === "auth/invalid-email") {

            message.textContent =
                "Please enter a valid email address.";

        } else if (error.code === "auth/weak-password") {

            message.textContent =
                "Password is too weak.";

        } else {

            message.textContent =
                "Registration failed: " + error.message;
        }
    }

});