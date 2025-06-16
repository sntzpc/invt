// assets/js/auth.js
const GOOGLE_CLIENT_ID = "527968894947-1mrmfn8eqnrdevr8oqshqujqa9bobigh.apps.googleusercontent.com";
let currentUser = null;

function handleCredentialResponse(response) {
    // Decode JWT to get user email/name
    const user = parseJwt(response.credential);
    currentUser = {
        email: user.email,
        name: user.name,
        picture: user.picture,
    };
    // Hide login, show app
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app").style.display = "block";
    // Init app after login
    if (typeof initInventoryApp === "function") initInventoryApp();
}

// Render Google Sign-In button
window.onload = function () {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
    });
    google.accounts.id.renderButton(
        document.getElementById("auth-area"),
        { theme: "outline", size: "large", width: 260 }
    );
    google.accounts.id.prompt();
}

// Utility to decode JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
