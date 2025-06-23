// js/locations.js

let locations = [];

async function loadLocations() {
    locations = await getLocations();
    renderLocations();
}

function renderLocations() {
    const list = document.getElementById('locationList');
    if (!list) return;
    list.innerHTML = '';
    locations.forEach(loc => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${loc.name}</span>
            <div>
                <button class="btn btn-sm btn-warning me-1" onclick="editLocationForm('${loc.id}','${loc.name}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteLocationAct('${loc.id}')">Hapus</button>
            </div>
        `;
        list.appendChild(li);
    });
}

window.editLocationForm = function(id, name) {
    const idEl = document.getElementById('locationId');
    const nameEl = document.getElementById('locationName');
    if (idEl && nameEl) {
        idEl.value = id;
        nameEl.value = name;
    }
}

window.deleteLocationAct = async function(id) {
    if (confirm('Hapus lokasi ini?')) {
        await deleteLocation(id);
        if (document.getElementById('locationList')) {
            loadLocations();
        }
    }
}

const formLocation = document.getElementById('formLocation');
if (formLocation) {
    formLocation.onsubmit = async function(e) {
        e.preventDefault();
        const idEl = document.getElementById('locationId');
        const nameEl = document.getElementById('locationName');
        const id = idEl ? idEl.value : '';
        const name = nameEl ? nameEl.value.trim() : '';
        if (!name) {
            showAlert('Nama lokasi wajib diisi!', 'danger');
            return;
        }
        if (id) {
            await editLocation({ id, name });
        } else {
            await addLocation({ name });
        }
        this.reset();
        if (document.getElementById('locationList')) {
            loadLocations();
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('locationList')) {
        loadLocations();
    }
});