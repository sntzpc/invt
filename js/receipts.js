// js/receipts.js

let receipts = [];

async function loadReceipts() {
    receipts = await getReceipts();
    renderReceiptsTable();
}

function renderReceiptsTable() {
    const tbody = document.querySelector('#receiptsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    receipts.forEach((r, idx) => {
        const itemArr = Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]');
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.tanggal || '-'}</td>
                <td>${r.sumber || '-'}</td>
                <td>${r.catatan || '-'}</td>
                <td>${itemArr.length}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewReceipt(${idx})">Lihat</button>
                    <button class="btn btn-warning btn-sm" onclick="editReceipt(${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteReceiptAct('${r.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

window.viewReceipt = function(idx) {
    const r = receipts[idx];
    let msg = `<strong>No:</strong> ${r.id}<br>
        <strong>Tanggal:</strong> ${r.tanggal}<br>
        <strong>Sumber:</strong> ${r.sumber || '-'}<br>
        <strong>Catatan:</strong> ${r.catatan || '-'}<br>
        <strong>Item:</strong><ul>`;
    const items = Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]');
    items.forEach(i => {
        const mat = (window.materials || []).find(m => m.code === i.kode);
        msg += `<li>${mat ? mat.name : i.kode} - ${i.qty} (${i.keterangan || '-'})</li>`;
    });
    msg += '</ul>';
    showAlert(msg.replace(/<[^>]*>?/gm, '\n'), 'info', 5000); // Produksi bisa pakai modal
};

window.editReceipt = function(idx) {
    openReceiptModal(receipts[idx], idx);
};

window.deleteReceiptAct = async function(id) {
    if (confirm('Yakin hapus penerimaan material ini?')) {
        await deleteReceipt(id);
        await loadReceipts();
    }
};

const btnAddReceiptItem = document.getElementById('btnAddReceiptItem');
if (btnAddReceiptItem) {
    btnAddReceiptItem.onclick = function() {
        addReceiptItemRow();
    };
}

// -------- Modal Form Logic --------
function openReceiptModal(data = null, idx = '') {
    const form = document.getElementById('receiptForm');
    if (form) form.reset();
    const itemsTable = document.getElementById('receiptItemsTable');
    if (itemsTable) itemsTable.querySelector('tbody').innerHTML = '';
    const idxEl = document.getElementById('receiptIdx');
    if (idxEl) idxEl.value = idx || '';
    if (data) {
        const dateEl = document.getElementById('receiptDate');
        const sourceEl = document.getElementById('receiptSource');
        const notesEl = document.getElementById('receiptNotes');
        if (dateEl) dateEl.value = data.tanggal || '';
        if (sourceEl) sourceEl.value = data.sumber || '';
        if (notesEl) notesEl.value = data.catatan || '';
        (Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]')).forEach(addReceiptItemRow);
    } else {
        const dateEl = document.getElementById('receiptDate');
        if (dateEl) dateEl.value = (new Date()).toISOString().substr(0, 10);
    }
    showModal('receiptModal');
}

function addReceiptItemRow(item = null) {
    const materialsList = window.materials || [];
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="form-select rec-material-select" required>
                <option value="">Pilih...</option>
                ${materialsList.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control rec-qty" min="1" value="${item ? item.qty : 1}" required></td>
        <td class="rec-unit">-</td>
        <td><input type="text" class="form-control rec-desc" value="${item ? item.keterangan || '' : ''}"></td>
        <td><button class="btn btn-danger btn-sm rec-remove-item" type="button">&times;</button></td>
    `;
    tr.querySelector('.rec-remove-item').onclick = function () { tr.remove(); };
    tr.querySelector('.rec-material-select').onchange = function () {
        const mat = materialsList.find(m => m.code === this.value);
        tr.querySelector('.rec-unit').textContent = mat ? mat.unit : '-';
    };
    if (item && item.kode) {
        tr.querySelector('.rec-material-select').value = item.kode;
        const mat = materialsList.find(m => m.code === item.kode);
        tr.querySelector('.rec-unit').textContent = mat ? mat.unit : '-';
    }
    document.querySelector('#receiptItemsTable tbody').appendChild(tr);
}

// -------- SUBMIT FORM --------
const receiptForm = document.getElementById('receiptForm');
if (receiptForm) {
    receiptForm.onsubmit = async function (e) {
        e.preventDefault();
        const idxEl = document.getElementById('receiptIdx');
        const dateEl = document.getElementById('receiptDate');
        const sourceEl = document.getElementById('receiptSource');
        const notesEl = document.getElementById('receiptNotes');
        const idx = idxEl ? idxEl.value : '';
        const tanggal = dateEl ? dateEl.value : '';
        const sumber = sourceEl ? sourceEl.value.trim() : '';
        const catatan = notesEl ? notesEl.value.trim() : '';
        const itemRows = document.querySelectorAll('#receiptItemsTable tbody tr');
        if (!tanggal || !sumber || itemRows.length === 0) {
            showAlert('Isi semua field dan minimal satu item material.', 'danger');
            return;
        }
        const items = [];
        let valid = true;
        itemRows.forEach(tr => {
            const kode = tr.querySelector('.rec-material-select').value;
            const qty = Number(tr.querySelector('.rec-qty').value);
            const keterangan = tr.querySelector('.rec-desc').value.trim();
            if (!kode || qty <= 0) valid = false;
            items.push({ kode, qty, keterangan });
        });
        if (!valid) {
            showAlert('Semua item material harus dipilih dan qty > 0!', 'danger');
            return;
        }
        const data = {
            tanggal, sumber, catatan,
            items: JSON.stringify(items)
        };
        if (idx && receipts[idx]) {
            data.id = receipts[idx].id;
            await editReceipt(data);
        } else {
            await addReceipt(data);
        }
        hideModal('receiptModal');
        await loadReceipts();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('receiptsTable')) {
        loadReceipts();
    }
});
