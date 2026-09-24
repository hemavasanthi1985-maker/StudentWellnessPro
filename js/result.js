const scoreElement = document.getElementById("score");
const riskElement = document.getElementById("risk");
const recommendationsElement =
    document.getElementById("recommendations");


const score = sessionStorage.getItem("wellnessScore");
const risk = sessionStorage.getItem("riskLevel");
const recommendations =
    JSON.parse(
        sessionStorage.getItem("recommendations")
    );


if (score) {

    scoreElement.textContent = score;

} else {

    scoreElement.textContent = "--";
}


if (risk) {

    riskElement.textContent = risk;

} else {

    riskElement.textContent = "No result available";
}


if (recommendations && recommendations.length > 0) {

    recommendations.forEach(function (recommendation) {

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            "• " + recommendation;

        paragraph.style.marginBottom = "12px";

        recommendationsElement.appendChild(
            paragraph
        );

    });

} else {

    recommendationsElement.innerHTML =
        "<p>No recommendations available.</p>";
}