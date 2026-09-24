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


const facultyName =
    document.getElementById("facultyName");

const totalReferrals =
    document.getElementById("totalReferrals");

const pendingReferrals =
    document.getElementById("pendingReferrals");

const highPriorityReferrals =
    document.getElementById("highPriorityReferrals");

const resolvedReferrals =
    document.getElementById("resolvedReferrals");

const referralBody =
    document.getElementById("referralBody");

const logoutBtn =
    document.getElementById("logoutBtn");


console.log("Faculty dashboard JavaScript loaded.");



onAuthStateChanged(
    auth,
    async function (user) {

        console.log("Current user:", user);


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            console.log(
                "User profile exists:",
                userSnapshot.exists()
            );


            if (!userSnapshot.exists()) {

                console.error(
                    "Faculty profile not found."
                );

                referralBody.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Faculty profile not found.
                        </td>
                    </tr>
                `;

                return;
            }


            const userData =
                userSnapshot.data();


            console.log(
                "Faculty data:",
                userData
            );


            if (
                userData.role !==
                "faculty"
            ) {

                alert(
                    "Access denied."
                );

                window.location.href =
                    "../index.html";

                return;
            }


            facultyName.textContent =
                userData.name ||
                "Faculty";


            await loadReferrals();


        } catch (error) {

            console.error(
                "FACULTY DASHBOARD ERROR:",
                error
            );


            referralBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Error loading referrals.
                    </td>
                </tr>
            `;

        }

    }
);



async function loadReferrals() {

    console.log(
        "Loading faculty referrals..."
    );


    try {

        const referralsRef =
            collection(
                db,
                "facultyReferrals"
            );


        const snapshot =
            await getDocs(
                referralsRef
            );


        console.log(
            "Referral documents found:",
            snapshot.size
        );


        let total = 0;
        let pending = 0;
        let highPriority = 0;
        let resolved = 0;


        referralBody.innerHTML = "";


        if (snapshot.empty) {

            referralBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No student referrals available.
                    </td>
                </tr>
            `;

        } else {


            snapshot.forEach(
                function (referralDoc) {

                    const data =
                        referralDoc.data();


                    const referralId =
                        referralDoc.id;


                    console.log(
                        "Referral:",
                        referralId,
                        data
                    );


                    total++;


                    if (
                        data.status ===
                        "Pending"
                    ) {

                        pending++;

                    }


                    if (
                        data.priority ===
                        "High"
                    ) {

                        highPriority++;

                    }


                    if (
                        data.status ===
                        "Resolved"
                    ) {

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
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${date}
                        </td>

                        <td>
                            ${data.studentEmail ||
                            "Not available"}
                        </td>

                        <td>
                            ${data.concern ||
                            "No concern provided"}
                        </td>

                        <td>
                            ${data.priority ||
                            "Not specified"}
                        </td>

                        <td>
                            ${data.status ||
                            "Pending"}
                        </td>

                        <td>

                            <button
                                class="view-case-btn"
                                data-id="${referralId}">

                                View Referral

                            </button>

                        </td>

                    `;


                    referralBody.appendChild(
                        row
                    );

                }
            );

        }


        totalReferrals.textContent =
            total;


        pendingReferrals.textContent =
            pending;


        highPriorityReferrals.textContent =
            highPriority;


        resolvedReferrals.textContent =
            resolved;



        const viewButtons =
            document.querySelectorAll(
                ".view-case-btn"
            );


        viewButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const referralId =
                            button.getAttribute(
                                "data-id"
                            );


                        console.log(
                            "Selected Referral:",
                            referralId
                        );


                        sessionStorage.setItem(
                            "selectedReferralId",
                            referralId
                        );


                        window.location.href =
                            "referral.html";

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "ERROR LOADING REFERRALS:",
            error
        );


        referralBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load referrals.
                </td>
            </tr>
        `;

    }

}



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