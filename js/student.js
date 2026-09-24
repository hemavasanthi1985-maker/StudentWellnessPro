import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const studentName = document.getElementById("studentName");
const logoutBtn = document.getElementById("logoutBtn");


onAuthStateChanged(auth, async function (user) {

    // If user is not logged in
    if (!user) {

        window.location.href = "login.html";
        return;
    }


    try {

        // Get student information
        const userDoc =
            await getDoc(doc(db, "users", user.uid));


        if (userDoc.exists()) {

            const data = userDoc.data();

            studentName.textContent =
                data.name || "Student";

        } else {

            studentName.textContent = "Student";
        }


    } catch (error) {

        console.error(
            "Error loading student data:",
            error
        );
    }

});


// Logout
logoutBtn.addEventListener("click", async function () {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );
    }

});