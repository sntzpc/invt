// js/materials.js
import { getMaterials, addMaterial, editMaterial, deleteMaterial } from './api.js';

let materials = [];

async function loadMaterials() {
    materials = await getMaterials();
    renderMaterialsTable();
}

function renderMaterialsTable() {
    const tbody = document.querySelector('#materialsTable tbody');
    tbody.innerHTML = '';
    materials.forEach((m, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${m.code}</td>
                <td>${m.name}</td>
                <td>${m.category}</td>
                <td>${m.unit}</td>
                <td>${m.minStock}</td>
                <td>${m.isExpirable === "TRUE" || m.isExpirable === true ? "Ya" : "Tidak"}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editMaterialRow('${m.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMaterialRow('${m.id}')">Hapus</button>
                </td>
            </tr>
        `;
    });
}

window.editMaterialRow = function(id) {
    const m = materials.find(mat => mat.id == id);
    if (!m) return;
    document.getElementById('materialIdx').value = m.id;
    document.getElementById('materialCode').value = m.code;
    document.getElementById('materialName').value = m.name;
    document.getElementById('materialCategory').value = m.category;
    document.getElementById('materialUnit').value = m.unit;
    document.getElementById('materialMinStock').value = m.minStock;
    document.getElementById('materialIsExpirable').checked = m.isExpirable === "TRUE" || m.isExpirable === true;
    document.getElementById('materialNotes').value = m.notes || '';
    document.getElementById('materialModalLabel').textContent = 'Edit Material';
    new bootstrap.Modal(document.getElementById('materialModal')).show();
}

window.deleteMaterialRow = async function(id) {
    if (confirm('Yakin ingin menghapus material ini?')) {
        await deleteMaterial(id);
        await loadMaterials();
    }
}

document.getElementById('btnAddMaterial').onclick = function() {
    document.getElementById('materialForm').reset();
    document.getElementById('materialIdx').value = '';
    document.getElementById('materialModalLabel').textContent = 'Tambah Material';
    new bootstrap.Modal(document.getElementById('materialModal')).show();
}

document.getElementById('materialForm').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('materialIdx').value;
    const data = {
        code: document.getElementById('materialCode').value.trim(),
        name: document.getElementById('materialName').value.trim(),
        category: document.getElementById('materialCategory').value,
        unit: document.getElementById('materialUnit').value,
        minStock: Number(document.getElementById('materialMinStock').value) || 0,
        isExpirable: document.getElementById('materialIsExpirable').checked ? true : false,
        notes: document.getElementById('materialNotes').value.trim()
    };
    if (!data.code || !data.name || !data.category || !data.unit) {
        alert('Semua field wajib diisi!');
        return;
    }
    if (id) {
        data.id = id;
        await editMaterial(data);
    } else {
        await addMaterial(data);
    }
    bootstrap.Modal.getInstance(document.getElementById('materialModal')).hide();
    await loadMaterials();
}

document.addEventListener('DOMContentLoaded', loadMaterials);
