import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


/* =================================
   GET HTML ELEMENTS
================================= */

const studentEmail =
    document.getElementById("studentEmail");

const supportType =
    document.getElementById("supportType");

const priority =
    document.getElementById("priority");

const createdDate =
    document.getElementById("createdDate");

const description =
    document.getElementById("description");

const caseStatus =
    document.getElementById("caseStatus");

const followUpDate =
    document.getElementById("followUpDate");

const counsellingNotes =
    document.getElementById("counsellingNotes");

const saveCaseBtn =
    document.getElementById("saveCaseBtn");

const backBtn =
    document.getElementById("backBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const caseMessage =
    document.getElementById("caseMessage");


/* =================================
   GET SELECTED REQUEST ID
================================= */

const requestId =
    sessionStorage.getItem("selectedRequestId");


console.log(
    "Selected Request ID:",
    requestId
);


/* =================================
   CHECK LOGIN
================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        console.log(
            "Current user:",
            user
        );


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            /* Get counsellor profile */

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            console.log(
                "User profile:",
                userSnapshot.exists()
                    ? userSnapshot.data()
                    : "Not found"
            );


            if (!userSnapshot.exists()) {

                caseMessage.textContent =
                    "Counsellor profile not found.";

                caseMessage.style.color =
                    "red";

                return;
            }


            const userData =
                userSnapshot.data();


            /* Check role */

            if (
                userData.role !==
                "counsellor"
            ) {

                caseMessage.textContent =
                    "Access denied. Counsellor account required.";

                caseMessage.style.color =
                    "red";

                return;
            }


            /* Check request ID */

            if (!requestId) {

                caseMessage.textContent =
                    "No support request selected. Please return to the dashboard and click View Case.";

                caseMessage.style.color =
                    "red";

                return;
            }


            /* Load support request */

            await loadRequest();


        } catch (error) {

            console.error(
                "CASE PAGE ERROR:",
                error
            );


            caseMessage.textContent =
                "Error loading case: " +
                error.message;

            caseMessage.style.color =
                "red";
        }

    }
);


/* =================================
   LOAD SUPPORT REQUEST
================================= */

async function loadRequest() {

    console.log(
        "Loading request:",
        requestId
    );


    const requestRef =
        doc(
            db,
            "supportRequests",
            requestId
        );


    const requestSnapshot =
        await getDoc(requestRef);


    console.log(
        "Request exists:",
        requestSnapshot.exists()
    );


    if (!requestSnapshot.exists()) {

        caseMessage.textContent =
            "Support request not found.";

        caseMessage.style.color =
            "red";

        return;
    }


    const data =
        requestSnapshot.data();


    console.log(
        "Support request data:",
        data
    );


    /* =================================
       DISPLAY REQUEST DATA
    ================================= */

    studentEmail.textContent =
        data.studentEmail ||
        "Not available";


    supportType.textContent =
        data.supportType ||
        "Not specified";


    priority.textContent =
        data.priority ||
        "Not specified";


    description.textContent =
        data.description ||
        "No description provided.";


    /* Date */

    if (data.createdAt) {

        createdDate.textContent =
            data.createdAt
                .toDate()
                .toLocaleString();

    } else {

        createdDate.textContent =
            "Not available";

    }


    /* Status */

    caseStatus.value =
        data.status ||
        "Pending";


    /* Load existing counselling case */

    await loadExistingCase();

}


/* =================================
   LOAD EXISTING CASE
================================= */

async function loadExistingCase() {

    try {

        const caseRef =
            doc(
                db,
                "counsellingCases",
                requestId
            );


        const caseSnapshot =
            await getDoc(caseRef);


        console.log(
            "Existing case:",
            caseSnapshot.exists()
        );


        if (!caseSnapshot.exists()) {

            return;
        }


        const caseData =
            caseSnapshot.data();


        if (caseData.status) {

            caseStatus.value =
                caseData.status;

        }


        if (caseData.followUpDate) {

            followUpDate.value =
                caseData.followUpDate;

        }


        if (caseData.counsellingNotes) {

            counsellingNotes.value =
                caseData.counsellingNotes;

        }


    } catch (error) {

        console.error(
            "Error loading existing case:",
            error
        );

    }

}


/* =================================
   SAVE CASE
================================= */

saveCaseBtn.addEventListener(
    "click",
    async function () {

        console.log(
            "Save Case clicked"
        );


        if (!requestId) {

            caseMessage.textContent =
                "No support request selected.";

            caseMessage.style.color =
                "red";

            return;
        }


        const status =
            caseStatus.value;


        const followUp =
            followUpDate.value;


        const notes =
            counsellingNotes.value.trim();


        caseMessage.textContent =
            "Saving case...";

        caseMessage.style.color =
            "blue";


        try {

            /* =================================
               GET CURRENT COUNSELLOR
            ================================= */

            const user =
                auth.currentUser;


            if (!user) {

                throw new Error(
                    "Counsellor is not logged in."
                );

            }


            /* =================================
               GET REQUEST
            ================================= */

            const requestRef =
                doc(
                    db,
                    "supportRequests",
                    requestId
                );


            const requestSnapshot =
                await getDoc(requestRef);


            if (!requestSnapshot.exists()) {

                throw new Error(
                    "Support request no longer exists."
                );

            }


            const requestData =
                requestSnapshot.data();


            /* =================================
               SAVE COUNSELLING CASE
            ================================= */

            const caseRef =
                doc(
                    db,
                    "counsellingCases",
                    requestId
                );


            await setDoc(
                caseRef,
                {

                    supportRequestId:
                        requestId,

                    studentId:
                        requestData.studentId,

                    studentEmail:
                        requestData.studentEmail,

                    counsellorId:
                        user.uid,

                    supportType:
                        requestData.supportType,

                    priority:
                        requestData.priority,

                    status:
                        status,

                    counsellingNotes:
                        notes,

                    followUpDate:
                        followUp,

                    updatedAt:
                        serverTimestamp()

                },
                {
                    merge: true
                }
            );


            /* =================================
               UPDATE SUPPORT REQUEST
            ================================= */

            await updateDoc(
                requestRef,
                {

                    status:
                        status,

                    assignedCounsellorId:
                        user.uid,

                    updatedAt:
                        serverTimestamp()

                }
            );


            caseMessage.textContent =
                "Case saved successfully.";

            caseMessage.style.color =
                "green";


            console.log(
                "Case saved successfully."
            );


        } catch (error) {

            console.error(
                "SAVE CASE ERROR:",
                error
            );


            caseMessage.textContent =
                "Unable to save case: " +
                error.message;

            caseMessage.style.color =
                "red";

        }

    }
);


/* =================================
   BACK BUTTON
================================= */

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);


/* =================================
   LOGOUT
================================= */

logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

            sessionStorage.removeItem(
                "selectedRequestId"
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