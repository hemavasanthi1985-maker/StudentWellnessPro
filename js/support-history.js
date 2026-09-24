import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";


const supportBody =
    document.getElementById("supportBody");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =================================
   CHECK STUDENT LOGIN
================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            const requestsRef =
                collection(
                    db,
                    "supportRequests"
                );


            const requestsQuery =
                query(
                    requestsRef,
                    where(
                        "studentId",
                        "==",
                        user.uid
                    ),
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            const snapshot =
                await getDocs(
                    requestsQuery
                );


            supportBody.innerHTML = "";


            /* =================================
               NO REQUESTS
            ================================= */

            if (snapshot.empty) {

                supportBody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No support requests found.
                        </td>
                    </tr>
                `;

                return;
            }


            /* =================================
               DISPLAY REQUESTS
            ================================= */

            snapshot.forEach(
                function (requestDoc) {

                    const data =
                        requestDoc.data();


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
                            ${data.supportType ||
                            "Not specified"}
                        </td>

                        <td>
                            ${data.priority ||
                            "Not specified"}
                        </td>

                        <td>
                            ${data.description ||
                            "No description"}
                        </td>

                        <td>
                            <strong>
                                ${data.status ||
                                "Pending"}
                            </strong>
                        </td>

                    `;


                    supportBody.appendChild(row);

                }
            );


        } catch (error) {

            console.error(
                "Error loading support requests:",
                error
            );


            supportBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Unable to load support requests.
                    </td>
                </tr>
            `;

        }

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