const lambdaUrl = "https://d7hw4tuvig.execute-api.eu-west-1.amazonaws.com/"; // Replace with your actual Lambda URL

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
    if (!messagingToggle.checked) {
        stopPolling();
    } else if (messageSentInSession) {
        startPolling();
    }
});

chatLauncher.addEventListener("click", openChat);

async function sendMessage() {
    const message = userMessageInput.value.trim();
    if (!message) {
        alert("Please enter a message.");
        return;
    }

    displayMessage(message, "user");
    userMessageInput.value = "";

    try {
        const response = await fetch(lambdaUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, message, user: userId }),
        });

        const responseData = await response.json();

        if (responseData.success && responseData.message && responseData.message.text) {
            displayMessage(responseData.message.text, "agent"); // Display agent's response
        } else {
            throw new Error("No valid response from agent");
        }

        messageSentInSession = true;
        if (messagingToggle.checked) {
            startPolling();
        }
    } catch (error) {
        console.error("Error:", error);
        displayMessage("Error sending message. Please try again.", "agent");
    }
}

document.getElementById("send-button").addEventListener("click", sendMessage);

async function pollForMessages() {
    try {
        const response = await fetch(`${lambdaUrl}?sessionId=${sessionId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
            data.messages.forEach((message) => displayMessage(message.text, "agent"));
        }
    } catch (error) {
        console.error("Error polling for messages:", error);
    }
}

function startPolling() {
    if (messagingToggle.checked && messageSentInSession) {
        pollingInterval = setInterval(pollForMessages, 5000);
    }
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

function displayMessage(text, sender) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add(
        "message",
        sender === "user" ? "user-message" : "agent-message"
    );
    messageContainer.textContent = text;
    document.getElementById("chat-messages").appendChild(messageContainer);
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
