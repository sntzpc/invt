// assets/js/utils.js

// ========== NOTIFIKASI ==========
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
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Draft': return 'secondary';
        case 'Disetujui': return 'success';
        case 'Ditolak': return 'danger';
        case 'Diproses': return 'warning';
        case 'Selesai': return 'primary';
        default: return 'secondary';
    }
}
function log(...args) {
    if (window.location.hostname === "localhost") console.log(...args);
}

// ========== GENERATE KODE DOKUMEN ==========
function generateDocumentNumbers(prefix, dataList) {
    let lastNumber = 0;
    dataList.forEach(d => {
        let match = d.number && d.number.match(/(\d+)$/);
        if (match) {
            let num = parseInt(match[1], 10);
            if (num > lastNumber) lastNumber = num;
        }
    });
    return `${prefix}${(lastNumber+1).toString().padStart(4, "0")}`;
}

 // Show success message
        function showSuccess(message) {
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
        }
        
        // Show error message
        function showError(message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        }
        
        // Show info message
        function showInfo(message) {
            Swal.fire({
                icon: 'info',
                title: 'Info',
                text: message
            });
        }
    
        // Get forecast method name
        function getForecastMethodName(method) {
            switch (method) {
                case 'average': return 'Rata-rata Pemakaian';
                case 'moving': return 'Moving Average (3 bulan)';
                case 'trend': return 'Trend Analysis';
                default: return 'Unknown';
            }
        }
        
        // Get report type name
        function getReportTypeName(type) {
            switch (type) {
                case 'stock': return 'Laporan Stok';
                case 'movement': return 'Laporan Pergerakan Stok';
                case 'usage': return 'Laporan Pemakaian Material';
                case 'expiry': return 'Laporan Stok Kadaluarsa';
                case 'request': return 'Laporan Permintaan Material';
                default: return type;
            }
        }

// ========== EXPORT KE GLOBAL ==========
window.utils = {
    showSuccess, showError, showInfo, showConfirm,
    showLoader, hideLoader,
    formatDate, formatNumber, randomId, getMaterialName, getStatusBadgeClass,
    log, generateDocumentNumbers, getForecastMethodName, getReportTypeName
};
