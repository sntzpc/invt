// assets/js/auth.js

// Ganti dengan client_id Anda jika berbeda
const GOOGLE_CLIENT_ID = "527968894947-1mrmfn8eqnrdevr8oqshqujqa9bobigh.apps.googleusercontent.com";

let currentUser = null;

// Fungsi untuk decode JWT Google
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Callback setelah login Google sukses
function handleCredentialResponse(response) {
    const user = parseJwt(response.credential);
    currentUser = {
        email: user.email,
        name: user.name,
        picture: user.picture,
    };
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.getElementById("auth-area").style.display = "none";
    document.getElementById("app").style.display = "block";
    // Trigger inisialisasi aplikasi
    if (typeof window.initInventoryApp === "function") window.initInventoryApp();
}

// Render Google Sign-In button
window.addEventListener("DOMContentLoaded", function () {
    // Jika sudah login, langsung bypass ke app
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        document.getElementById("auth-area").style.display = "none";
        document.getElementById("app").style.display = "block";
        if (typeof window.initInventoryApp === "function") window.initInventoryApp();
        return;
    }
    if (window.google && google.accounts) {
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
    } else {
        // Jika Google script belum ready, ulangi 1 detik lagi
        setTimeout(() => window.dispatchEvent(new Event("DOMContentLoaded")), 1000);
    }
});

// Logout (misal tombol logout di header)
window.logout = function () {
    localStorage.removeItem('user');
    window.location.reload();
}

// Promise supaya main.js bisa menunggu login sebelum inisialisasi
window.auth = {
    waitForLogin: function () {
        return new Promise((resolve) => {
            if (currentUser) resolve(currentUser);
            else {
                const check = setInterval(() => {
                    if (currentUser) {
                        clearInterval(check);
                        resolve(currentUser);
                    }
                }, 300);
            }
        });
    },
    getCurrentUser: function() {
        return currentUser;
    }
};
