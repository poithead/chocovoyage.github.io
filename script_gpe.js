let consentGiven = false; // Initialize variable to track if consent is given

document.addEventListener("DOMContentLoaded", () => {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptButton = document.getElementById("accept-all");
    const declineButton = document.getElementById("manage-cookies"); // Rename to "Decline"

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

    // Function to load scripts based on consent
    function loadScripts() {
        // Load the script only if consentGiven is true
        if (consentGiven) {
           // Load communication-related scripts
                console.log("Loading communication and tracking scripts");
               
                 (function (g, e, n, es, ys) {
                   g['_genesysJs'] = e;
                   g[e] = g[e] || function () {
                     (g[e].q = g[e].q || []).push(arguments)
                   };
                   g[e].t = 1 * new Date();
                   g[e].c = es;
                   ys = document.createElement('script'); ys.async = 1; ys.src = n; ys.charset = 'utf-8'; document.head.appendChild(ys);
                 })(window, 'Genesys', 'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js', {
                   environment: 'prod-euw1',
                   deploymentId: '094148b7-0865-4df2-b0a2-3c10ff5c099a',
                   debug: true
                 });
                 Genesys("subscribe", "Launcher.ready" , function(o){
                 console.log("Launcher Ready! Making visible");
                 Genesys("command", "Launcher.show", {});
                 });
                 Genesys("subscribe", "Journey.ready" , function(o){
                 console.log("Journey Tracking Ready!");
                 Genesys("command", "Journey.record", { eventName: "consent_consentGiven" });
                 });
        }
    }
});
    
    

    
