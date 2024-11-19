 document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM fully loaded and parsed.");
    
        const cookieBanner = document.getElementById("cookie-banner");
        const cookieModal = document.getElementById("cookie-modal");
        const acceptAllButton = document.getElementById("accept-all");
        const manageCookiesButton = document.getElementById("manage-cookies");
        const savePreferencesButton = document.getElementById("save-preferences");
        const closeCookieModalButton = document.getElementById("close-cookie-modal");
        const communicationCheckbox = document.getElementById("communication-cookies");
        const trackingCheckbox = document.getElementById("tracking-cookies");
    
        // Check if elements are properly selected
        if (!cookieBanner || !acceptAllButton || !manageCookiesButton) {
            console.error("Error: Some elements are missing from the DOM.");
            return;
        }
    
        console.log("Cookie banner and buttons successfully located.");
    
        // Check if the user has already consented to cookies
        const userConsent = JSON.parse(localStorage.getItem("cookieConsent")) || null;
        if (userConsent) {
            console.log("User has already provided cookie consent:", userConsent);
            loadScriptsBasedOnConsent(userConsent);
            cookieBanner.style.display = "none"; // Hide the banner if consent exists
        }
    
        // Accept all cookies
        acceptAllButton.addEventListener("click", () => {
            console.log("User clicked Accept All");
            const consent = { communication: true, tracking: true };
            localStorage.setItem("cookieConsent", JSON.stringify(consent));
            loadScriptsBasedOnConsent(consent);
            cookieBanner.style.display = "none";
        });
    
        // Open cookie preferences modal
        manageCookiesButton.addEventListener("click", () => {
            console.log("User clicked Manage Preferences");
            cookieModal.style.display = "flex"; // Use flex for proper centering
        });
    
        // Save cookie preferences
        savePreferencesButton.addEventListener("click", () => {
            const consent = {
                communication: communicationCheckbox.checked,
                tracking: trackingCheckbox.checked,
            };
            console.log("User saved preferences:", consent);
            localStorage.setItem("cookieConsent", JSON.stringify(consent));
            loadScriptsBasedOnConsent(consent);
            cookieModal.style.display = "none"; // Hide the modal
            cookieBanner.style.display = "none"; // Hide the banner
        });
    
        // Close cookie modal without saving
        closeCookieModalButton.addEventListener("click", () => {
            console.log("User canceled cookie preferences");
            cookieModal.style.display = "none"; // Hide the modal
        });
    
        // Load the appropriate scripts based on user consent
        function loadScriptsBasedOnConsent(consent) {
            if (consent.communication && consent.tracking) {
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
                 Genesys("command", "Journey.record", { eventName: "consent_communication" });
                 Genesys("command", "Journey.record", { eventName: "consent_tracking" });
                 });
            }
    
            if (consent.communication && !consent.tracking) {
                // Load tracking-related script
                console.log("Loading communication scripts");
               
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
            }
        }
    });
    
    
