// js/requests.js

let requests = [];

async function loadRequests() {
    requests = await getRequests();
    renderRequestTable();
}

function renderRequestTable() {
    const tbody = document.querySelector('#requestTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    requests.forEach((r, idx) => {
        const itemArr = Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]');
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.tanggal || '-'}</td>
                <td>${r.pelatihan || '-'}</td>
                <td>${r.status || '-'}</td>
                <td>${itemArr.length}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewRequest(${idx})">Lihat</button>
                    <button class="btn btn-warning btn-sm" onclick="editRequest(${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRequestAct('${r.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

window.viewRequest = function(idx) {
    const r = requests[idx];
    let msg = `<strong>No:</strong> ${r.id}<br>
        <strong>Tanggal:</strong> ${r.tanggal}<br>
        <strong>Pelatihan:</strong> ${r.pelatihan}<br>
        <strong>Status:</strong> ${r.status}<br>
        <strong>Catatan:</strong> ${r.catatan || '-'}<br>
        <strong>Item:</strong><ul>`;
    const items = Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]');
    items.forEach(i => {
        const mat = (window.materials || []).find(m => m.code === i.kode);
        msg += `<li>${mat ? mat.name : i.kode} - ${i.qty} (${i.kebutuhan || '-'})</li>`;
    });
    msg += '</ul>';
    showAlert(msg.replace(/<[^>]*>?/gm, '\n'), 'info', 5000); // Untuk produksi, bisa ganti jadi modal
};

window.editRequest = function(idx) {
    openRequestModal(requests[idx], idx);
};

window.deleteRequestAct = async function(id) {
    if (confirm('Yakin hapus permintaan material ini?')) {
        await deleteRequest(id);
        await loadRequests();
    }
};

const btnAddRequest = document.getElementById('btnAddRequest');
if (btnAddRequest) {
    btnAddRequest.onclick = function() {
        openRequestModal();
    };
}

// -------- Modal Form Logic --------
function openRequestModal(data = null, idx = '') {
    const reqForm = document.getElementById('requestForm');
if (reqForm) reqForm.reset();
    const itemsTable = document.getElementById('requestItemsTable');
if (itemsTable) itemsTable.querySelector('tbody').innerHTML = '';
    const idxEl = document.getElementById('requestIdx');
if (idxEl) idxEl.value = idx || '';
    if (data) {
        document.getElementById('requestDate').value = data.tanggal || '';
        document.getElementById('requestTraining').value = data.pelatihan || '';
        document.getElementById('requestNotes').value = data.catatan || '';
        (Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]')).forEach(addRequestItemRow);
    } else {
        document.getElementById('requestDate').value = (new Date()).toISOString().substr(0, 10);
    }
    showModal('requestModal');
}

const btnAddRequestItem = document.getElementById('btnAddRequestItem');
if (btnAddRequestItem) {
    btnAddRequestItem.onclick = function() {
        addRequestItemRow();
    };
}

function addRequestItemRow(item = null) {
    const materialsList = window.materials || [];
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="form-select req-material-select" required>
                <option value="">Pilih...</option>
                ${materialsList.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control req-qty" min="1" value="${item ? item.qty : 1}" required></td>
        <td class="req-unit">-</td>
        <td><input type="text" class="form-control req-purpose" value="${item ? item.kebutuhan || '' : ''}"></td>
        <td><button class="btn btn-danger btn-sm req-remove-item" type="button">&times;</button></td>
    `;
    tr.querySelector('.req-remove-item').onclick = function () { tr.remove(); };
    tr.querySelector('.req-material-select').onchange = function () {
        const mat = materialsList.find(m => m.code === this.value);
        tr.querySelector('.req-unit').textContent = mat ? mat.unit : '-';
    };
    if (item && item.kode) {
        tr.querySelector('.req-material-select').value = item.kode;
        const mat = materialsList.find(m => m.code === item.kode);
        tr.querySelector('.req-unit').textContent = mat ? mat.unit : '-';
    }
    document.querySelector('#requestItemsTable tbody').appendChild(tr);
}

// -------- SUBMIT FORM --------
const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.onsubmit = async function (e) {
        e.preventDefault();
        const idxEl = document.getElementById('requestIdx');
        const dateEl = document.getElementById('requestDate');
        const trainingEl = document.getElementById('requestTraining');
        const notesEl = document.getElementById('requestNotes');
        const idx = idxEl ? idxEl.value : '';
        const tanggal = dateEl ? dateEl.value : '';
        const pelatihan = trainingEl ? trainingEl.value.trim() : '';
        const catatan = notesEl ? notesEl.value.trim() : '';
        const itemRows = document.querySelectorAll('#requestItemsTable tbody tr');
        if (!tanggal || !pelatihan || itemRows.length === 0) {
            showAlert('Isi semua field dan minimal satu item material.', 'danger');
            return;
        }
        const items = [];
        let valid = true;
        itemRows.forEach(tr => {
            const kode = tr.querySelector('.req-material-select').value;
            const qty = Number(tr.querySelector('.req-qty').value);
            const kebutuhan = tr.querySelector('.req-purpose').value.trim();
            if (!kode || qty <= 0) valid = false;
            items.push({ kode, qty, kebutuhan });
        });
        if (!valid) {
            showAlert('Semua item material harus dipilih dan qty > 0!', 'danger');
            return;
        }
        const status = "Draft";
        const data = {
            tanggal, pelatihan, catatan, status,
            items: JSON.stringify(items)
        };
        if (idx && requests[idx]) {
            data.id = requests[idx].id;
            await editRequest(data);
        } else {
            await addRequest(data);
        }
        hideModal('requestModal');
        await loadRequests();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('requestTable')) {
        loadRequests();
    }
});
