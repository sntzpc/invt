// js/requests.js

let requests = [];

// Render tabel permintaan
function renderRequestTable() {
    const tbody = document.querySelector('#requestTable tbody');
    tbody.innerHTML = '';
    requests.forEach((r, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${r.no}</td>
                <td>${r.tanggal}</td>
                <td>${r.pelatihan}</td>
                <td>${r.status}</td>
                <td>${r.items.length}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewRequest(${idx})">Lihat</button>
                    <button class="btn btn-warning btn-sm" onclick="editRequest(${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRequest(${idx})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

// Inisialisasi tombol tambah permintaan
document.getElementById('btnAddRequest').onclick = function() {
    openRequestModal();
};

// Open Modal Permintaan (baru/edit)
function openRequestModal(data = null, idx = '') {
    document.getElementById('requestForm').reset();
    document.getElementById('requestItemsTable').querySelector('tbody').innerHTML = '';
    document.getElementById('requestIdx').value = idx;
    if (data) {
        document.getElementById('requestDate').value = data.tanggal;
        document.getElementById('requestTraining').value = data.pelatihan;
        document.getElementById('requestNotes').value = data.catatan;
        data.items.forEach(addRequestItemRow);
    } else {
        document.getElementById('requestDate').value = (new Date()).toISOString().substr(0,10);
    }
    new bootstrap.Modal(document.getElementById('requestModal')).show();
}

// Tambah baris item material
document.getElementById('btnAddRequestItem').onclick = function() {
    addRequestItemRow();
};
function addRequestItemRow(item = null) {
    // Ambil list material dari window.materials (pastikan window.materials sudah available)
    const materialsList = (window.materials || []);
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
    tr.querySelector('.req-remove-item').onclick = function() {
        tr.remove();
    };
    tr.querySelector('.req-material-select').onchange = function() {
        const mat = materialsList.find(m => m.code === this.value);
        tr.querySelector('.req-unit').textContent = mat ? mat.unit : '-';
    };
    // Jika item sudah ada, set material & unit
    if (item && item.kode) {
        tr.querySelector('.req-material-select').value = item.kode;
        const mat = materialsList.find(m => m.code === item.kode);
        tr.querySelector('.req-unit').textContent = mat ? mat.unit : '-';
    }
    document.querySelector('#requestItemsTable tbody').appendChild(tr);
}

// Submit permintaan material
document.getElementById('requestForm').onsubmit = function(e) {
    e.preventDefault();
    const idx = document.getElementById('requestIdx').value;
    const tanggal = document.getElementById('requestDate').value;
    const pelatihan = document.getElementById('requestTraining').value.trim();
    const catatan = document.getElementById('requestNotes').value.trim();
    const itemRows = document.querySelectorAll('#requestItemsTable tbody tr');
    if (!tanggal || !pelatihan || itemRows.length === 0) {
        alert('Isi semua field dan minimal satu item material.');
        return;
    }
    // Ambil data items
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
        alert('Semua item material harus dipilih dan qty > 0!');
        return;
    }
    // Nomor otomatis
    const no = idx === "" ? `REQ${Date.now().toString().substr(-6)}` : requests[idx].no;
    const status = "Draft";
    const data = { no, tanggal, pelatihan, catatan, status, items };
    if (idx === "") {
        requests.push(data);
    } else {
        requests[idx] = data;
    }
    renderRequestTable();
    bootstrap.Modal.getInstance(document.getElementById('requestModal')).hide();
};

// View permintaan material (popup alert sederhana)
window.viewRequest = function(idx) {
    const r = requests[idx];
    let msg = `<strong>No:</strong> ${r.no}<br>
        <strong>Tanggal:</strong> ${r.tanggal}<br>
        <strong>Pelatihan:</strong> ${r.pelatihan}<br>
        <strong>Status:</strong> ${r.status}<br>
        <strong>Catatan:</strong> ${r.catatan || '-'}<br>
        <strong>Item:</strong><ul>`;
    r.items.forEach(i => {
        const mat = (window.materials || []).find(m => m.code === i.kode);
        msg += `<li>${mat ? mat.name : i.kode} - ${i.qty}</li>`;
    });
    msg += '</ul>';
    // Ganti dengan modal atau SweetAlert jika ingin lebih bagus
    alert(msg.replace(/<[^>]*>?/gm, '')); // Untuk demo pakai alert, ganti dengan modal untuk produksi
};

// Edit
window.editRequest = function(idx) {
    openRequestModal(requests[idx], idx);
};

// Hapus
window.deleteRequest = function(idx) {
    if (confirm('Yakin hapus permintaan material ini?')) {
        requests.splice(idx, 1);
        renderRequestTable();
    }
};

// Dummy data awal (opsional)
requests = [
    {
        no:'REQ202401', tanggal:'2024-06-22', pelatihan:'Basic Safety', catatan:'Segera', status:'Draft',
        items: [{kode:'BHN001', qty:10, kebutuhan:'Catering'}, {kode:'PMB001', qty:2, kebutuhan:'Toilet'}]
    }
];
renderRequestTable();
