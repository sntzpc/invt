// assets/js/main.js

// ========== INISIALISASI APLIKASI ==========
window.initInventoryApp = async function () {
    try {
        utils.showLoader('Memuat data...');

        await api.loadMasterData();
        await api.loadStockData();
        await api.loadTransactionData();

        ui.renderDashboard();
        ui.renderMaterialsTable();
        ui.renderMaterialDropdowns();
        ui.renderMaterialRequestTable();
        ui.renderReceiptsTable();
        ui.renderUsagesTable();
        ui.renderAdjustmentsTable();
        ui.renderDestructionsTable();
        ui.renderTransfersTable();

        bindEventHandlers();

        utils.hideLoader();
    } catch (err) {
        utils.hideLoader();
        utils.showError("Gagal inisialisasi aplikasi. Silakan refresh!");
        console.error(err);
    }
};

// ========== EVENT HANDLERS ==========
function bindEventHandlers() {
    // --- MATERIALS
    document.querySelector('#masterDataTable')?.addEventListener('click', function(e){
        if (e.target.closest('.edit-material')) {
            let code = e.target.closest('.edit-material').dataset.code;
            editMaterialForm(code);
        } else if (e.target.closest('.delete-material')) {
            let code = e.target.closest('.delete-material').dataset.code;
            deleteMaterial(code);
        }
    });

    // --- MATERIAL REQUESTS
    document.querySelector('#materialRequestTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-request')) {
            let num = e.target.closest('.view-request').dataset.number;
            showRequestDetail(num);
        } else if (e.target.closest('.edit-request')) {
            let num = e.target.closest('.edit-request').dataset.number;
            editRequestForm(num);
        } else if (e.target.closest('.delete-request')) {
            let num = e.target.closest('.delete-request').dataset.number;
            deleteRequest(num);
        }
    });

    // --- RECEIPTS
    document.querySelector('#receiptsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-receipt')) {
            let num = e.target.closest('.view-receipt').dataset.number;
            showReceiptDetail(num);
        } else if (e.target.closest('.edit-receipt')) {
            let num = e.target.closest('.edit-receipt').dataset.number;
            editReceiptForm(num);
        } else if (e.target.closest('.delete-receipt')) {
            let num = e.target.closest('.delete-receipt').dataset.number;
            deleteReceipt(num);
        }
    });

    // --- USAGES
    document.querySelector('#usagesTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-usage')) {
            let num = e.target.closest('.view-usage').dataset.number;
            showUsageDetail(num);
        } else if (e.target.closest('.edit-usage')) {
            let num = e.target.closest('.edit-usage').dataset.number;
            editUsageForm(num);
        } else if (e.target.closest('.delete-usage')) {
            let num = e.target.closest('.delete-usage').dataset.number;
            deleteUsage(num);
        }
    });

    // --- ADJUSTMENTS
    document.querySelector('#adjustmentsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-adjustment')) {
            let num = e.target.closest('.view-adjustment').dataset.number;
            showAdjustmentDetail(num);
        } else if (e.target.closest('.edit-adjustment')) {
            let num = e.target.closest('.edit-adjustment').dataset.number;
            editAdjustmentForm(num);
        } else if (e.target.closest('.delete-adjustment')) {
            let num = e.target.closest('.delete-adjustment').dataset.number;
            deleteAdjustment(num);
        }
    });

    // --- DESTRUCTIONS
    document.querySelector('#destructionsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-destruction')) {
            let num = e.target.closest('.view-destruction').dataset.number;
            showDestructionDetail(num);
        } else if (e.target.closest('.edit-destruction')) {
            let num = e.target.closest('.edit-destruction').dataset.number;
            editDestructionForm(num);
        } else if (e.target.closest('.delete-destruction')) {
            let num = e.target.closest('.delete-destruction').dataset.number;
            deleteDestruction(num);
        }
    });

    // --- TRANSFERS
    document.querySelector('#transfersTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-transfer')) {
            let num = e.target.closest('.view-transfer').dataset.number;
            showTransferDetail(num);
        } else if (e.target.closest('.edit-transfer')) {
            let num = e.target.closest('.edit-transfer').dataset.number;
            editTransferForm(num);
        } else if (e.target.closest('.delete-transfer')) {
            let num = e.target.closest('.delete-transfer').dataset.number;
            deleteTransfer(num);
        }
    });
}

// ========== CRUD & DETAIL PLACEHOLDER ==========
// Di bawah ini adalah contoh fungsi CRUD/modal, Anda tinggal implementasi sesuai kebutuhan Anda

