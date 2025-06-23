// js/usages.js

// Anti redeklarasi di global
if (typeof window.usages === "undefined") {
    window.usages = [];
}
let usages = window.usages;

// Ambil & render data pemakaian
async function loadUsages() {
    usages = await getUsages();
    renderUsagesTable();
}

function renderUsagesTable() {
    const tbody = document.querySelector('#usagesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    usages.forEach((u, idx) => {
        const itemArr = Array.isArray(u.items) ? u.items : JSON.parse(u.items || '[]');
        tbody.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${u.tanggal || '-'}</td>
                <td>${u.pemakai || '-'}</td>
                <td>${u.catatan || '-'}</td>
                <td>${itemArr.length}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewUsage(${idx})">Lihat</button>
                    <button class="btn btn-warning btn-sm" onclick="editUsage(${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUsageAct('${u.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

window.viewUsage = function(idx) {
    const u = usages[idx];
    let msg = `<strong>No:</strong> ${u.id}<br>
        <strong>Tanggal:</strong> ${u.tanggal}<br>
        <strong>Pemakai/Tujuan:</strong> ${u.pemakai || '-'}<br>
        <strong>Catatan:</strong> ${u.catatan || '-'}<br>
        <strong>Item:</strong><ul>`;
    const items = Array.isArray(u.items) ? u.items : JSON.parse(u.items || '[]');
    items.forEach(i => {
        const mat = (window.materials || []).find(m => m.code === i.kode);
        msg += `<li>${mat ? mat.name : i.kode} - ${i.qty} (${i.keterangan || '-'})</li>`;
    });
    msg += '</ul>';
    showAlert(msg.replace(/<[^>]*>?/gm, '\n'), 'info', 5000);
};

window.editUsage = function(idx) {
    openUsageModal(usages[idx], idx);
};

window.deleteUsageAct = async function(id) {
    if (confirm('Yakin hapus pemakaian material ini?')) {
        await deleteUsage(id);
        if (document.getElementById('usagesTable')) {
            loadUsages();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Tombol tambah usage
    const btnAddUsage = document.getElementById('btnAddUsage');
    if (btnAddUsage) {
        btnAddUsage.onclick = function() {
            openUsageModal();
        };
    }

    // Tombol tambah usage item
    const btnAddUsageItem = document.getElementById('btnAddUsageItem');
    if (btnAddUsageItem) {
        btnAddUsageItem.onclick = function() {
            addUsageItemRow();
        };
    }

    // Form submit
    const usageForm = document.getElementById('usageForm');
    if (usageForm) {
        usageForm.onsubmit = async function (e) {
            e.preventDefault();
            const idxEl = document.getElementById('usageIdx');
            const dateEl = document.getElementById('usageDate');
            const personEl = document.getElementById('usagePerson');
            const notesEl = document.getElementById('usageNotes');
            const idx = idxEl ? idxEl.value : '';
            const tanggal = dateEl ? dateEl.value : '';
            const pemakai = personEl ? personEl.value.trim() : '';
            const catatan = notesEl ? notesEl.value.trim() : '';
            const itemRows = document.querySelectorAll('#usageItemsTable tbody tr');
            if (!tanggal || !pemakai || itemRows.length === 0) {
                showAlert('Isi semua field dan minimal satu item material.', 'danger');
                return;
            }
            const items = [];
            let valid = true;
            itemRows.forEach(tr => {
                const kode = tr.querySelector('.usage-material-select').value;
                const qty = Number(tr.querySelector('.usage-qty').value);
                const keterangan = tr.querySelector('.usage-desc').value.trim();
                if (!kode || qty <= 0) valid = false;
                items.push({ kode, qty, keterangan });
            });
            if (!valid) {
                showAlert('Semua item material harus dipilih dan qty > 0!', 'danger');
                return;
            }
            const data = {
                tanggal, pemakai, catatan,
                items: JSON.stringify(items)
            };
            if (idx && usages[idx]) {
                data.id = usages[idx].id;
                await editUsage(data);
            } else {
                await addUsage(data);
            }
            hideModal('usageModal');
            if (document.getElementById('usagesTable')) {
                await loadUsages();
            }
        };
    }

    // Hanya render tabel jika ada
    if (document.getElementById('usagesTable')) {
        loadUsages();
    }
});

// Modal logic
function openUsageModal(data = null, idx = '') {
    const form = document.getElementById('usageForm');
    if (form) form.reset();
    const itemsTable = document.getElementById('usageItemsTable');
    if (itemsTable) itemsTable.querySelector('tbody').innerHTML = '';
    const idxEl = document.getElementById('usageIdx');
    if (idxEl) idxEl.value = idx || '';
    if (data) {
        const dateEl = document.getElementById('usageDate');
        const personEl = document.getElementById('usagePerson');
        const notesEl = document.getElementById('usageNotes');
        if (dateEl) dateEl.value = data.tanggal || '';
        if (personEl) personEl.value = data.pemakai || '';
        if (notesEl) notesEl.value = data.catatan || '';
        (Array.isArray(data.items) ? data.items : JSON.parse(data.items || '[]')).forEach(addUsageItemRow);
    } else {
        const dateEl = document.getElementById('usageDate');
        if (dateEl) dateEl.value = (new Date()).toISOString().substr(0, 10);
    }
    showModal('usageModal');
}

function addUsageItemRow(item = null) {
    const materialsList = window.materials || [];
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="form-select usage-material-select" required>
                <option value="">Pilih...</option>
                ${materialsList.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control usage-qty" min="1" value="${item ? item.qty : 1}" required></td>
        <td class="usage-unit">-</td>
        <td><input type="text" class="form-control usage-desc" value="${item ? item.keterangan || '' : ''}"></td>
        <td><button class="btn btn-danger btn-sm usage-remove-item" type="button">&times;</button></td>
    `;
    tr.querySelector('.usage-remove-item').onclick = function () { tr.remove(); };
    tr.querySelector('.usage-material-select').onchange = function () {
        const mat = materialsList.find(m => m.code === this.value);
        tr.querySelector('.usage-unit').textContent = mat ? mat.unit : '-';
    };
    if (item && item.kode) {
        tr.querySelector('.usage-material-select').value = item.kode;
        const mat = materialsList.find(m => m.code === item.kode);
        tr.querySelector('.usage-unit').textContent = mat ? mat.unit : '-';
    }
    const usageItemsTable = document.querySelector('#usageItemsTable tbody');
    if (usageItemsTable) usageItemsTable.appendChild(tr);
}
