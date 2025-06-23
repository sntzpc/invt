// js/ui.js

// 1. Sidebar Navigation
function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // Show tab-content
            const target = this.getAttribute('href');
            if (target && target !== '#') {
                document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('show', 'active'));
                const tabContent = document.querySelector(target);
                if (tabContent) {
                    tabContent.classList.add('show', 'active');
                }
                // Jika Master Data, aktifkan sub-tab Material
                if (target === '#tab-master') {
                    const materialTabBtn = document.getElementById('subtab-material-tab');
                    if (materialTabBtn) materialTabBtn.click();
                }
            }
        });
    });
}

// 2. Sub-tab Master Data
function initSubTabMasterData() {
    const subtabLinks = document.querySelectorAll('#subtab-masterdata .nav-link');
    subtabLinks.forEach(link => {
        link.addEventListener('click', function () {
            subtabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // Show subtab-pane
            document.querySelectorAll('#tab-master .tab-pane').forEach(tab => tab.classList.remove('show', 'active'));
            const target = this.getAttribute('data-bs-target');
            const subTab = document.querySelector(target);
            if (subTab) subTab.classList.add('show', 'active');
        });
    });
    // Default: aktifkan sub-tab material
    const defaultSubTab = document.getElementById('subtab-material-tab');
    if (defaultSubTab) defaultSubTab.classList.add('active');
    const defaultSubPane = document.getElementById('subtab-material');
    if (defaultSubPane) defaultSubPane.classList.add('show', 'active');
}

// 3. Modal Helper
function showModal(id) {
    new bootstrap.Modal(document.getElementById(id)).show();
}

function hideModal(id) {
    const modalEl = document.getElementById(id);
    const modalObj = bootstrap.Modal.getInstance(modalEl);
    if (modalObj) modalObj.hide();
}

// 4. Alert/Notification Helper
function showAlert(msg, type = 'success', timeout = 2000) {
    // type: 'success', 'danger', 'warning', 'info'
    let el = document.createElement('div');
    el.className = `alert alert-${type} fade show position-fixed top-0 end-0 m-3 shadow`;
    el.style.zIndex = 2000;
    el.innerHTML = msg;
    document.body.appendChild(el);
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    }, timeout);
}

// 5. Inisialisasi setelah DOM siap
document.addEventListener('DOMContentLoaded', function () {
    initSidebarNavigation();
    initSubTabMasterData();
    // Bisa tambah: showAlert('Selamat datang!');
});