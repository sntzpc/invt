// assets/js/ui.js

// ========== DASHBOARD & SUMMARY ==========
function renderDashboard() {
    document.getElementById('totalMaterials').textContent = materials.length;
    let totalStock = stockData.reduce((sum, x) => sum + x.quantity, 0);
    document.getElementById('totalStock').textContent = totalStock;

    let today = new Date();
    let warningDays = parseInt(document.getElementById('daysBeforeExpiryWarning')?.value || "30");
    let expiredStock = stockData.filter(x => x.expiryDate && new Date(x.expiryDate) < today)
        .reduce((sum, x) => sum + x.quantity, 0);
    let expiringStock = stockData.filter(x => {
        if (!x.expiryDate) return false;
        let d = new Date(x.expiryDate), diff = (d - today)/(1000*60*60*24);
        return diff > 0 && diff <= warningDays;
    }).reduce((sum, x) => sum + x.quantity, 0);
    document.getElementById('expiredStock').textContent = expiredStock;
    document.getElementById('expiringStock').textContent = expiringStock;

    renderLowStockTable();
    renderExpiringTable();
    renderActivityTable();
}

function renderLowStockTable() {
    let tbody = document.getElementById('lowStockTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    materials.forEach(mat => {
        let stokPerLokasi = {};
        stockData.filter(x => x.materialCode === mat.code)
            .forEach(x => stokPerLokasi[x.location] = (stokPerLokasi[x.location] || 0) + x.quantity);
        Object.entries(stokPerLokasi).forEach(([loc, qty]) => {
            if (qty < Number(mat.minStock)) {
                let tr = document.createElement('tr');
                tr.innerHTML = `<td>${mat.name}</td><td>${qty}</td><td>${mat.minStock}</td><td>${loc}</td>`;
                tbody.appendChild(tr);
            }
        });
    });
}

