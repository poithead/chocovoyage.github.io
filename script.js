const msg_lambdaUrl = "https://zqnsus7wen4dhahfw3vq5kt6vu0lztaq.lambda-url.eu-west-1.on.aws/"; // Replace with your actual messaging Lambda URL
const reg_lambdaUrl = "https://km26rzjhrizvzt3gqqa7beqzv40dztid.lambda-url.eu-west-1.on.aws/"; // Replace with your actual register Lambda URL
const sin_lambdaUrl = "https://kcho7b5kbusvoggsi2hraazzmi0rjzzx.lambda-url.eu-west-1.on.aws/"; // Replace with your actual signin Lambda URL

// Open and close modals
const registerModal = document.getElementById("register-modal");
const signInModal = document.getElementById("signin-modal");
const closeRegister = document.getElementById("close-register");
const closeSignIn = document.getElementById("close-signin");

const chatWidget = document.getElementById("chat-widget");
const chatLauncher = document.getElementById("chat-launcher");
const closeChat = document.getElementById("close-chat");
const userMessageInput = document.getElementById("user-message");
const messagingToggle = document.getElementById("messaging-toggle");

let consentGiven = JSON.parse(localStorage.getItem("cookieConsent")) || null;

// Generate sessionId and userId
let sessionId = localStorage.getItem("sessionId") || Math.floor(10000000 + Math.random() * 90000000).toString();
let userId = localStorage.getItem("userId") || `Guest_${sessionId}`;
localStorage.setItem("sessionId", sessionId);
localStorage.setItem("userId", userId);

let messageSentInSession = false; // Track if a message has been sent in the current session
let pollingInterval;

function startNewSession() {
    sessionId = localStorage.getItem("sessionId") || Math.floor(10000000 + Math.random() * 90000000).toString();
    userId = `Guest_${sessionId}`;
    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("userId", userId);
    messageSentInSession = false; // Reset the flag for the new session
}

function endSession() {
    sessionId = null;
    userId = null;
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userId");
    messageSentInSession = false;
}

function openChat() {
    chatWidget.style.display = "flex";
    chatLauncher.style.display = "none";
}

closeChat.addEventListener("click", () => {
    chatWidget.style.display = "none";
    chatLauncher.style.display = "flex";
    stopPolling(); // Stop polling when the chat widget is closed
});

messagingToggle.addEventListener("change", () => {
    chatLauncher.style.display = messagingToggle.checked ? "flex" : "none";
    const cookieBanner = document.getElementById("cookie-banner");
    if (!messagingToggle.checked) {
        stopPolling();
        if (!cookieBanner && !consentGiven) {
            cookieBanner.style.display = "flex";
        }
    } else if (messageSentInSession) {
        startPolling();
    }

    if (messagingToggle.checked) {
        // Close the cookie consent banner/modal
        if (cookieBanner) {
            cookieBanner.style.display = "none";
        }

        // Reset consent if already given
        if (consentGiven) {
            console.log("Consent revoked as messaging toggle is activated.");
            consentGiven = false; // Reset the consentGiven variable
            localStorage.setItem("cookieConsent", false); // Update localStorage

            // Attempt to execute Genesys commands
            try {
                Genesys("command", "Messenger.clear", {});
                const activeSessions = Object.keys(localStorage).filter((key) => key.includes(':gcmcsessionActive'))
                if (activeSessions.length > 0) {
                localStorage.removeItem(activeSessions[0]);
                };
                Genesys('command', 'Identifiers.purgeAll', {});
                console.log("Genesys commands executed successfully.");
            } catch (error) {
                console.error("Error executing Genesys commands:", error);
            }
        }
    }
});

chatLauncher.addEventListener("click", openChat);

async function sendMessage() {
    const message = userMessageInput.value.trim();
    if (!message) {
        alert("Please enter a message.");
        return;
    }

    // Display the user's message in the chat widget
    displayMessage(message, "user");
    userMessageInput.value = "";

    try {
        const response = await fetch(msg_lambdaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sessionId, message: message, user: userId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // If the POST was successful, start polling for new messages
        messageSentInSession = true;
        if (messagingToggle.checked) {
            startPolling();
        }
    } catch (error) {
        console.error("Error:", error.message);
        displayMessage("Error sending message. Please try again.", "agent");
    }
}

document.getElementById("send-button").addEventListener("click", sendMessage);

async function pollForMessages() {
    try {
        const response = await fetch(`${msg_lambdaUrl}?sessionId=${sessionId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        console.log("GET response:", data);

        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            data.messages.forEach((message) => {
                console.log("Processing message:", message);
                if (message.message && message.nickname) {
                    displayMessage(`${message.nickname}: ${message.message}`, "agent");
                }
            });
        } else {
            console.log("No new messages found.");
        }
    } catch (error) {
        console.error("Error polling for messages:", error);
    }
}



function startPolling() {
    if (messagingToggle.checked && messageSentInSession) {
        pollingInterval = setInterval(pollForMessages, 5000); // Poll every 5 seconds
    }
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function displayMessage(text, sender) {
    if (!text || typeof text !== "string") {
        console.warn("Invalid or empty message text. Skipping display.");
        return;
    }

    // Create a new div for the message
    const messageContainer = document.createElement("div");
    messageContainer.classList.add(
        "message",
        sender === "user" ? "user-message" : "agent-message"
    );
    messageContainer.textContent = text;

    // Append the message to the chat-messages container
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.appendChild(messageContainer);

    // Scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Open and close modals
function openRegisterModal() {
    registerModal.style.display = "flex";
}

function openSignInModal() {
    signInModal.style.display = "flex";
}

closeRegister.addEventListener("click", () => (registerModal.style.display = "none"));
closeSignIn.addEventListener("click", () => (signInModal.style.display = "none"));

// Handle registration form submission
document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = document.getElementById("register-firstname").value.trim();
    const lastName = document.getElementById("register-lastname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    try {
        const response = await fetch(`${lambdaUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Registration successful!");
            registerModal.style.display = "none";
        } else {
            alert(data.error || "Registration failed.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
    }
});

// Handle sign-in form submission
document.getElementById("signin-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    try {
        const response = await fetch(`${lambdaUrl}/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
            alert(data.message || "Sign-in successful!");
            userId = email; // Update user ID
            localStorage.setItem("userId", userId);
            signInModal.style.display = "none";
        } else {
            alert(data.error || "Sign-in failed.");
        }
    } catch (error) {
        console.error("Error during sign-in:", error);
        alert("Sign-in failed. Please try again.");
    }

   
    });

    function pageOnLoad(Title) {
        
        consentGiven = JSON.parse(localStorage.getItem("cookieConsent")) || null;

        if (consentGiven) {
            loadscripts();
            Genesys("command", "Journey.pageview", {
              pageTitle: Title,
              pageLocation: "ChocoVoyage",
              customAttributes: { visitorPreferredLang: "en" },
              traitsMapper: []
            }
        )};        
    }
        
    function openPage(targetPage) {
        window.location.href = targetPage;
    }
