// js/units.js

let units = [];

// Ambil & render data satuan
async function loadUnits() {
    units = await getUnits();
    renderUnits();
}

function renderUnits() {
    const list = document.getElementById('unitList');
    if (!list) return;
    list.innerHTML = '';
    units.forEach(unit => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${unit.name}</span>
            <div>
                <button class="btn btn-sm btn-warning me-1" onclick="editUnitForm('${unit.id}','${unit.name}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUnitAct('${unit.id}')">Hapus</button>
            </div>
        `;
        list.appendChild(li);
    });
    // Update dropdown pada Material jika ada
    const dd = document.getElementById('materialUnit');
    if (dd) {
        dd.innerHTML = '<option value="">Pilih...</option>' + units.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    }
}

// Fungsi edit, pastikan elemen form ada
window.editUnitForm = function(id, name) {
    const idEl = document.getElementById('unitId');
    const nameEl = document.getElementById('unitName');
    if (idEl && nameEl) {
        idEl.value = id;
        nameEl.value = name;
    }
};

// Fungsi hapus, reload hanya jika list ada
window.deleteUnitAct = async function(id) {
    if (confirm('Hapus satuan ini?')) {
        await deleteUnit(id);
        if (document.getElementById('unitList')) {
            loadUnits();
        }
    }
};

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Submit form: hanya jika form ada
    const formUnit = document.getElementById('formUnit');
    if (formUnit) {
        formUnit.onsubmit = async function(e) {
            e.preventDefault();
            const idEl = document.getElementById('unitId');
            const nameEl = document.getElementById('unitName');
            const id = idEl ? idEl.value : '';
            const name = nameEl ? nameEl.value.trim() : '';
            if (!name) {
                showAlert('Nama satuan wajib diisi!', 'danger');
                return;
            }
            if (id) {
                await editUnit({ id, name });
            } else {
                await addUnit({ name });
            }
            this.reset();
            if (document.getElementById('unitList')) {
                loadUnits();
            }
        };
    }

    // Render table hanya jika ada di DOM
    if (document.getElementById('unitList')) {
        loadUnits();
    }
});
