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


const historyBody =
    document.getElementById("historyBody");

const logoutBtn =
    document.getElementById("logoutBtn");


onAuthStateChanged(auth, async function (user) {

    if (!user) {

        window.location.href = "login.html";
        return;
    }


    try {

        const assessmentsRef =
            collection(db, "assessments");


        const assessmentQuery = query(
            assessmentsRef,
            where("studentId", "==", user.uid),
            orderBy("createdAt", "desc")
        );


        const snapshot =
            await getDocs(assessmentQuery);


        historyBody.innerHTML = "";


        if (snapshot.empty) {

            historyBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        No assessment history available.
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach(function (doc) {

            const data = doc.data();


            let date = "Not available";


            if (data.createdAt) {

                date =
                    data.createdAt
                        .toDate()
                        .toLocaleDateString();
            }


            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${date}</td>

                <td>
                    <strong>
                        ${data.wellnessScore}/100
                    </strong>
                </td>

                <td>
                    ${data.riskLevel}
                </td>

                <td>
                    ${data.stress}
                </td>

                <td>
                    ${data.sleep}
                </td>

                <td>
                    ${data.academic}
                </td>

                <td>
                    ${data.mood}
                </td>

                <td>
                    ${data.social}
                </td>

                <td>
                    ${data.energy}
                </td>
            `;


            historyBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading history:",
            error
        );


        historyBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Unable to load assessment history.
                </td>
            </tr>
        `;
    }

});


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