function editMaterialForm(code) {
    utils.showInfo(`Form edit material untuk kode ${code} (implementasi sesuai kebutuhan).`);
}
function deleteMaterial(code) {
    utils.showConfirm(`Yakin hapus material ${code}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus material ${code} (implementasi sesuai kebutuhan).`);
            // Setelah hapus, reload data dan table:
            // await api.loadMasterData(); ui.renderMaterialsTable();
        }
    });
}
function showRequestDetail(number) {
    let req = requests.find(x => x.number === number);
    if (!req) return;
    let html = `<b>No. Permintaan:</b> ${req.number}<br>
        <b>Tanggal:</b> ${req.date}<br>
        <b>Pelatihan:</b> ${req.training}<br>
        <b>Status:</b> ${req.status}<br>
        <b>Catatan:</b> ${req.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(req.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - ${i.quantity}</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Permintaan Material");
}
function editRequestForm(number) {
    utils.showInfo(`Form edit permintaan untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteRequest(number) {
    utils.showConfirm(`Yakin hapus permintaan ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus permintaan ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}
function showReceiptDetail(number) {
    let rec = receipts.find(x => x.number === number);
    if (!rec) return;
    let html = `<b>No. Penerimaan:</b> ${rec.number}<br>
        <b>Tanggal:</b> ${rec.date}<br>
        <b>Supplier:</b> ${rec.supplier}<br>
        <b>No. PO:</b> ${rec.poNumber}<br>
        <b>Lokasi:</b> ${rec.location}<br>
        <b>Catatan:</b> ${rec.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(rec.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - ${i.quantity} (${i.batch || '-'})</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Penerimaan Material");
}
function editReceiptForm(number) {
    utils.showInfo(`Form edit penerimaan untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteReceipt(number) {
    utils.showConfirm(`Yakin hapus penerimaan ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus penerimaan ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}
function showUsageDetail(number) {
    let use = usages.find(x => x.number === number);
    if (!use) return;
    let html = `<b>No. Pengeluaran:</b> ${use.number}<br>
        <b>Tanggal:</b> ${use.date}<br>
        <b>Pelatihan:</b> ${use.training}<br>
        <b>Lokasi:</b> ${use.location}<br>
        <b>Catatan:</b> ${use.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(use.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - ${i.quantity} (${i.batch || '-'})</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Pengeluaran Material");
}
function editUsageForm(number) {
    utils.showInfo(`Form edit pengeluaran untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteUsage(number) {
    utils.showConfirm(`Yakin hapus pengeluaran ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus pengeluaran ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}
function showAdjustmentDetail(number) {
    let adj = adjustments.find(x => x.number === number);
    if (!adj) return;
    let html = `<b>No. Penyesuaian:</b> ${adj.number}<br>
        <b>Tanggal:</b> ${adj.date}<br>
        <b>Lokasi:</b> ${adj.location}<br>
        <b>Alasan:</b> ${adj.reason}<br>
        <b>Catatan:</b> ${adj.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(adj.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - Sistem: ${i.systemQty}, Fisik: ${i.physicalQty}, Selisih: ${i.difference} (${i.batch || '-'})</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Penyesuaian Stok");
}
function editAdjustmentForm(number) {
    utils.showInfo(`Form edit penyesuaian untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteAdjustment(number) {
    utils.showConfirm(`Yakin hapus penyesuaian ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus penyesuaian ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}
function showDestructionDetail(number) {
    let dst = destructions.find(x => x.number === number);
    if (!dst) return;
    let html = `<b>No. Pemusnahan:</b> ${dst.number}<br>
        <b>Tanggal:</b> ${dst.date}<br>
        <b>Lokasi:</b> ${dst.location}<br>
        <b>Alasan:</b> ${dst.reason}<br>
        <b>Metode:</b> ${dst.method}<br>
        <b>Catatan:</b> ${dst.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(dst.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - ${i.quantity} (${i.batch || '-'})</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Pemusnahan Stok");
}
function editDestructionForm(number) {
    utils.showInfo(`Form edit pemusnahan untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteDestruction(number) {
    utils.showConfirm(`Yakin hapus pemusnahan ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus pemusnahan ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}
function showTransferDetail(number) {
    let tf = transfers.find(x => x.number === number);
    if (!tf) return;
    let html = `<b>No. Transfer:</b> ${tf.number}<br>
        <b>Tanggal:</b> ${tf.date}<br>
        <b>Dari:</b> ${tf.fromLocation}<br>
        <b>Ke:</b> ${tf.toLocation}<br>
        <b>Catatan:</b> ${tf.notes || '-'}<br>
        <b>Item:</b>
        <ul>${(tf.items || []).map(i => `<li>${utils.getMaterialName(i.materialCode)} - ${i.quantity} (${i.batch || '-'})</li>`).join('')}</ul>`;
    ui.showDetailModal(html, "Detail Transfer Stok");
}
function editTransferForm(number) {
    utils.showInfo(`Form edit transfer untuk no ${number} (implementasi sesuai kebutuhan).`);
}
function deleteTransfer(number) {
    utils.showConfirm(`Yakin hapus transfer ${number}?`).then(result => {
        if (result.isConfirmed) {
            utils.showSuccess(`Berhasil hapus transfer ${number} (implementasi sesuai kebutuhan).`);
        }
    });
}

