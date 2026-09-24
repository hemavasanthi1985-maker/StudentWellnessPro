import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const counsellorName =
    document.getElementById("counsellorName");

const totalRequests =
    document.getElementById("totalRequests");

const pendingRequests =
    document.getElementById("pendingRequests");

const highPriorityRequests =
    document.getElementById("highPriorityRequests");

const resolvedRequests =
    document.getElementById("resolvedRequests");

const requestBody =
    document.getElementById("requestBody");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ================================
   CHECK COUNSELLOR LOGIN
================================ */

onAuthStateChanged(auth, async function (user) {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        const userSnapshot =
            await getDoc(
                doc(db, "users", user.uid)
            );

        if (!userSnapshot.exists()) {

            window.location.href =
                "login.html";

            return;
        }

        const userData =
            userSnapshot.data();

        if (userData.role !== "counsellor") {

            alert("Access denied.");

            window.location.href =
                "../index.html";

            return;
        }

        counsellorName.textContent =
            userData.name || "Counsellor";

        await loadSupportRequests();

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

});


/* ================================
   LOAD SUPPORT REQUESTS
================================ */

async function loadSupportRequests() {

    try {

        const requestsRef =
            collection(db, "supportRequests");

        const snapshot =
            await getDocs(requestsRef);

        let total = 0;
        let pending = 0;
        let highPriority = 0;
        let resolved = 0;

        requestBody.innerHTML = "";


        if (snapshot.empty) {

            requestBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No support requests available.
                    </td>
                </tr>
            `;

        }


        snapshot.forEach(function (requestDoc) {

            const data =
                requestDoc.data();

            const requestId =
                requestDoc.id;


            total++;


            if (data.status === "Pending") {
                pending++;
            }


            if (data.priority === "High") {
                highPriority++;
            }


            if (data.status === "Resolved") {
                resolved++;
            }


            let date =
                "Not available";


            if (data.createdAt) {

                date =
                    data.createdAt
                        .toDate()
                        .toLocaleDateString();

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${date}
                </td>

                <td>
                    ${data.supportType || "Not specified"}
                </td>

                <td>
                    ${data.priority || "Not specified"}
                </td>

                <td>
                    ${data.description || "No description"}
                </td>

                <td>
                    ${data.status || "Pending"}
                </td>

                <td>

                    <button
                        class="view-case-btn"
                        data-id="${requestId}">
                        View Case
                    </button>

                </td>

            `;


            requestBody.appendChild(row);

        });


        totalRequests.textContent =
            total;

        pendingRequests.textContent =
            pending;

        highPriorityRequests.textContent =
            highPriority;

        resolvedRequests.textContent =
            resolved;


        /* ================================
           VIEW CASE BUTTON
        ================================= */

        const viewButtons =
            document.querySelectorAll(
                ".view-case-btn"
            );


        viewButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const requestId =
                        button.getAttribute("data-id");


                    console.log(
                        "Selected Request:",
                        requestId
                    );


                    sessionStorage.setItem(
                        "selectedRequestId",
                        requestId
                    );


                    window.location.href =
                        "case.html";

                }
            );

        });


    } catch (error) {

        console.error(
            "Error loading support requests:",
            error
        );


        requestBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load support requests.
                </td>
            </tr>
        `;

    }

}


/* ================================
   LOGOUT
================================ */

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