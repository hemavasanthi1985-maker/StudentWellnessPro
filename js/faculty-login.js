import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const loginForm =
    document.getElementById("facultyLoginForm");

const message =
    document.getElementById("message");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim();


        const password =
            document.getElementById("password")
                .value;


        message.textContent =
            "Logging in...";

        message.style.color =
            "blue";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Faculty login successful"
            );

            console.log(
                "User UID:",
                user.uid
            );


            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                message.textContent =
                    "User profile not found.";

                message.style.color =
                    "red";

                return;
            }


            const userData =
                userSnapshot.data();


            console.log(
                "Faculty profile:",
                userData
            );


            if (
                userData.role !==
                "faculty"
            ) {

                message.textContent =
                    "This account is not registered as faculty.";

                message.style.color =
                    "red";

                return;
            }


            message.textContent =
                "Login successful!";

            message.style.color =
                "green";


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                500
            );


        } catch (error) {

            console.error(
                "FACULTY LOGIN ERROR:",
                error
            );


            message.style.color =
                "red";


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message.textContent =
                    "Incorrect email or password.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "Please enter a valid email address.";

            } else if (
                error.code ===
                "auth/user-disabled"
            ) {

                message.textContent =
                    "This account has been disabled.";

            } else {

                message.textContent =
                    "Login failed. Please try again.";

            }

        }

    }
);