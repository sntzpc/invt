// UNIT CRUD
async function loadUnits() {
  const data = await window.getUnits();
  const list = document.getElementById('unitList');
  list.innerHTML = '';
  data.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${cat.name}</span>
      <div>
        <button class="btn btn-sm btn-warning me-1" onclick="editUnitForm('${cat.id}','${cat.name}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUnitAct('${cat.id}')">Hapus</button>
      </div>
    `;
    list.appendChild(li);
  });
  // update dropdown unit pada material, jika ada
  const dd = document.getElementById('materialUnit');
  if(dd) {
    dd.innerHTML = '<option value="">Pilih...</option>' + data.map(c=>`<option>${c.name}</option>`).join('');
  }
}

window.editUnitForm = function(id, name) {
  document.getElementById('unitId').value = id;
  document.getElementById('unitName').value = name;
}

window.deleteUnitAct = async function(id) {
  if (confirm('Hapus unit ini?')) {
    await window.deleteUnit(id);
    loadUnits();
  }
}

document.getElementById('formUnit').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('unitId').value;
  const name = document.getElementById('unitName').value.trim();
  if (!name) return;
  if (id) {
    await window.editUnit({id, name});
  } else {
    await window.addUnit({name});
  }
  this.reset();
  loadUnits();
}

document.addEventListener('DOMContentLoaded', loadUnits);
