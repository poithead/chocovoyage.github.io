let consentGiven = false; // Initialize variable to track if consent is given

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
        consentGiven = true; // Set consentGiven to true
        localStorage.setItem("cookieConsent", true); // Save consent in localStorage
        loadScripts(); // Load scripts since consent is given
        cookieBanner.style.display = "none"; // Hide the cookie banner
    });

    // Decline Button
    declineButton.addEventListener("click", () => {
        console.log("User clicked Decline");
        consentGiven = false; // Set consentGiven to false
        localStorage.setItem("cookieConsent", false); // Save decline in localStorage
        cookieBanner.style.display = "none"; // Just hide the cookie banner
    });
   
});
