import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const assessmentForm =
    document.getElementById("assessmentForm");

const message =
    document.getElementById("assessmentMessage");

let currentUser = null;

onAuthStateChanged(auth, function (user) {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
});


assessmentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        if (!currentUser) {
            message.textContent =
                "Please login first.";

            message.style.color = "red";
            return;
        }

        const stress =
            Number(document.getElementById("stress").value);

        const sleep =
            Number(document.getElementById("sleep").value);

        const academic =
            Number(document.getElementById("academic").value);

        const mood =
            Number(document.getElementById("mood").value);

        const social =
            Number(document.getElementById("social").value);

        const energy =
            Number(document.getElementById("energy").value);


        // Convert negative factors
        // so higher score always means better wellness

        const stressScore = 6 - stress;

        const academicScore = 6 - academic;


        const totalScore =
            stressScore +
            sleep +
            academicScore +
            mood +
            social +
            energy;


        const wellnessScore =
            Math.round((totalScore / 30) * 100);


        let riskLevel;

        if (wellnessScore >= 70) {

            riskLevel = "Low Risk";

        } else if (wellnessScore >= 45) {

            riskLevel = "Moderate Risk";

        } else {

            riskLevel = "High Risk";
        }


        let recommendations = [];


        // Stress recommendation

        if (stress >= 4) {

            recommendations.push(
                "Consider relaxation activities such as deep breathing, meditation or short breaks."
            );
        }


        // Sleep recommendation

        if (sleep <= 2) {

            recommendations.push(
                "Try maintaining a regular sleep schedule and getting adequate rest."
            );
        }


        // Academic pressure recommendation

        if (academic >= 4) {

            recommendations.push(
                "Consider planning your academic workload and discussing difficulties with a faculty member."
            );
        }


        // Mood recommendation

        if (mood <= 2) {

            recommendations.push(
                "Consider talking to someone you trust or requesting counselling support."
            );
        }


        // Social recommendation

        if (social <= 2) {

            recommendations.push(
                "Try connecting with friends, classmates or other supportive people."
            );
        }


        // Energy recommendation

        if (energy <= 2) {

            recommendations.push(
                "Take regular breaks and maintain healthy daily routines."
            );
        }


        // High-risk recommendation

        if (wellnessScore < 45) {

            recommendations.push(
                "Your assessment indicates that additional support may be helpful. Consider contacting a counsellor."
            );
        }


        // Default recommendation

        if (recommendations.length === 0) {

            recommendations.push(
                "Continue maintaining healthy habits and regularly monitor your wellbeing."
            );
        }


        try {

            await addDoc(
                collection(db, "assessments"),
                {

                    studentId: currentUser.uid,

                    stress: stress,

                    sleep: sleep,

                    academic: academic,

                    mood: mood,

                    social: social,

                    energy: energy,

                    wellnessScore: wellnessScore,

                    riskLevel: riskLevel,

                    recommendations: recommendations,

                    createdAt: serverTimestamp()
                }
            );


            message.style.color = "green";

            message.textContent =
                "Assessment submitted successfully! Your wellness score is "
                + wellnessScore
                + "/100";


            sessionStorage.setItem(
                "wellnessScore",
                wellnessScore
            );

            sessionStorage.setItem(
                "riskLevel",
                riskLevel
            );

            sessionStorage.setItem(
                "recommendations",
                JSON.stringify(recommendations)
            );


            setTimeout(function () {

                window.location.href =
                    "result.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Assessment error:",
                error
            );

            message.style.color = "red";

            message.textContent =
                "Unable to save assessment. Please try again.";
        }

    }
);