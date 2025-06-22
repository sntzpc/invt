// KATEGORI CRUD
async function loadCategories() {
  const data = await window.getCategories();
  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  data.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${cat.name}</span>
      <div>
        <button class="btn btn-sm btn-warning me-1" onclick="editCategoryForm('${cat.id}','${cat.name}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCategoryAct('${cat.id}')">Hapus</button>
      </div>
    `;
    list.appendChild(li);
  });
  // update dropdown kategori pada material, jika ada
  const dd = document.getElementById('materialCategory');
  if(dd) {
    dd.innerHTML = '<option value="">Pilih...</option>' + data.map(c=>`<option>${c.name}</option>`).join('');
  }
}

window.editCategoryForm = function(id, name) {
  document.getElementById('categoryId').value = id;
  document.getElementById('categoryName').value = name;
}

window.deleteCategoryAct = async function(id) {
  if (confirm('Hapus kategori ini?')) {
    await window.deleteCategory(id);
    loadCategories();
  }
}

document.getElementById('formCategory').onsubmit = async function(e) {
  e.preventDefault();
  const id = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value.trim();
  if (!name) return;
  if (id) {
    await window.editCategory({id, name});
  } else {
    await window.addCategory({name});
  }
  this.reset();
  loadCategories();
}

document.addEventListener('DOMContentLoaded', loadCategories);
