import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const studentEmail =
    document.getElementById("studentEmail");

const concernType =
    document.getElementById("concernType");

const priority =
    document.getElementById("priority");

const createdDate =
    document.getElementById("createdDate");

const concern =
    document.getElementById("concern");

const referralStatus =
    document.getElementById("referralStatus");

const facultyNotes =
    document.getElementById("facultyNotes");

const saveReferralBtn =
    document.getElementById("saveReferralBtn");

const backBtn =
    document.getElementById("backBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const referralMessage =
    document.getElementById("referralMessage");


const referralId =
    sessionStorage.getItem(
        "selectedReferralId"
    );


console.log(
    "Selected Referral ID:",
    referralId
);



onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            const userSnapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (!userSnapshot.exists()) {

                referralMessage.textContent =
                    "Faculty profile not found.";

                referralMessage.style.color =
                    "red";

                return;
            }


            const userData =
                userSnapshot.data();


            if (
                userData.role !==
                "faculty"
            ) {

                referralMessage.textContent =
                    "Access denied. Faculty account required.";

                referralMessage.style.color =
                    "red";

                return;
            }


            if (!referralId) {

                referralMessage.textContent =
                    "No referral selected. Please return to the dashboard and click View Referral.";

                referralMessage.style.color =
                    "red";

                return;
            }


            await loadReferral();


        } catch (error) {

            console.error(
                "REFERRAL PAGE ERROR:",
                error
            );


            referralMessage.textContent =
                "Error loading referral: " +
                error.message;

            referralMessage.style.color =
                "red";

        }

    }
);



async function loadReferral() {

    console.log(
        "Loading referral:",
        referralId
    );


    const referralRef =
        doc(
            db,
            "facultyReferrals",
            referralId
        );


    const referralSnapshot =
        await getDoc(
            referralRef
        );


    if (
        !referralSnapshot.exists()
    ) {

        referralMessage.textContent =
            "Student referral not found.";

        referralMessage.style.color =
            "red";

        return;
    }


    const data =
        referralSnapshot.data();


    console.log(
        "Referral data:",
        data
    );


    studentEmail.textContent =
        data.studentEmail ||
        "Not available";


    concernType.textContent =
        data.concernType ||
        "Academic Concern";


    priority.textContent =
        data.priority ||
        "Not specified";


    concern.textContent =
        data.concern ||
        "No concern provided.";


    if (data.createdAt) {

        createdDate.textContent =
            data.createdAt
                .toDate()
                .toLocaleString();

    } else {

        createdDate.textContent =
            "Not available";

    }


    referralStatus.value =
        data.status ||
        "Pending";


    facultyNotes.value =
        data.facultyNotes ||
        "";

}



saveReferralBtn.addEventListener(
    "click",
    async function () {

        if (!referralId) {

            referralMessage.textContent =
                "No referral selected.";

            referralMessage.style.color =
                "red";

            return;
        }


        const status =
            referralStatus.value;


        const notes =
            facultyNotes.value.trim();


        referralMessage.textContent =
            "Saving referral...";

        referralMessage.style.color =
            "blue";


        try {

            const user =
                auth.currentUser;


            if (!user) {

                throw new Error(
                    "Faculty is not logged in."
                );

            }


            const referralRef =
                doc(
                    db,
                    "facultyReferrals",
                    referralId
                );


            const referralSnapshot =
                await getDoc(
                    referralRef
                );


            if (
                !referralSnapshot.exists()
            ) {

                throw new Error(
                    "Referral no longer exists."
                );

            }


            await setDoc(
                referralRef,
                {

                    status:
                        status,

                    facultyId:
                        user.uid,

                    facultyNotes:
                        notes,

                    updatedAt:
                        serverTimestamp()

                },
                {
                    merge: true
                }
            );


            referralMessage.textContent =
                "Referral saved successfully.";

            referralMessage.style.color =
                "green";


            console.log(
                "Referral updated successfully."
            );


        } catch (error) {

            console.error(
                "SAVE REFERRAL ERROR:",
                error
            );


            referralMessage.textContent =
                "Unable to save referral: " +
                error.message;

            referralMessage.style.color =
                "red";

        }

    }
);



backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);



logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

            sessionStorage.removeItem(
                "selectedReferralId"
            );

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);