function renderExpiringTable() {
    let tbody = document.getElementById('expiringTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    let today = new Date();
    let warningDays = parseInt(document.getElementById('daysBeforeExpiryWarning')?.value || "30");
    stockData.filter(x => x.expiryDate).forEach(item => {
        let diff = Math.ceil((new Date(item.expiryDate) - today)/(1000*60*60*24));
        if (diff <= warningDays) {
            let mat = materials.find(m => m.code === item.materialCode);
            let tr = document.createElement('tr');
            tr.className = diff <= 0 ? 'expired' : (diff <= warningDays ? 'expiring-soon' : '');
            tr.innerHTML = `
                <td>${mat ? mat.name : item.materialCode}</td>
                <td>${item.batch || '-'}</td>
                <td>${item.expiryDate}</td>
                <td><span class="badge ${diff <= 0 ? 'bg-danger' : 'bg-warning'}">
                    ${diff <= 0 ? 'Expired' : diff + ' hari'}</span></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function renderActivityTable() {
    let tbody = document.getElementById('activityTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    let latest = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    latest.forEach(act => {
        let mat = materials.find(m => m.code === act.materialCode);
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${act.date}</td>
            <td>${act.type}</td>
            <td>${mat ? mat.name : act.materialCode}</td>
            <td>${act.quantity}</td>
            <td>${act.location}</td>
            <td>${act.user}</td>`;
        tbody.appendChild(tr);
    });
}

// ========== MASTER DATA TABLE & DROPDOWN ==========
function renderMaterialsTable() {
    let tbody = document.querySelector('#masterDataTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    materials.forEach(mat => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mat.code}</td>
            <td>${mat.name}</td>
            <td>${mat.category}</td>
            <td>${mat.unit}</td>
            <td>${mat.minStock}</td>
            <td>${mat.isExpirable ? 'Ya' : 'Tidak'}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-material" data-code="${mat.code}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-material" data-code="${mat.code}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderMaterialDropdowns() {
    let dropdowns = [
        document.getElementById('forecastMaterial'),
        document.getElementById('reportMaterial')
    ];
    dropdowns.forEach(dd => {
        if (dd) {
            dd.innerHTML = '<option value="">Pilih Material</option>';
            materials.forEach(mat => {
                let opt = document.createElement('option');
                opt.value = mat.code;
                opt.textContent = `${mat.code} - ${mat.name}`;
                dd.appendChild(opt);
            });
        }
    });
}

// ========== MATERIAL REQUESTS ==========
function renderMaterialRequestTable() {
    let tbody = document.querySelector('#materialRequestTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    requests.forEach(req => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.number}</td>
            <td>${req.date}</td>
            <td>${req.training}</td>
            <td><span class="badge bg-${getStatusBadgeClass(req.status)}">${req.status}</span></td>
            <td>${req.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-request" data-number="${req.number}">
                    <i class="bi bi-eye"></i>
                </button>
                ${req.status === 'Draft' ? `
                <button class="btn btn-sm btn-warning edit-request" data-number="${req.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-request" data-number="${req.number}">
                    <i class="bi bi-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== RECEIPTS ==========
function renderReceiptsTable() {
    let tbody = document.querySelector('#receiptsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    receipts.forEach(rec => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.number}</td>
            <td>${rec.date}</td>
            <td>${rec.supplier}</td>
            <td>${rec.poNumber}</td>
            <td>${rec.location}</td>
            <td>${rec.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-receipt" data-number="${rec.number}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-receipt" data-number="${rec.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-receipt" data-number="${rec.number}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== USAGES ==========
function renderUsagesTable() {
    let tbody = document.querySelector('#usagesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    usages.forEach(use => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${use.number}</td>
            <td>${use.date}</td>
            <td>${use.training}</td>
            <td>${use.location}</td>
            <td>${use.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-usage" data-number="${use.number}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-usage" data-number="${use.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-usage" data-number="${use.number}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== ADJUSTMENTS ==========
function renderAdjustmentsTable() {
    let tbody = document.querySelector('#adjustmentsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    adjustments.forEach(adj => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${adj.number}</td>
            <td>${adj.date}</td>
            <td>${adj.location}</td>
            <td>${adj.reason}</td>
            <td>${adj.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-adjustment" data-number="${adj.number}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-adjustment" data-number="${adj.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-adjustment" data-number="${adj.number}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== DESTRUCTIONS ==========
function renderDestructionsTable() {
    let tbody = document.querySelector('#destructionsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    destructions.forEach(dst => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dst.number}</td>
            <td>${dst.date}</td>
            <td>${dst.location}</td>
            <td>${dst.reason}</td>
            <td>${dst.method}</td>
            <td>${dst.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-destruction" data-number="${dst.number}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-destruction" data-number="${dst.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-destruction" data-number="${dst.number}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== TRANSFERS ==========
function renderTransfersTable() {
    let tbody = document.querySelector('#transfersTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    transfers.forEach(tf => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tf.number}</td>
            <td>${tf.date}</td>
            <td>${tf.fromLocation}</td>
            <td>${tf.toLocation}</td>
            <td>${tf.createdBy}</td>
            <td>
                <button class="btn btn-sm btn-info view-transfer" data-number="${tf.number}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-transfer" data-number="${tf.number}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-transfer" data-number="${tf.number}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== MODAL DETAIL DOKUMEN ==========
function showDetailModal(html, title = "Detail Dokumen") {
    let modalContainer = document.getElementById("modals");
    if (!modalContainer) return;
    modalContainer.innerHTML = `
        <div class="modal fade" id="viewDetailModal" tabindex="-1" aria-labelledby="viewDetailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">${html}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>`;
    let modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
    modal.show();
}

// ========== STATUS BADGE ==========
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

// ========== EXPORT KE GLOBAL ==========
window.ui = {
    renderDashboard,
    renderLowStockTable,
    renderExpiringTable,
    renderActivityTable,
    renderMaterialsTable,
    renderMaterialDropdowns,
    renderMaterialRequestTable,
    renderReceiptsTable,
    renderUsagesTable,
    renderAdjustmentsTable,
    renderDestructionsTable,
    renderTransfersTable,
    showDetailModal,
    getStatusBadgeClass,
};
