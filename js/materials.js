// js/materials.js

let materials = [];

async function loadMaterials() {
    materials = await getMaterials();
    renderMaterialsTable();
}

function renderMaterialsTable() {
    const tbody = document.querySelector('#masterDataTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    materials.forEach((mat, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${mat.code}</td>
                <td>${mat.name}</td>
                <td>${mat.category}</td>
                <td>${mat.unit}</td>
                <td>${mat.minStock || 0}</td>
                <td>${mat.isExpirable ? 'Ya' : 'Tidak'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editMaterialRow('${mat.id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMaterialRow('${mat.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

window.editMaterialRow = function(id) {
    const m = materials.find(mat => mat.id == id);
    if (!m) return;
    const modal = new bootstrap.Modal(document.getElementById('addMaterialModal'));
    document.getElementById('materialForm').reset();
    document.getElementById('materialCode').value = m.code;
    document.getElementById('materialName').value = m.name;
    document.getElementById('materialCategory').value = m.category;
    document.getElementById('materialUnit').value = m.unit;
    document.getElementById('materialMinStock').value = m.minStock || 0;
    document.getElementById('materialIsExpirable').checked = !!m.isExpirable;
    document.getElementById('materialNotes').value = m.notes || '';
    // Simpan id di elemen tersembunyi
    document.getElementById('addMaterialModal').setAttribute('data-edit-id', m.id);
    modal.show();
};

window.deleteMaterialRow = async function(id) {
    if (confirm('Yakin ingin menghapus material ini?')) {
        await deleteMaterial(id);
        await loadMaterials();
    }
};

// --- INI BAGIAN UTAMA YANG HARUS DITAMBAHKAN ---
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('saveMaterial')) {
        document.getElementById('saveMaterial').onclick = async function() {
            // Ambil semua value form
            const code = document.getElementById('materialCode')?.value.trim();
            const name = document.getElementById('materialName')?.value.trim();
            const category = document.getElementById('materialCategory')?.value;
            const unit = document.getElementById('materialUnit')?.value;
            const minStock = Number(document.getElementById('materialMinStock')?.value) || 0;
            const isExpirable = document.getElementById('materialIsExpirable')?.checked || false;
            const notes = document.getElementById('materialNotes')?.value.trim() || '';
            const id = document.getElementById('addMaterialModal').getAttribute('data-edit-id') || '';

            if (!code || !name || !category || !unit) {
                Swal.fire('Gagal', 'Semua field wajib diisi!', 'error');
                return;
            }

            const data = { code, name, category, unit, minStock, isExpirable, notes };
            if (id) data.id = id;

            // Tambah atau edit
            if (id) {
                await editMaterial(data);
            } else {
                await addMaterial(data);
            }
            // Reset id edit
            document.getElementById('addMaterialModal').removeAttribute('data-edit-id');
            bootstrap.Modal.getInstance(document.getElementById('addMaterialModal')).hide();
            await loadMaterials();
        };
    }

    // Render tabel material saat tab master-data tampil
    if (document.getElementById('masterDataTable')) {
        loadMaterials();
    }
});
