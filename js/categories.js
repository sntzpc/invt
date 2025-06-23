// js/categories.js

let categories = [];

async function loadCategories() {
    categories = await getCategories();
    renderCategories();
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;
    list.innerHTML = '';
    categories.forEach(cat => {
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
    // Update dropdown pada Material (jika ada)
    const dd = document.getElementById('materialCategory');
    if (dd) {
        dd.innerHTML = '<option value="">Pilih...</option>' + categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
}

window.editCategoryForm = function(id, name) {
    const idEl = document.getElementById('categoryId');
    const nameEl = document.getElementById('categoryName');
    if (idEl && nameEl) {
        idEl.value = id;
        nameEl.value = name;
    }
};

window.deleteCategoryAct = async function(id) {
    if (confirm('Hapus kategori ini?')) {
        await deleteCategory(id);
        if (document.getElementById('categoryList')) {
            loadCategories();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Event submit form kategori, dicek elemen ada atau tidak
    const formCategory = document.getElementById('formCategory');
    if (formCategory) {
        formCategory.onsubmit = async function(e) {
            e.preventDefault();
            const idEl = document.getElementById('categoryId');
            const nameEl = document.getElementById('categoryName');
            const id = idEl ? idEl.value : '';
            const name = nameEl ? nameEl.value.trim() : '';
            if (!name) {
                showAlert('Nama kategori wajib diisi!', 'danger');
                return;
            }
            if (id) {
                await editCategory({ id, name });
            } else {
                await addCategory({ name });
            }
            this.reset();
            if (document.getElementById('categoryList')) {
                loadCategories();
            }
        };
    }

    // Hanya load jika elemen daftar kategori ada di DOM
    if (document.getElementById('categoryList')) {
        loadCategories();
    }
});
