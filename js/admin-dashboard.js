import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ==========================================
// GLOBAL USER DATA
// ==========================================

let allUsers = [];


// ==========================================
// AUTHENTICATION
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(userRef);


        if (!userSnap.exists()) {

            alert("Administrator profile not found.");

            await signOut(auth);

            window.location.href = "login.html";

            return;
        }


        const userData = userSnap.data();


        if (userData.role !== "administrator") {

            alert("Access denied. Administrator account required.");

            await signOut(auth);

            window.location.href = "login.html";

            return;
        }


        // Load dashboard data

        await loadUserStatistics();

        await loadSupportStatistics();

        await loadRecentRequests();

        await loadUsers();


    } catch (error) {

        console.error(
            "Administrator dashboard error:",
            error
        );

    }

});


// ==========================================
// LOAD USER STATISTICS
// ==========================================

async function loadUserStatistics() {

    try {

        const usersSnapshot = await getDocs(
            collection(db, "users")
        );


        let students = 0;

        let counsellors = 0;

        let faculty = 0;


        usersSnapshot.forEach((userDoc) => {

            const data = userDoc.data();

            const role = data.role;


            if (role === "student") {

                students++;

            } else if (role === "counsellor") {

                counsellors++;

            } else if (role === "faculty") {

                faculty++;

            }

        });


        document.getElementById(
            "studentCount"
        ).textContent = students;


        document.getElementById(
            "counsellorCount"
        ).textContent = counsellors;


        document.getElementById(
            "facultyCount"
        ).textContent = faculty;


    } catch (error) {

        console.error(
            "Error loading user statistics:",
            error
        );

    }

}


// ==========================================
// LOAD SUPPORT STATISTICS
// ==========================================

async function loadSupportStatistics() {

    try {

        const snapshot = await getDocs(
            collection(db, "supportRequests")
        );


        let total = 0;

        let pending = 0;

        let highPriority = 0;

        let inProgress = 0;

        let resolved = 0;


        snapshot.forEach((requestDoc) => {

            const data = requestDoc.data();


            total++;


            const status =
                String(data.status || "")
                    .trim()
                    .toLowerCase();


            const priority =
                String(data.priority || "")
                    .trim()
                    .toLowerCase();


            if (status === "pending") {

                pending++;

            }


            if (status === "in progress") {

                inProgress++;

            }


            if (status === "resolved") {

                resolved++;

            }


            if (priority === "high") {

                highPriority++;

            }

        });


        document.getElementById(
            "requestCount"
        ).textContent = total;


        document.getElementById(
            "pendingCount"
        ).textContent = pending;


        document.getElementById(
            "highPriorityCount"
        ).textContent = highPriority;


        document.getElementById(
            "inProgressCount"
        ).textContent = inProgress;


        document.getElementById(
            "resolvedCount"
        ).textContent = resolved;


    } catch (error) {

        console.error(
            "Error loading support statistics:",
            error
        );

    }

}


// ==========================================
// LOAD RECENT SUPPORT REQUESTS
// ==========================================

async function loadRecentRequests() {

    const tableBody =
        document.getElementById(
            "adminRequestTableBody"
        );


    try {

        const snapshot = await getDocs(
            collection(db, "supportRequests")
        );


        let requests = [];


        snapshot.forEach((requestDoc) => {

            const data = requestDoc.data();


            requests.push({

                id: requestDoc.id,

                ...data

            });

        });


        // Sort newest first

        requests.sort((a, b) => {

            const dateA =
                a.createdAt?.toDate
                    ? a.createdAt.toDate()
                    : new Date(0);


            const dateB =
                b.createdAt?.toDate
                    ? b.createdAt.toDate()
                    : new Date(0);


            return dateB - dateA;

        });


        // Show maximum 10 recent requests

        requests =
            requests.slice(0, 10);


        tableBody.innerHTML = "";


        if (requests.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No support requests found.
                    </td>
                </tr>
            `;

            return;
        }


        requests.forEach((request) => {

            const row =
                document.createElement("tr");


            let dateText = "-";


            if (request.createdAt?.toDate) {

                dateText =
                    request.createdAt
                        .toDate()
                        .toLocaleDateString();

            }


            row.innerHTML = `

                <td>
                    ${dateText}
                </td>

                <td>
                    ${request.studentEmail || "-"}
                </td>

                <td>
                    ${request.supportType || "-"}
                </td>

                <td>
                    ${request.priority || "-"}
                </td>

                <td>
                    ${request.status || "-"}
                </td>

            `;


            tableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Error loading support requests:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load support requests.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// LOAD ALL USERS
// ==========================================

async function loadUsers() {

    const tableBody =
        document.getElementById(
            "userTableBody"
        );


    try {

        const snapshot = await getDocs(
            collection(db, "users")
        );


        allUsers = [];


        snapshot.forEach((userDoc) => {

            const data = userDoc.data();


            allUsers.push({

                id: userDoc.id,

                name: data.name || "-",

                email: data.email || "-",

                role: data.role || "-",

                department:
                    data.department || "-",

                createdAt:
                    data.createdAt || null

            });

        });


        // Sort alphabetically by name

        allUsers.sort((a, b) => {

            return a.name
                .toLowerCase()
                .localeCompare(
                    b.name.toLowerCase()
                );

        });


        displayUsers(allUsers);


    } catch (error) {

        console.error(
            "Error loading users:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load users.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// DISPLAY USERS
// ==========================================

function displayUsers(users) {

    const tableBody =
        document.getElementById(
            "userTableBody"
        );


    tableBody.innerHTML = "";


    if (users.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    users.forEach((user) => {

        const row =
            document.createElement("tr");


        let createdDate = "-";


        if (user.createdAt?.toDate) {

            createdDate =
                user.createdAt
                    .toDate()
                    .toLocaleDateString();

        }


        row.innerHTML = `

            <td>
                ${user.name}
            </td>

            <td>
                ${user.email}
            </td>

            <td>
                ${formatRole(user.role)}
            </td>

            <td>
                ${user.department}
            </td>

            <td>
                ${createdDate}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ==========================================
// FORMAT ROLE
// ==========================================

function formatRole(role) {

    if (!role) {

        return "-";

    }


    if (role === "administrator") {

        return "Administrator";

    }


    if (role === "counsellor") {

        return "Counsellor";

    }


    if (role === "faculty") {

        return "Faculty";

    }


    if (role === "student") {

        return "Student";

    }


    return role;

}


// ==========================================
// SEARCH USERS
// ==========================================

document
    .getElementById("userSearch")
    .addEventListener(
        "input",
        filterUsers
    );


// ==========================================
// ROLE FILTER
// ==========================================

document
    .getElementById("roleFilter")
    .addEventListener(
        "change",
        filterUsers
    );


// ==========================================
// FILTER USERS
// ==========================================

function filterUsers() {

    const searchInput =
        document.getElementById(
            "userSearch"
        ).value
        .trim()
        .toLowerCase();


    const selectedRole =
        document.getElementById(
            "roleFilter"
        ).value;


    const filteredUsers =
        allUsers.filter((user) => {


            const matchesSearch =

                user.name
                    .toLowerCase()
                    .includes(searchInput)

                ||

                user.email
                    .toLowerCase()
                    .includes(searchInput);


            const matchesRole =

                selectedRole === "all"

                ||

                user.role === selectedRole;


            return (
                matchesSearch &&
                matchesRole
            );

        });


    displayUsers(filteredUsers);

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

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