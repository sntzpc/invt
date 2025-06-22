// CRUD Lokasi
async function loadLocations() {
  try {
    const data = await window.getLocations();
    const list = document.getElementById('locationList');
    list.innerHTML = '';
    data.forEach(loc => {
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
    // update dropdown lokasi pada material, jika ada
    const dd = document.getElementById('materialLocation');
    if(dd) {
      dd.innerHTML = '<option value="">Pilih...</option>' + data.map(c=>`<option>${c.name}</option>`).join('');
    }
  } catch (e) {
    alert("Gagal memuat data lokasi. Periksa koneksi internet/API.");
  }
}

window.editLocationForm = function(id, name) {
  document.getElementById('locationId').value = id;
  document.getElementById('locationName').value = name;
}

window.deleteLocationAct = async function(id) {
  if (confirm('Hapus lokasi ini?')) {
    await window.deleteLocation(id);
    loadLocations();
  }
}

document.getElementById('formLocation').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('locationId').value;
  const name = document.getElementById('locationName').value.trim();
  if (!name) {
    alert("Nama lokasi harus diisi!");
    return;
  }
  if (id) {
    await window.editLocation({id, name});
  } else {
    await window.addLocation({name});
  }
  this.reset();
  loadLocations();
}

document.addEventListener('DOMContentLoaded', loadLocations);
