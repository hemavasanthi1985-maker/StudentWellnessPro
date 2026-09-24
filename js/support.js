import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const supportForm =
    document.getElementById("supportForm");

const supportMessage =
    document.getElementById("supportMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


let currentUser = null;


// Check login status
onAuthStateChanged(auth, function (user) {

    if (!user) {

        window.location.href = "login.html";
        return;
    }

    currentUser = user;

});


// Submit support request
supportForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!currentUser) {

            supportMessage.textContent =
                "Please login first.";

            supportMessage.style.color = "red";

            return;
        }


        const supportType =
            document.getElementById("supportType").value;

        const priority =
            document.getElementById("priority").value;

        const description =
            document.getElementById("description").value.trim();


        if (!supportType ||
            !priority ||
            !description) {

            supportMessage.textContent =
                "Please fill in all fields.";

            supportMessage.style.color = "red";

            return;
        }


        try {

            await addDoc(
                collection(db, "supportRequests"),
                {

                    studentId: currentUser.uid,

                    studentEmail: currentUser.email,

                    supportType: supportType,

                    priority: priority,

                    description: description,

                    status: "Pending",

                    createdAt: serverTimestamp()

                }
            );


            supportMessage.textContent =
                "Support request submitted successfully.";

            supportMessage.style.color = "green";


            supportForm.reset();


        } catch (error) {

            console.error(
                "Support request error:",
                error
            );

            supportMessage.textContent =
                "Unable to submit your request. Please try again.";

            supportMessage.style.color = "red";

        }

    }
);


// Logout
logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        }

    }
);