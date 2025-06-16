// assets/js/utils.js

// ========== ALERTS (SweetAlert2) ==========
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: message,
        timer: 2200,
        showConfirmButton: false
    });
}
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}
function showInfo(message) {
    Swal.fire({
        icon: 'info',
        title: 'Info',
        text: message
    });
}
function showConfirm(message, confirmText = "Ya", cancelText = "Batal") {
    return Swal.fire({
        icon: "question",
        title: "Konfirmasi",
        text: message,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
}

// ========== LOADER/SPINNER ==========
function showLoader(text = "Memproses...") {
    Swal.fire({
        title: text,
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });
}
function hideLoader() {
    Swal.close();
}

// ========== FORMAT & HELPER ==========
function formatDate(date) {
    // Input: Date object atau yyyy-mm-dd, Output: dd-mm-yyyy
    if (typeof date === 'string') date = new Date(date);
    if (isNaN(date.getTime())) return '-';
    let d = date.getDate().toString().padStart(2, '0');
    let m = (date.getMonth() + 1).toString().padStart(2, '0');
    let y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

function formatNumber(val, des = 0) {
    return (+val).toLocaleString('id-ID', {minimumFractionDigits: des, maximumFractionDigits: des});
}

function randomId(length = 4) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

function getMaterialName(code) {
    let m = (window.materials || []).find(x => x.code === code);
    return m ? m.name : code;
}

// ========== NOTIFIKASI/LOG ==========
function log(...args) {
    if (window.location.hostname === "localhost") console.log(...args);
}

// ========== EXPORT KE GLOBAL ==========
window.utils = {
    showSuccess, showError, showInfo, showConfirm,
    showLoader, hideLoader,
    formatDate, formatNumber, randomId, getMaterialName,
    log
};
