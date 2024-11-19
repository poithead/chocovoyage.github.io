document.addEventListener("DOMContentLoaded", () => {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptButton = document.getElementById("accept-all");
    const declineButton = document.getElementById("decline-all"); // Rename to "Decline"

    // Check if the user has already made a decision
    const userConsent = JSON.parse(localStorage.getItem("cookieConsent")) || null;
    if (userConsent !== null) {
        // Hide the cookie banner if consent has already been given or declined
        cookieBanner.style.display = "none";
    }

    // Accept All Button (Now "Accept")
    acceptButton.addEventListener("click", () => {
        console.log("User clicked Accept");
        localStorage.setItem("cookieConsent", true); // Save consent in localStorage
        consentGiven = true; // Set consentGiven to true
        loadScripts(); // Load scripts since consent is given
        cookieBanner.style.display = "none"; // Hide the cookie banner
    });

    // Decline Button
    declineButton.addEventListener("click", () => {
        console.log("User clicked Decline");
        localStorage.setItem("cookieConsent", false); // Save decline in localStorage
        consentGiven = false; // Set consentGiven to false
        cookieBanner.style.display = "none"; // Just hide the cookie banner
    });
   
});
