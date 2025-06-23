// js/adjustments.js

// Anti redeklarasi di global (jika script double load)
if (typeof window.adjustments === "undefined") {
    window.adjustments = [];
}
let adjustments = window.adjustments;

async function loadAdjustments() {
    adjustments = await getAdjustments();
    renderAdjustmentsTable();
}

function renderAdjustmentsTable() {
    const tbody = document.querySelector('#adjustmentsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    adjustments.forEach((adj, idx) => {
        const itemArr = Array.isArray(adj.items) ? adj.items : JSON.parse(adj.items || '[]');
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${adj.tanggal || '-'}</td>
                <td>${adj.tipe || '-'}</td>
                <td>${adj.catatan || '-'}</td>
                <td>${itemArr.length}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewAdjustment(${idx})">Lihat</button>
                    <button class="btn btn-warning btn-sm" onclick="editAdjustment(${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdjustmentAct('${adj.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

window.viewAdjustment = function(idx) {
    const adj = adjustments[idx];
    let msg = `<strong>No:</strong> ${adj.id}<br>
        <strong>Tanggal:</strong> ${adj.tanggal}<br>
        <strong>Tipe:</strong> ${adj.tipe || '-'}<br>
        <strong>Catatan:</strong> ${adj.catatan || '-'}<br>
        <strong>Item:</strong><ul>`;
    const items = Array.isArray(adj.items) ? adj.items : JSON.parse(adj.items || '[]');
    items.forEach(i => {
        const mat = (window.materials || []).find(m => m.code === i.kode);
        msg += `<li>${mat ? mat.name : i.kode} - ${i.qty} (${i.keterangan || '-'})</li>`;
    });
    msg += '</ul>';
    showAlert(msg.replace(/<[^>]*>?/gm, '\n'), 'info', 5000);
};

window.editAdjustment = function(idx) {
    openAdjustmentModal(adjustments[idx], idx);
};

window.deleteAdjustmentAct = async function(id) {
    if (confirm('Yakin hapus penyesuaian stok ini?')) {
        await deleteAdjustment(id);
        if (document.getElementById('adjustmentsTable')) {
            loadAdjustments();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Tombol tambah adjustment
    const btnAddAdjustment = document.getElementById('btnAddAdjustment');
    if (btnAddAdjustment) {
        btnAddAdjustment.onclick = function() {
            openAdjustmentModal();
        };
    }

    // Tombol tambah adjustment item
    const btnAddAdjustmentItem = document.getElementById('btnAddAdjustmentItem');
    if (btnAddAdjustmentItem) {
        btnAddAdjustmentItem.onclick = function() {
            addAdjustmentItemRow();
        };
    }

    // Form submit: hanya jika form ada
    const adjustmentForm = document.getElementById('adjustmentForm');
    if (adjustmentForm) {
        adjustmentForm.onsubmit = async function (e) {
            e.preventDefault();
            const idxEl = document.getElementById('adjustmentIdx');
            const dateEl = document.getElementById('adjustmentDate');
            const typeEl = document.getElementById('adjustmentType');
            const notesEl = document.getElementById('adjustmentNotes');
            const idx = idxEl ? idxEl.value : '';
            const tanggal = dateEl ? dateEl.value : '';
            const tipe = typeEl ? typeEl.value.trim() : '';
            const catatan = notesEl ? notesEl.value.trim() : '';
            const itemRows = document.querySelectorAll('#adjustmentItemsTable tbody tr');
            if (!tanggal || !tipe || itemRows.length === 0) {
                showAlert('Isi semua field dan minimal satu item material.', 'danger');
                return;
            }
            const items = [];
            let valid = true;
            itemRows.forEach(tr => {
                const kode = tr.querySelector('.adj-material-select').value;
                const qty = Number(tr.querySelector('.adj-qty').value);
                const keterangan = tr.querySelector('.adj-desc').value.trim();
                if (!kode || isNaN(qty)) valid = false;
                items.push({ kode, qty, keterangan });
            });
            if (!valid) {
                showAlert('Semua item material harus dipilih dan qty valid!', 'danger');
                return;
            }
            const data = {
                tanggal, tipe, catatan,
                items: JSON.stringify(items)
            };
            if (idx && adjustments[idx]) {
                data.id = adjustments[idx].id;
                await editAdjustment(data);
            } else {
                await addAdjustment(data);
            }
            hideModal('adjustmentModal');
            if (document.getElementById('adjustmentsTable')) {
                await loadAdjustments();
            }
        };
    }

    // Render tabel hanya jika ada
    if (document.getElementById('adjustmentsTable')) {
        loadAdjustments();
    }
});

// -------- Modal Form Logic --------
function openAdjustmentModal(data = null, idx = '') {
    const form = document.getElementById('adjustmentForm');
    if (form) form.reset();
    const itemsTable = document.getElementById('adjustmentItemsTable');
    if (itemsTable) itemsTable.querySelector('tbody').innerHTML = '';
    const idxEl = document.getElementById('adjustmentIdx');
    if (idxEl) idxEl.value = idx || '';
    if (data) {
        const dateEl = document.getElementById('adjustmentDate');
        const typeEl = document.getElementById('adjustmentType');
        const notesEl = document.getElementById('adjustmentNotes');
        if (dateEl) dateEl.value = data.tanggal || '';
        if (typeEl) typeEl.value = data.tipe || '';
        if (notesEl) notesEl.value = data.catatan || '';
        (Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]')).forEach(addAdjustmentItemRow);
    } else {
        const dateEl = document.getElementById('adjustmentDate');
        if (dateEl) dateEl.value = (new Date()).toISOString().substr(0, 10);
    }
    showModal('adjustmentModal');
}

function addAdjustmentItemRow(item = null) {
    const materialsList = window.materials || [];
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="form-select adj-material-select" required>
                <option value="">Pilih...</option>
                ${materialsList.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control adj-qty" value="${item ? item.qty : 1}" required></td>
        <td class="adj-unit">-</td>
        <td><input type="text" class="form-control adj-desc" value="${item ? item.keterangan || '' : ''}"></td>
        <td><button class="btn btn-danger btn-sm adj-remove-item" type="button">&times;</button></td>
    `;
    tr.querySelector('.adj-remove-item').onclick = function () { tr.remove(); };
    tr.querySelector('.adj-material-select').onchange = function () {
        const mat = materialsList.find(m => m.code === this.value);
        tr.querySelector('.adj-unit').textContent = mat ? mat.unit : '-';
    };
    if (item && item.kode) {
        tr.querySelector('.adj-material-select').value = item.kode;
        const mat = materialsList.find(m => m.code === item.kode);
        tr.querySelector('.adj-unit').textContent = mat ? mat.unit : '-';
    }
    const adjustmentItemsTable = document.querySelector('#adjustmentItemsTable tbody');
    if (adjustmentItemsTable) adjustmentItemsTable.appendChild(tr);
}
