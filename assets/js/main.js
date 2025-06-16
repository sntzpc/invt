// assets/js/main.js

// Inisialisasi aplikasi setelah login Google
window.initInventoryApp = async function () {
    try {
        utils.showLoader('Memuat data...');
        await api.loadMasterData();
        await api.loadStockData();
        await api.loadTransactionData();
        ui.updateDashboard();
        ui.populateMaterialsTable();
        ui.populateMaterialDropdowns();
        ui.populateMaterialRequestTable();
        ui.populateMaterialReceiptTable();
        ui.populateMaterialUsageTable();
        ui.populateStockAdjustmentTable();
        ui.populateStockDestructionTable();
        ui.populateStockTransferTable();
        bindEventHandlers();
        utils.hideLoader();
    } catch (err) {
        utils.hideLoader();
        utils.showError("Gagal inisialisasi aplikasi. Silakan refresh!");
        console.error(err);
    }
};

// Event Handler Semua Tabel
function bindEventHandlers() {
    // MASTER DATA MATERIAL
    document.querySelector('#masterDataTable')?.addEventListener('click', function(e){
        if (e.target.closest('.edit-material')) {
            let code = e.target.closest('.edit-material').dataset.code;
            editMaterial(code);
        } else if (e.target.closest('.delete-material')) {
            let code = e.target.closest('.delete-material').dataset.code;
            deleteMaterial(code);
        }
    });

    // PERMINTAAN
    document.querySelector('#materialRequestTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-request')) {
            let num = e.target.closest('.view-request').dataset.number;
            viewRequest(num);
        } else if (e.target.closest('.edit-request')) {
            let num = e.target.closest('.edit-request').dataset.number;
            editRequest(num);
        } else if (e.target.closest('.delete-request')) {
            let num = e.target.closest('.delete-request').dataset.number;
            deleteRequest(num);
        }
    });

    // PENERIMAAN
    document.querySelector('#receiptsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-receipt')) {
            let num = e.target.closest('.view-receipt').dataset.number;
            viewReceipt(num);
        } else if (e.target.closest('.edit-receipt')) {
            let num = e.target.closest('.edit-receipt').dataset.number;
            editReceipt(num);
        } else if (e.target.closest('.delete-receipt')) {
            let num = e.target.closest('.delete-receipt').dataset.number;
            deleteReceipt(num);
        }
    });

    // PENGGUNAAN
    document.querySelector('#usagesTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-usage')) {
            let num = e.target.closest('.view-usage').dataset.number;
            viewUsage(num);
        } else if (e.target.closest('.edit-usage')) {
            let num = e.target.closest('.edit-usage').dataset.number;
            editUsage(num);
        } else if (e.target.closest('.delete-usage')) {
            let num = e.target.closest('.delete-usage').dataset.number;
            deleteUsage(num);
        }
    });

    // PENYESUAIAN
    document.querySelector('#adjustmentsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-adjustment')) {
            let num = e.target.closest('.view-adjustment').dataset.number;
            viewAdjustment(num);
        } else if (e.target.closest('.edit-adjustment')) {
            let num = e.target.closest('.edit-adjustment').dataset.number;
            editAdjustment(num);
        } else if (e.target.closest('.delete-adjustment')) {
            let num = e.target.closest('.delete-adjustment').dataset.number;
            deleteAdjustment(num);
        }
    });

    // PEMUSNAHAN
    document.querySelector('#destructionsTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-destruction')) {
            let num = e.target.closest('.view-destruction').dataset.number;
            viewDestruction(num);
        } else if (e.target.closest('.edit-destruction')) {
            let num = e.target.closest('.edit-destruction').dataset.number;
            editDestruction(num);
        } else if (e.target.closest('.delete-destruction')) {
            let num = e.target.closest('.delete-destruction').dataset.number;
            deleteDestruction(num);
        }
    });

    // TRANSFER
    document.querySelector('#transfersTable')?.addEventListener('click', function(e){
        if (e.target.closest('.view-transfer')) {
            let num = e.target.closest('.view-transfer').dataset.number;
            viewTransfer(num);
        } else if (e.target.closest('.edit-transfer')) {
            let num = e.target.closest('.edit-transfer').dataset.number;
            editTransfer(num);
        } else if (e.target.closest('.delete-transfer')) {
            let num = e.target.closest('.delete-transfer').dataset.number;
            deleteTransfer(num);
        }
    });
}

// ========== FUNGSI CRUD (SALIN DARI FILE ASLI ANDA) ==========
// Anda tinggal copy isi fungsi dari file asli ke bawah ini, atau isi dengan logic baru

// Save material
        async function saveMaterial() {
            const code = document.getElementById('materialCode').value;
            const name = document.getElementById('materialName').value;
            const category = document.getElementById('materialCategory').value;
            const unit = document.getElementById('materialUnit').value;
            const minStock = document.getElementById('materialMinStock').value || 0;
            const isExpirable = document.getElementById('materialIsExpirable').checked;
            const notes = document.getElementById('materialNotes').value;
            
            if (!code || !name || !category || !unit) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            try {
                const materialData = [
                    code,
                    name,
                    category,
                    unit,
                    minStock,
                    isExpirable ? 'TRUE' : 'FALSE',
                    notes || ''
                ];
                
                // Check if material already exists
                const existingIndex = materials.findIndex(m => m.code === code);
                
                if (existingIndex >= 0) {
                    // Update existing material
                    materials[existingIndex] = {
                        code, name, category, unit, minStock, isExpirable, notes
                    };
                    
                    // Find the row in Google Sheets (in a real app, you'd need to know the row number)
                    // This is simplified - in reality you'd need to get the range first
                    await updateSheet('Materials', `A${existingIndex + 2}:G${existingIndex + 2}`, [materialData]);
                    
                    showSuccess('Material berhasil diperbarui');
                } else {
                    // Add new material
                    materials.push({
                        code, name, category, unit, minStock, isExpirable, notes
                    });
                    
                    await appendToSheet('Materials', [materialData]);
                    
                    showSuccess('Material berhasil ditambahkan');
                }
                
                // Refresh materials table and dropdowns
                populateMaterialsTable();
                populateMaterialDropdowns();
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addMaterialModal')).hide();
                
                // Reset form
                document.getElementById('materialForm').reset();
            } catch (error) {
                console.error('Error saving material:', error);
                showError('Gagal menyimpan material. Silakan coba lagi.');
            }
        }
        
        // Edit material
        function editMaterial(code) {
            const material = materials.find(m => m.code === code);
            if (!material) return;
            
            document.getElementById('materialCode').value = material.code;
            document.getElementById('materialName').value = material.name;
            document.getElementById('materialCategory').value = material.category;
            document.getElementById('materialUnit').value = material.unit;
            document.getElementById('materialMinStock').value = material.minStock;
            document.getElementById('materialIsExpirable').checked = material.isExpirable;
            document.getElementById('materialNotes').value = material.notes || '';
            
            const modal = new bootstrap.Modal(document.getElementById('addMaterialModal'));
            modal.show();
        }
        
        // Delete material
        async function deleteMaterial(code) {
            try {
                const confirmDelete = await Swal.fire({
                    title: 'Hapus Material?',
                    text: `Anda yakin ingin menghapus material ${code}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Hapus',
                    cancelButtonText: 'Batal'
                });
                
                if (confirmDelete.isConfirmed) {
                    // Find the material
                    const index = materials.findIndex(m => m.code === code);
                    if (index < 0) return;
                    
                    // In a real app, you would delete the row from Google Sheets
                    // This is simplified - you'd need to know the row number
                    // await deleteFromSheet('Materials', `A${index + 2}:G${index + 2}`);
                    
                    // Remove from local array
                    materials.splice(index, 1);
                    
                    // Refresh table
                    populateMaterialsTable();
                    populateMaterialDropdowns();
                    
                    showSuccess('Material berhasil dihapus');
                }
            } catch (error) {
                console.error('Error deleting material:', error);
                showError('Gagal menghapus material. Silakan coba lagi.');
            }
        }
        
        // Add request item
        function addRequestItem() {
            const tableBody = document.querySelector('#requestItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="form-control qty" min="1" value="1"></td>
                <td class="unit">-</td>
                <td><input type="text" class="form-control purpose"></td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const material = materials.find(m => m.code === code);
                if (material) {
                    row.querySelector('.unit').textContent = material.unit;
                } else {
                    row.querySelector('.unit').textContent = '-';
                }
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit request
        async function submitRequest() {
            const number = document.getElementById('requestNumber').value;
            const date = document.getElementById('requestDate').value;
            const training = document.getElementById('requestTraining').value;
            const notes = document.getElementById('requestNotes').value;
            
            if (!number || !date || !training) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#requestItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            rows.forEach(row => {
                const materialCode = row.querySelector('.material-select').value;
                const quantity = parseFloat(row.querySelector('.qty').value) || 0;
                const purpose = row.querySelector('.purpose').value;
                
                if (!materialCode || quantity <= 0) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                items.push({
                    materialCode,
                    quantity,
                    purpose
                });
            });
            
            try {
                // Save request header
                const requestData = [
                    number,
                    date,
                    training,
                    'Draft',
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('MaterialRequests', [requestData]);
                
                // Save request items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.quantity,
                    item.purpose
                ]);
                
                await appendToSheet('MaterialRequestItems', itemData);
                
                // Add to local array
                requests.push({
                    number,
                    date,
                    training,
                    status: 'Draft',
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Permintaan Material', number, '', 0, '', currentUser);
                
                // Refresh table
                populateMaterialRequestTable();
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addRequestModal')).hide();
                
                // Reset form
                document.getElementById('requestForm').reset();
                document.querySelector('#requestItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Permintaan material berhasil disimpan');
            } catch (error) {
                console.error('Error saving request:', error);
                showError('Gagal menyimpan permintaan material. Silakan coba lagi.');
            }
        }
        
        // View request
        function viewRequest(number) {
            const request = requests.find(r => r.number === number);
            if (!request) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Permintaan Material #${request.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${request.date}</p>
                    <p class="mb-1"><strong>Pelatihan:</strong> ${request.training}</p>
                    <p class="mb-1"><strong>Status:</strong> <span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span></p>
                    <p class="mb-1"><strong>Dibuat Oleh:</strong> ${request.createdBy}</p>
                    ${request.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${request.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Material</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Qty</th>
                                <th>Satuan</th>
                                <th>Kebutuhan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${request.items ? request.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.quantity}</td>
                                        <td>${material ? material.unit : '-'}</td>
                                        <td>${item.purpose || '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="4">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        // Edit request
        function editRequest(number) {
            // Similar to view but with editable fields
            // Implementation would be similar to the add request but with existing data
            showInfo('Fitur edit permintaan akan diimplementasikan');
        }
        
        // Delete request
        async function deleteRequest(number) {
            try {
                const confirmDelete = await Swal.fire({
                    title: 'Hapus Permintaan?',
                    text: `Anda yakin ingin menghapus permintaan ${number}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Hapus',
                    cancelButtonText: 'Batal'
                });
                
                if (confirmDelete.isConfirmed) {
                    // Find the request
                    const index = requests.findIndex(r => r.number === number);
                    if (index < 0) return;
                    
                    // In a real app, you would delete the rows from Google Sheets
                    // This is simplified - you'd need to know the row numbers
                    // await deleteFromSheet('MaterialRequests', row range);
                    // await deleteFromSheet('MaterialRequestItems', rows where number matches);
                    
                    // Remove from local array
                    requests.splice(index, 1);
                    
                    // Refresh table
                    populateMaterialRequestTable();
                    
                    showSuccess('Permintaan berhasil dihapus');
                }
            } catch (error) {
                console.error('Error deleting request:', error);
                showError('Gagal menghapus permintaan. Silakan coba lagi.');
            }
        }
        
        // Add receipt item
        function addReceiptItem() {
            const tableBody = document.querySelector('#receiptItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="text" class="form-control batch"></td>
                <td><input type="number" class="form-control qty" min="1" value="1"></td>
                <td class="unit">-</td>
                <td><input type="date" class="form-control expiry-date"></td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const material = materials.find(m => m.code === code);
                if (material) {
                    row.querySelector('.unit').textContent = material.unit;
                    row.querySelector('.expiry-date').disabled = !material.isExpirable;
                    if (!material.isExpirable) {
                        row.querySelector('.expiry-date').value = '';
                    }
                } else {
                    row.querySelector('.unit').textContent = '-';
                    row.querySelector('.expiry-date').disabled = false;
                }
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit receipt
        async function submitReceipt() {
            const number = document.getElementById('receiptNumber').value;
            const date = document.getElementById('receiptDate').value;
            const supplier = document.getElementById('receiptSupplier').value;
            const poNumber = document.getElementById('receiptPONumber').value;
            const location = document.getElementById('receiptLocation').value;
            const notes = document.getElementById('receiptNotes').value;
            
            if (!number || !date || !location) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#receiptItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            rows.forEach(row => {
                const materialCode = row.querySelector('.material-select').value;
                const batch = row.querySelector('.batch').value || '-';
                const quantity = parseFloat(row.querySelector('.qty').value) || 0;
                const expiryDate = row.querySelector('.expiry-date').value;
                
                if (!materialCode || quantity <= 0) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                const material = materials.find(m => m.code === materialCode);
                if (material && material.isExpirable && !expiryDate) {
                    showError('Harap isi tanggal kadaluarsa untuk material yang expirable');
                    return;
                }
                
                items.push({
                    materialCode,
                    batch,
                    quantity,
                    expiryDate: material && material.isExpirable ? expiryDate : null
                });
            });
            
            try {
                // Save receipt header
                const receiptData = [
                    number,
                    date,
                    supplier || '',
                    poNumber || '',
                    location,
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('MaterialReceipts', [receiptData]);
                
                // Save receipt items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.batch,
                    item.quantity,
                    item.expiryDate || ''
                ]);
                
                await appendToSheet('MaterialReceiptItems', itemData);
                
                // Update stock
                for (const item of items) {
                    await updateStock(item.materialCode, item.batch, item.quantity, location, item.expiryDate);
                }
                
                // Add to local array
                receipts.push({
                    number,
                    date,
                    supplier: supplier || '',
                    poNumber: poNumber || '',
                    location,
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Penerimaan Material', number, '', 0, location, currentUser);
                
                // Refresh tables
                populateMaterialReceiptTable();
                loadStockData(); // Refresh stock data
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addReceiptModal')).hide();
                
                // Reset form
                document.getElementById('receiptForm').reset();
                document.querySelector('#receiptItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Penerimaan material berhasil disimpan');
            } catch (error) {
                console.error('Error saving receipt:', error);
                showError('Gagal menyimpan penerimaan material. Silakan coba lagi.');
            }
        }
        
        // View receipt
        function viewReceipt(number) {
            const receipt = receipts.find(r => r.number === number);
            if (!receipt) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Penerimaan Material #${receipt.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${receipt.date}</p>
                    ${receipt.supplier ? `<p class="mb-1"><strong>Supplier:</strong> ${receipt.supplier}</p>` : ''}
                    ${receipt.poNumber ? `<p class="mb-1"><strong>No. PO:</strong> ${receipt.poNumber}</p>` : ''}
                    <p class="mb-1"><strong>Lokasi:</strong> ${receipt.location}</p>
                    <p class="mb-1"><strong>Dibuat Oleh:</strong> ${receipt.createdBy}</p>
                    ${receipt.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${receipt.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Material</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Batch</th>
                                <th>Qty</th>
                                <th>Satuan</th>
                                <th>Expired Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipt.items ? receipt.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.batch || '-'}</td>
                                        <td>${item.quantity}</td>
                                        <td>${material ? material.unit : '-'}</td>
                                        <td>${item.expiryDate || '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="5">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        // Add usage item
        function addUsageItem() {
            const location = document.getElementById('usageLocation').value;
            if (!location) {
                showError('Harap isi lokasi pengambilan terlebih dahulu');
                return;
            }
            
            const tableBody = document.querySelector('#usageItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select batch-select" disabled>
                        <option value="">Pilih Batch</option>
                    </select>
                </td>
                <td class="available-qty">0</td>
                <td><input type="number" class="form-control qty" min="1" value="1" disabled></td>
                <td class="unit">-</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const material = materials.find(m => m.code === code);
                const batchSelect = row.querySelector('.batch-select');
                
                if (material) {
                    row.querySelector('.unit').textContent = material.unit;
                    
                    // Get available batches for this material in the selected location
                    const batches = stockData.filter(item => 
                        item.materialCode === code && 
                        item.location === location && 
                        item.quantity > 0
                    );
                    
                    if (batches.length > 0) {
                        batchSelect.innerHTML = '<option value="">Pilih Batch</option>' + 
                            batches.map(b => `<option value="${b.batch}" data-qty="${b.quantity}">${b.batch} (${b.quantity} ${material.unit})</option>`).join('');
                        batchSelect.disabled = false;
                    } else {
                        batchSelect.innerHTML = '<option value="">Tidak ada stok</option>';
                        batchSelect.disabled = true;
                        row.querySelector('.available-qty').textContent = '0';
                        row.querySelector('.qty').disabled = true;
                    }
                } else {
                    row.querySelector('.unit').textContent = '-';
                    batchSelect.innerHTML = '<option value="">Pilih Material terlebih dahulu</option>';
                    batchSelect.disabled = true;
                    row.querySelector('.available-qty').textContent = '0';
                    row.querySelector('.qty').disabled = true;
                }
            });
            
            // Add event listener to batch select
            row.querySelector('.batch-select').addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const availableQty = parseFloat(selectedOption.getAttribute('data-qty')) || 0;
                row.querySelector('.available-qty').textContent = availableQty;
                row.querySelector('.qty').disabled = availableQty <= 0;
                if (availableQty > 0) {
                    row.querySelector('.qty').max = availableQty;
                    row.querySelector('.qty').value = 1;
                }
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit usage
        async function submitUsage() {
            const number = document.getElementById('usageNumber').value;
            const date = document.getElementById('usageDate').value;
            const training = document.getElementById('usageTraining').value;
            const location = document.getElementById('usageLocation').value;
            const notes = document.getElementById('usageNotes').value;
            
            if (!number || !date || !training || !location) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#usageItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            for (const row of rows) {
                const materialCode = row.querySelector('.material-select').value;
                const batch = row.querySelector('.batch-select').value;
                const quantity = parseFloat(row.querySelector('.qty').value) || 0;
                const availableQty = parseFloat(row.querySelector('.available-qty').textContent) || 0;
                
                if (!materialCode || !batch || quantity <= 0) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                if (quantity > availableQty) {
                    showError('Quantity tidak boleh melebihi stok yang tersedia');
                    return;
                }
                
                items.push({
                    materialCode,
                    batch,
                    quantity
                });
            }
            
            try {
                // Save usage header
                const usageData = [
                    number,
                    date,
                    training,
                    location,
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('MaterialUsages', [usageData]);
                
                // Save usage items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.batch,
                    item.quantity
                ]);
                
                await appendToSheet('MaterialUsageItems', itemData);
                
                // Update stock (reduce quantity)
                for (const item of items) {
                    await updateStock(item.materialCode, item.batch, -item.quantity, location);
                }
                
                // Add to local array
                usages.push({
                    number,
                    date,
                    training,
                    location,
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Pengeluaran Material', number, '', 0, location, currentUser);
                
                // Refresh tables
                populateMaterialUsageTable();
                loadStockData(); // Refresh stock data
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addUsageModal')).hide();
                
                // Reset form
                document.getElementById('usageForm').reset();
                document.querySelector('#usageItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Pengeluaran material berhasil disimpan');
            } catch (error) {
                console.error('Error saving usage:', error);
                showError('Gagal menyimpan pengeluaran material. Silakan coba lagi.');
            }
        }
        
        // View usage
        function viewUsage(number) {
            const usage = usages.find(u => u.number === number);
            if (!usage) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Pengeluaran Material #${usage.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${usage.date}</p>
                    <p class="mb-1"><strong>Pelatihan:</strong> ${usage.training}</p>
                    <p class="mb-1"><strong>Lokasi:</strong> ${usage.location}</p>
                    <p class="mb-1"><strong>Dikeluarkan Oleh:</strong> ${usage.createdBy}</p>
                    ${usage.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${usage.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Material</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Batch</th>
                                <th>Qty</th>
                                <th>Satuan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usage.items ? usage.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.batch || '-'}</td>
                                        <td>${item.quantity}</td>
                                        <td>${material ? material.unit : '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="4">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        // Add adjustment item
        function addAdjustmentItem() {
            const location = document.getElementById('adjustmentLocation').value;
            if (!location) {
                showError('Harap isi lokasi terlebih dahulu');
                return;
            }
            
            const tableBody = document.querySelector('#adjustmentItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select batch-select" disabled>
                        <option value="">Pilih Batch</option>
                    </select>
                </td>
                <td class="system-qty">0</td>
                <td><input type="number" class="form-control physical-qty" min="0" value="0"></td>
                <td class="difference">0</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const batchSelect = row.querySelector('.batch-select');
                
                if (code) {
                    // Get available batches for this material in the selected location
                    const batches = stockData.filter(item => 
                        item.materialCode === code && 
                        item.location === location
                    );
                    
                    if (batches.length > 0) {
                        batchSelect.innerHTML = '<option value="">Pilih Batch</option>' + 
                            batches.map(b => `<option value="${b.batch}" data-qty="${b.quantity}">${b.batch} (${b.quantity})</option>`).join('');
                        batchSelect.disabled = false;
                    } else {
                        batchSelect.innerHTML = '<option value="">Tidak ada stok</option>';
                        batchSelect.disabled = true;
                        row.querySelector('.system-qty').textContent = '0';
                        row.querySelector('.physical-qty').value = '0';
                        row.querySelector('.difference').textContent = '0';
                    }
                } else {
                    batchSelect.innerHTML = '<option value="">Pilih Material terlebih dahulu</option>';
                    batchSelect.disabled = true;
                    row.querySelector('.system-qty').textContent = '0';
                    row.querySelector('.physical-qty').value = '0';
                    row.querySelector('.difference').textContent = '0';
                }
            });
            
            // Add event listener to batch select
            row.querySelector('.batch-select').addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const systemQty = parseFloat(selectedOption.getAttribute('data-qty')) || 0;
                row.querySelector('.system-qty').textContent = systemQty;
                row.querySelector('.physical-qty').value = systemQty;
                row.querySelector('.difference').textContent = '0';
            });
            
            // Add event listener to physical qty input
            row.querySelector('.physical-qty').addEventListener('input', function() {
                const systemQty = parseFloat(row.querySelector('.system-qty').textContent) || 0;
                const physicalQty = parseFloat(this.value) || 0;
                const difference = physicalQty - systemQty;
                row.querySelector('.difference').textContent = difference;
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit adjustment
        async function submitAdjustment() {
            const number = document.getElementById('adjustmentNumber').value;
            const date = document.getElementById('adjustmentDate').value;
            const location = document.getElementById('adjustmentLocation').value;
            const reason = document.getElementById('adjustmentReason').value;
            const notes = document.getElementById('adjustmentNotes').value;
            
            if (!number || !date || !location || !reason) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#adjustmentItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            for (const row of rows) {
                const materialCode = row.querySelector('.material-select').value;
                const batch = row.querySelector('.batch-select').value;
                const systemQty = parseFloat(row.querySelector('.system-qty').textContent) || 0;
                const physicalQty = parseFloat(row.querySelector('.physical-qty').value) || 0;
                const difference = parseFloat(row.querySelector('.difference').textContent) || 0;
                
                if (!materialCode || !batch) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                items.push({
                    materialCode,
                    batch,
                    systemQty,
                    physicalQty,
                    difference
                });
            }
            
            try {
                // Save adjustment header
                const adjustmentData = [
                    number,
                    date,
                    location,
                    reason,
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('StockAdjustments', [adjustmentData]);
                
                // Save adjustment items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.batch,
                    item.systemQty,
                    item.physicalQty,
                    item.difference
                ]);
                
                await appendToSheet('StockAdjustmentItems', itemData);
                
                // Update stock (adjust to physical quantity)
                for (const item of items) {
                    const currentStock = stockData.find(s => 
                        s.materialCode === item.materialCode && 
                        s.batch === item.batch && 
                        s.location === location
                    );
                    
                    if (currentStock) {
                        const adjustmentQty = item.physicalQty - currentStock.quantity;
                        await updateStock(item.materialCode, item.batch, adjustmentQty, location, currentStock.expiryDate);
                    }
                }
                
                // Add to local array
                adjustments.push({
                    number,
                    date,
                    location,
                    reason,
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Penyesuaian Stok', number, '', 0, location, currentUser);
                
                // Refresh tables
                populateStockAdjustmentTable();
                loadStockData(); // Refresh stock data
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addAdjustmentModal')).hide();
                
                // Reset form
                document.getElementById('adjustmentForm').reset();
                document.querySelector('#adjustmentItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Penyesuaian stok berhasil disimpan');
            } catch (error) {
                console.error('Error saving adjustment:', error);
                showError('Gagal menyimpan penyesuaian stok. Silakan coba lagi.');
            }
        }
        
        // View adjustment
        function viewAdjustment(number) {
            const adjustment = adjustments.find(a => a.number === number);
            if (!adjustment) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Penyesuaian Stok #${adjustment.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${adjustment.date}</p>
                    <p class="mb-1"><strong>Lokasi:</strong> ${adjustment.location}</p>
                    <p class="mb-1"><strong>Alasan:</strong> ${adjustment.reason}</p>
                    <p class="mb-1"><strong>Dilakukan Oleh:</strong> ${adjustment.createdBy}</p>
                    ${adjustment.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${adjustment.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Penyesuaian</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Batch</th>
                                <th>Qty Sistem</th>
                                <th>Qty Fisik</th>
                                <th>Selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${adjustment.items ? adjustment.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.batch || '-'}</td>
                                        <td>${item.systemQty}</td>
                                        <td>${item.physicalQty}</td>
                                        <td class="${item.difference > 0 ? 'text-success' : 'text-danger'}">
                                            ${item.difference > 0 ? '+' : ''}${item.difference}
                                        </td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="5">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        // Add destruction item
        function addDestructionItem() {
            const location = document.getElementById('destructionLocation').value;
            if (!location) {
                showError('Harap isi lokasi terlebih dahulu');
                return;
            }
            
            const tableBody = document.querySelector('#destructionItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select batch-select" disabled>
                        <option value="">Pilih Batch</option>
                    </select>
                </td>
                <td class="available-qty">0</td>
                <td><input type="number" class="form-control qty" min="1" value="1" disabled></td>
                <td class="unit">-</td>
                <td class="expiry-date">-</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const material = materials.find(m => m.code === code);
                const batchSelect = row.querySelector('.batch-select');
                
                if (material) {
                    row.querySelector('.unit').textContent = material.unit;
                    
                    // Get available batches for this material in the selected location
                    const batches = stockData.filter(item => 
                        item.materialCode === code && 
                        item.location === location && 
                        item.quantity > 0
                    );
                    
                    if (batches.length > 0) {
                        batchSelect.innerHTML = '<option value="">Pilih Batch</option>' + 
                            batches.map(b => `<option value="${b.batch}" data-qty="${b.quantity}" data-expiry="${b.expiryDate || ''}">${b.batch} (${b.quantity})</option>`).join('');
                        batchSelect.disabled = false;
                    } else {
                        batchSelect.innerHTML = '<option value="">Tidak ada stok</option>';
                        batchSelect.disabled = true;
                        row.querySelector('.available-qty').textContent = '0';
                        row.querySelector('.qty').disabled = true;
                        row.querySelector('.expiry-date').textContent = '-';
                    }
                } else {
                    row.querySelector('.unit').textContent = '-';
                    batchSelect.innerHTML = '<option value="">Pilih Material terlebih dahulu</option>';
                    batchSelect.disabled = true;
                    row.querySelector('.available-qty').textContent = '0';
                    row.querySelector('.qty').disabled = true;
                    row.querySelector('.expiry-date').textContent = '-';
                }
            });
            
            // Add event listener to batch select
            row.querySelector('.batch-select').addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const availableQty = parseFloat(selectedOption.getAttribute('data-qty')) || 0;
                const expiryDate = selectedOption.getAttribute('data-expiry') || '-';
                
                row.querySelector('.available-qty').textContent = availableQty;
                row.querySelector('.qty').disabled = availableQty <= 0;
                row.querySelector('.expiry-date').textContent = expiryDate;
                
                if (availableQty > 0) {
                    row.querySelector('.qty').max = availableQty;
                    row.querySelector('.qty').value = 1;
                }
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit destruction
        async function submitDestruction() {
            const number = document.getElementById('destructionNumber').value;
            const date = document.getElementById('destructionDate').value;
            const location = document.getElementById('destructionLocation').value;
            const reason = document.getElementById('destructionReason').value;
            const method = document.getElementById('destructionMethod').value;
            const notes = document.getElementById('destructionNotes').value;
            
            if (!number || !date || !location || !reason || !method) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#destructionItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            for (const row of rows) {
                const materialCode = row.querySelector('.material-select').value;
                const batch = row.querySelector('.batch-select').value;
                const quantity = parseFloat(row.querySelector('.qty').value) || 0;
                const availableQty = parseFloat(row.querySelector('.available-qty').textContent) || 0;
                
                if (!materialCode || !batch || quantity <= 0) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                if (quantity > availableQty) {
                    showError('Quantity tidak boleh melebihi stok yang tersedia');
                    return;
                }
                
                items.push({
                    materialCode,
                    batch,
                    quantity,
                    expiryDate: row.querySelector('.expiry-date').textContent !== '-' ? 
                        row.querySelector('.expiry-date').textContent : null
                });
            }
            
            try {
                // Save destruction header
                const destructionData = [
                    number,
                    date,
                    location,
                    reason,
                    method,
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('StockDestructions', [destructionData]);
                
                // Save destruction items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.batch,
                    item.quantity,
                    item.expiryDate || ''
                ]);
                
                await appendToSheet('StockDestructionItems', itemData);
                
                // Update stock (reduce quantity)
                for (const item of items) {
                    await updateStock(item.materialCode, item.batch, -item.quantity, location);
                }
                
                // Add to local array
                destructions.push({
                    number,
                    date,
                    location,
                    reason,
                    method,
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Pemusnahan Stok', number, '', 0, location, currentUser);
                
                // Refresh tables
                populateStockDestructionTable();
                loadStockData(); // Refresh stock data
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addDestructionModal')).hide();
                
                // Reset form
                document.getElementById('destructionForm').reset();
                document.querySelector('#destructionItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Pemusnahan stok berhasil disimpan');
            } catch (error) {
                console.error('Error saving destruction:', error);
                showError('Gagal menyimpan pemusnahan stok. Silakan coba lagi.');
            }
        }
        
        // View destruction
        function viewDestruction(number) {
            const destruction = destructions.find(d => d.number === number);
            if (!destruction) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Pemusnahan Stok #${destruction.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${destruction.date}</p>
                    <p class="mb-1"><strong>Lokasi:</strong> ${destruction.location}</p>
                    <p class="mb-1"><strong>Alasan:</strong> ${destruction.reason}</p>
                    <p class="mb-1"><strong>Metode:</strong> ${destruction.method}</p>
                    <p class="mb-1"><strong>Dilakukan Oleh:</strong> ${destruction.createdBy}</p>
                    ${destruction.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${destruction.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Pemusnahan</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Batch</th>
                                <th>Qty</th>
                                <th>Satuan</th>
                                <th>Expired Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${destruction.items ? destruction.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.batch || '-'}</td>
                                        <td>${item.quantity}</td>
                                        <td>${material ? material.unit : '-'}</td>
                                        <td>${item.expiryDate || '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="5">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        // Add transfer item
        function addTransferItem() {
            const fromLocation = document.getElementById('transferFrom').value;
            if (!fromLocation) {
                showError('Harap isi lokasi asal terlebih dahulu');
                return;
            }
            
            const tableBody = document.querySelector('#transferItemsTable tbody');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="form-select material-select">
                        <option value="">Pilih Material</option>
                        ${materials.map(m => `<option value="${m.code}">${m.code} - ${m.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select batch-select" disabled>
                        <option value="">Pilih Batch</option>
                    </select>
                </td>
                <td class="available-qty">0</td>
                <td><input type="number" class="form-control qty" min="1" value="1" disabled></td>
                <td class="unit">-</td>
                <td class="expiry-date">-</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Add event listener to material select
            row.querySelector('.material-select').addEventListener('change', function() {
                const code = this.value;
                const material = materials.find(m => m.code === code);
                const batchSelect = row.querySelector('.batch-select');
                
                if (material) {
                    row.querySelector('.unit').textContent = material.unit;
                    
                    // Get available batches for this material in the from location
                    const batches = stockData.filter(item => 
                        item.materialCode === code && 
                        item.location === fromLocation && 
                        item.quantity > 0
                    );
                    
                    if (batches.length > 0) {
                        batchSelect.innerHTML = '<option value="">Pilih Batch</option>' + 
                            batches.map(b => `<option value="${b.batch}" data-qty="${b.quantity}" data-expiry="${b.expiryDate || ''}">${b.batch} (${b.quantity})</option>`).join('');
                        batchSelect.disabled = false;
                    } else {
                        batchSelect.innerHTML = '<option value="">Tidak ada stok</option>';
                        batchSelect.disabled = true;
                        row.querySelector('.available-qty').textContent = '0';
                        row.querySelector('.qty').disabled = true;
                        row.querySelector('.expiry-date').textContent = '-';
                    }
                } else {
                    row.querySelector('.unit').textContent = '-';
                    batchSelect.innerHTML = '<option value="">Pilih Material terlebih dahulu</option>';
                    batchSelect.disabled = true;
                    row.querySelector('.available-qty').textContent = '0';
                    row.querySelector('.qty').disabled = true;
                    row.querySelector('.expiry-date').textContent = '-';
                }
            });
            
            // Add event listener to batch select
            row.querySelector('.batch-select').addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const availableQty = parseFloat(selectedOption.getAttribute('data-qty')) || 0;
                const expiryDate = selectedOption.getAttribute('data-expiry') || '-';
                
                row.querySelector('.available-qty').textContent = availableQty;
                row.querySelector('.qty').disabled = availableQty <= 0;
                row.querySelector('.expiry-date').textContent = expiryDate;
                
                if (availableQty > 0) {
                    row.querySelector('.qty').max = availableQty;
                    row.querySelector('.qty').value = 1;
                }
            });
            
            // Add event listener to remove button
            row.querySelector('.remove-item').addEventListener('click', function() {
                row.remove();
            });
        }
        
        // Submit transfer
        async function submitTransfer() {
            const number = document.getElementById('transferNumber').value;
            const date = document.getElementById('transferDate').value;
            const fromLocation = document.getElementById('transferFrom').value;
            const toLocation = document.getElementById('transferTo').value;
            const notes = document.getElementById('transferNotes').value;
            
            if (!number || !date || !fromLocation || !toLocation) {
                showError('Harap isi semua field yang wajib diisi');
                return;
            }
            
            if (fromLocation === toLocation) {
                showError('Lokasi asal dan tujuan tidak boleh sama');
                return;
            }
            
            const items = [];
            const tableBody = document.querySelector('#transferItemsTable tbody');
            const rows = tableBody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                showError('Harap tambahkan minimal satu item material');
                return;
            }
            
            for (const row of rows) {
                const materialCode = row.querySelector('.material-select').value;
                const batch = row.querySelector('.batch-select').value;
                const quantity = parseFloat(row.querySelector('.qty').value) || 0;
                const availableQty = parseFloat(row.querySelector('.available-qty').textContent) || 0;
                
                if (!materialCode || !batch || quantity <= 0) {
                    showError('Harap isi semua field item dengan benar');
                    return;
                }
                
                if (quantity > availableQty) {
                    showError('Quantity tidak boleh melebihi stok yang tersedia');
                    return;
                }
                
                items.push({
                    materialCode,
                    batch,
                    quantity,
                    expiryDate: row.querySelector('.expiry-date').textContent !== '-' ? 
                        row.querySelector('.expiry-date').textContent : null
                });
            }
            
            try {
                // Save transfer header
                const transferData = [
                    number,
                    date,
                    fromLocation,
                    toLocation,
                    currentUser,
                    notes || ''
                ];
                
                await appendToSheet('StockTransfers', [transferData]);
                
                // Save transfer items
                const itemData = items.map(item => [
                    number,
                    item.materialCode,
                    item.batch,
                    item.quantity,
                    item.expiryDate || ''
                ]);
                
                await appendToSheet('StockTransferItems', itemData);
                
                // Update stock (reduce from source location, add to destination location)
                for (const item of items) {
                    // Reduce from source location
                    await updateStock(item.materialCode, item.batch, -item.quantity, fromLocation);
                    
                    // Add to destination location
                    await updateStock(item.materialCode, item.batch, item.quantity, toLocation, item.expiryDate);
                }
                
                // Add to local array
                transfers.push({
                    number,
                    date,
                    fromLocation,
                    toLocation,
                    createdBy: currentUser,
                    notes: notes || '',
                    items
                });
                
                // Add activity
                await addActivity(date, 'Transfer Stok', number, '', 0, `${fromLocation} → ${toLocation}`, currentUser);
                
                // Refresh tables
                populateStockTransferTable();
                loadStockData(); // Refresh stock data
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addTransferModal')).hide();
                
                // Reset form
                document.getElementById('transferForm').reset();
                document.querySelector('#transferItemsTable tbody').innerHTML = '';
                
                // Generate new document number
                generateDocumentNumbers();
                
                showSuccess('Transfer stok berhasil disimpan');
            } catch (error) {
                console.error('Error saving transfer:', error);
                showError('Gagal menyimpan transfer stok. Silakan coba lagi.');
            }
        }
        
        // View transfer
        function viewTransfer(number) {
            const transfer = transfers.find(t => t.number === number);
            if (!transfer) return;
            
            const modalContent = document.getElementById('detailModalContent');
            modalContent.innerHTML = `
                <div class="mb-4">
                    <h4>Transfer Stok #${transfer.number}</h4>
                    <p class="mb-1"><strong>Tanggal:</strong> ${transfer.date}</p>
                    <p class="mb-1"><strong>Dari Lokasi:</strong> ${transfer.fromLocation}</p>
                    <p class="mb-1"><strong>Ke Lokasi:</strong> ${transfer.toLocation}</p>
                    <p class="mb-1"><strong>Dilakukan Oleh:</strong> ${transfer.createdBy}</p>
                    ${transfer.notes ? `<p class="mb-1"><strong>Catatan:</strong> ${transfer.notes}</p>` : ''}
                </div>
                
                <h5>Daftar Transfer</h5>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Batch</th>
                                <th>Qty</th>
                                <th>Satuan</th>
                                <th>Expired Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transfer.items ? transfer.items.map(item => {
                                const material = materials.find(m => m.code === item.materialCode);
                                return `
                                    <tr>
                                        <td>${material ? material.name : item.materialCode}</td>
                                        <td>${item.batch || '-'}</td>
                                        <td>${item.quantity}</td>
                                        <td>${material ? material.unit : '-'}</td>
                                        <td>${item.expiryDate || '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="5">Tidak ada item</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewDetailModal'));
            modal.show();
        }
        
        
        // Calculate forecast
        function calculateForecast() {
            const materialCode = document.getElementById('forecastMaterial').value;
            const period = parseInt(document.getElementById('forecastPeriod').value) || 3;
            const method = document.getElementById('forecastMethod').value;
            
            if (!materialCode) {
                showError('Harap pilih material terlebih dahulu');
                return;
            }
            
            const material = materials.find(m => m.code === materialCode);
            if (!material) return;
            
            // In a real app, this would calculate based on historical usage data
            // For this example, we'll use random numbers
            
            // Generate random historical data
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            const currentMonth = new Date().getMonth();
            const historicalData = [];
            
            for (let i = 11; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                historicalData.push({
                    month: months[monthIndex],
                    usage: Math.floor(Math.random() * 100) + 10
                });
            }
            
            // Calculate forecast based on method
            let forecastValue;
            switch (method) {
                case 'average':
                    const sum = historicalData.reduce((acc, item) => acc + item.usage, 0);
                    forecastValue = Math.round(sum / historicalData.length);
                    break;
                case 'moving':
                    const lastThree = historicalData.slice(-3);
                    const movingSum = lastThree.reduce((acc, item) => acc + item.usage, 0);
                    forecastValue = Math.round(movingSum / 3);
                    break;
                case 'trend':
                    // Simple linear trend (in reality you'd use proper regression)
                    const first = historicalData[0].usage;
                    const last = historicalData[historicalData.length - 1].usage;
                    forecastValue = Math.round(last + (last - first) / historicalData.length);
                    break;
                default:
                    forecastValue = 0;
            }
            
            // Display results
            const forecastResult = document.getElementById('forecastResult');
            forecastResult.innerHTML = `
                <h5>${material.name} (${material.code})</h5>
                <p><strong>Metode Forecast:</strong> ${getForecastMethodName(method)}</p>
                <p><strong>Periode Forecast:</strong> ${period} bulan</p>
                <p><strong>Perkiraan Kebutuhan:</strong> ${forecastValue * period} ${material.unit}</p>
                <p><strong>Perkiraan Bulanan:</strong> ${forecastValue} ${material.unit}/bulan</p>
            `;
            
            // Update chart
            updateForecastChart(historicalData, forecastValue);
            
            // Update recommendation table
            updateRecommendationTable(material, forecastValue, period);
        }
        
        // Get forecast method name
        function getForecastMethodName(method) {
            switch (method) {
                case 'average': return 'Rata-rata Pemakaian';
                case 'moving': return 'Moving Average (3 bulan)';
                case 'trend': return 'Trend Analysis';
                default: return 'Unknown';
            }
        }
        
        // Update forecast chart
        function updateForecastChart(historicalData, forecastValue) {
            const ctx = document.getElementById('forecastChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.forecastChart) {
                window.forecastChart.destroy();
            }
            
            // Prepare data
            const labels = historicalData.map(item => item.month);
            const data = historicalData.map(item => item.usage);
            
            // Add forecast to the end
            labels.push('Forecast');
            data.push(forecastValue);
            
            // Create new chart
            window.forecastChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Pemakaian per Bulan',
                        data: data,
                        backgroundColor: [
                            ...Array(historicalData.length).fill('rgba(54, 162, 235, 0.7)'),
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderColor: [
                            ...Array(historicalData.length).fill('rgba(54, 162, 235, 1)'),
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantity'
                            }
                        }
                    }
                }
            });
        }
        
        // Update recommendation table
        function updateRecommendationTable(material, forecastValue, period) {
            const tableBody = document.querySelector('#forecastRecommendationTable tbody');
            tableBody.innerHTML = '';
            
            // Calculate current stock
            const currentStock = stockData
                .filter(item => item.materialCode === material.code)
                .reduce((sum, item) => sum + item.quantity, 0);
            
            // Calculate projected need
            const projectedNeed = forecastValue * period;
            
            // Calculate recommended purchase
            const minStock = material.minStock || 0;
            let recommendedPurchase = projectedNeed - currentStock;
            if (recommendedPurchase < 0) recommendedPurchase = 0;
            
            // Add buffer (20%)
            recommendedPurchase = Math.ceil(recommendedPurchase * 1.2);
            
            // Add row to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${material.name} (${material.code})</td>
                <td>${currentStock} ${material.unit}</td>
                <td>${forecastValue.toFixed(1)} ${material.unit}/bulan</td>
                <td>${projectedNeed} ${material.unit}</td>
                <td>${minStock} ${material.unit}</td>
                <td class="fw-bold">${recommendedPurchase} ${material.unit}</td>
                <td>7-14</td>
            `;
            tableBody.appendChild(row);
        }
        
        // Generate report
        function generateReport() {
            const reportType = document.getElementById('reportType').value;
            const startDate = document.getElementById('reportStartDate').value;
            const endDate = document.getElementById('reportEndDate').value;
            const materialCode = document.getElementById('reportMaterial').value;
            const location = document.getElementById('reportLocation').value;
            
            if (!reportType || !startDate || !endDate) {
                showError('Harap isi semua parameter laporan');
                return;
            }
            
            // Filter data based on report type
            let reportData = [];
            let columns = [];
            
            switch (reportType) {
                case 'stock':
                    reportData = generateStockReport(location);
                    columns = ['Kode Material', 'Nama Material', 'Batch', 'Qty', 'Satuan', 'Lokasi', 'Expired Date'];
                    break;
                case 'movement':
                    reportData = generateMovementReport(startDate, endDate, materialCode, location);
                    columns = ['Tanggal', 'Tipe', 'No. Dokumen', 'Material', 'Qty', 'Lokasi', 'User'];
                    break;
                case 'usage':
                    reportData = generateUsageReport(startDate, endDate, materialCode);
                    columns = ['Tanggal', 'No. Dokumen', 'Pelatihan', 'Material', 'Qty', 'Satuan', 'Lokasi'];
                    break;
                case 'expiry':
                    reportData = generateExpiryReport();
                    columns = ['Material', 'Batch', 'Qty', 'Satuan', 'Lokasi', 'Expired Date', 'Sisa Hari'];
                    break;
                case 'request':
                    reportData = generateRequestReport(startDate, endDate);
                    columns = ['No. Permintaan', 'Tanggal', 'Pelatihan', 'Status', 'Dibuat Oleh', 'Jumlah Item', 'Total Qty'];
                    break;
                default:
                    showError('Jenis laporan tidak valid');
                    return;
            }
            
            // Update report preview
            const reportPreview = document.getElementById('reportPreview');
            reportPreview.innerHTML = `
                <h5>Pratinjau Laporan</h5>
                <p><strong>Jenis Laporan:</strong> ${getReportTypeName(reportType)}</p>
                <p><strong>Periode:</strong> ${startDate} s/d ${endDate}</p>
                ${materialCode ? `<p><strong>Material:</strong> ${getMaterialName(materialCode)} (${materialCode})</p>` : ''}
                ${location ? `<p><strong>Lokasi:</strong> ${location}</p>` : ''}
                <p><strong>Jumlah Record:</strong> ${reportData.length}</p>
            `;
            
            // Update report detail table
            const tableHead = document.querySelector('#reportDetailTable thead');
            const tableBody = document.querySelector('#reportDetailTable tbody');
            
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
            
            // Add header row
            const headerRow = document.createElement('tr');
            columns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col;
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);
            
            // Add data rows
            reportData.forEach(rowData => {
                const row = document.createElement('tr');
                Object.values(rowData).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                tableBody.appendChild(row);
            });
        }
        
        // Get report type name
        function getReportTypeName(type) {
            switch (type) {
                case 'stock': return 'Laporan Stok';
                case 'movement': return 'Laporan Pergerakan Stok';
                case 'usage': return 'Laporan Pemakaian Material';
                case 'expiry': return 'Laporan Stok Kadaluarsa';
                case 'request': return 'Laporan Permintaan Material';
                default: return type;
            }
        }
        
        // Generate stock report
        function generateStockReport(location) {
            let filteredStock = [...stockData];
            
            if (location) {
                filteredStock = filteredStock.filter(item => item.location === location);
            }
            
            return filteredStock.map(item => {
                const material = materials.find(m => m.code === item.materialCode);
                return {
                    'Kode Material': item.materialCode,
                    'Nama Material': material ? material.name : item.materialCode,
                    'Batch': item.batch || '-',
                    'Qty': item.quantity,
                    'Satuan': material ? material.unit : '-',
                    'Lokasi': item.location,
                    'Expired Date': item.expiryDate || '-'
                };
            });
        }
        
        // Generate movement report
        function generateMovementReport(startDate, endDate, materialCode, location) {
            let filteredActivities = [...activities];
            
            // Filter by date
            filteredActivities = filteredActivities.filter(activity => {
                return activity.date >= startDate && activity.date <= endDate;
            });
            
            // Filter by material if specified
            if (materialCode) {
                filteredActivities = filteredActivities.filter(activity => 
                    activity.materialCode === materialCode
                );
            }
            
            // Filter by location if specified
            if (location) {
                filteredActivities = filteredActivities.filter(activity => 
                    activity.location.includes(location)
                );
            }
            
            return filteredActivities.map(activity => {
                const material = materials.find(m => m.code === activity.materialCode);
                return {
                    'Tanggal': activity.date,
                    'Tipe': activity.type,
                    'No. Dokumen': activity.documentNumber,
                    'Material': material ? material.name : activity.materialCode,
                    'Qty': activity.quantity,
                    'Lokasi': activity.location,
                    'User': activity.user
                };
            });
        }
        
        // Generate usage report
        function generateUsageReport(startDate, endDate, materialCode) {
            let filteredUsages = [...usages];
            
            // Filter by date
            filteredUsages = filteredUsages.filter(usage => {
                return usage.date >= startDate && usage.date <= endDate;
            });
            
            // Filter by material if specified
            if (materialCode) {
                filteredUsages = filteredUsages.filter(usage => 
                    usage.items.some(item => item.materialCode === materialCode)
                );
            }
            
            // Flatten the data to show each item as a separate row
            const reportData = [];
            
            filteredUsages.forEach(usage => {
                usage.items.forEach(item => {
                    if (materialCode && item.materialCode !== materialCode) return;
                    
                    const material = materials.find(m => m.code === item.materialCode);
                    reportData.push({
                        'Tanggal': usage.date,
                        'No. Dokumen': usage.number,
                        'Pelatihan': usage.training,
                        'Material': material ? material.name : item.materialCode,
                        'Qty': item.quantity,
                        'Satuan': material ? material.unit : '-',
                        'Lokasi': usage.location
                    });
                });
            });
            
            return reportData;
        }
        
        // Generate expiry report
        function generateExpiryReport() {
            const today = new Date();
            const warningDays = parseInt(document.getElementById('daysBeforeExpiryWarning').value) || 30;
            
            return stockData
                .filter(item => item.expiryDate)
                .map(item => {
                    const expiryDate = new Date(item.expiryDate);
                    const diffTime = expiryDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    const material = materials.find(m => m.code === item.materialCode);
                    return {
                        'Material': material ? material.name : item.materialCode,
                        'Batch': item.batch || '-',
                        'Qty': item.quantity,
                        'Satuan': material ? material.unit : '-',
                        'Lokasi': item.location,
                        'Expired Date': item.expiryDate,
                        'Sisa Hari': diffDays > 0 ? diffDays : 'Expired'
                    };
                })
                .sort((a, b) => {
                    // Sort by remaining days (expired first, then soonest to expire)
                    const aDays = a['Sisa Hari'] === 'Expired' ? -Infinity : parseInt(a['Sisa Hari']);
                    const bDays = b['Sisa Hari'] === 'Expired' ? -Infinity : parseInt(b['Sisa Hari']);
                    return aDays - bDays;
                });
        }
        
        // Generate request report
        function generateRequestReport(startDate, endDate) {
            let filteredRequests = [...requests];
            
            // Filter by date
            filteredRequests = filteredRequests.filter(request => {
                return request.date >= startDate && request.date <= endDate;
            });
            
            return filteredRequests.map(request => {
                const totalItems = request.items ? request.items.length : 0;
                const totalQty = request.items ? 
                    request.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                
                return {
                    'No. Permintaan': request.number,
                    'Tanggal': request.date,
                    'Pelatihan': request.training,
                    'Status': request.status,
                    'Dibuat Oleh': request.createdBy,
                    'Jumlah Item': totalItems,
                    'Total Qty': totalQty
                };
            });
        }
        
        // Export report
        function exportReport() {
            // In a real app, this would export the report to Excel or PDF
            showInfo('Fitur export laporan akan diimplementasikan');
        }
        // Search master data
        function searchMasterData() {
            const searchTerm = document.getElementById('searchMasterData').value.toLowerCase();
            const rows = document.querySelectorAll('#masterDataTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search material request
        function searchMaterialRequest() {
            const searchTerm = document.getElementById('searchMaterialRequest').value.toLowerCase();
            const rows = document.querySelectorAll('#materialRequestTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search material receipt
        function searchMaterialReceipt() {
            const searchTerm = document.getElementById('searchMaterialReceipt').value.toLowerCase();
            const rows = document.querySelectorAll('#materialReceiptTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search material usage
        function searchMaterialUsage() {
            const searchTerm = document.getElementById('searchMaterialUsage').value.toLowerCase();
            const rows = document.querySelectorAll('#materialUsageTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search stock adjustment
        function searchStockAdjustment() {
            const searchTerm = document.getElementById('searchStockAdjustment').value.toLowerCase();
            const rows = document.querySelectorAll('#stockAdjustmentTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search stock destruction
        function searchStockDestruction() {
            const searchTerm = document.getElementById('searchStockDestruction').value.toLowerCase();
            const rows = document.querySelectorAll('#stockDestructionTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Search stock transfer
        function searchStockTransfer() {
            const searchTerm = document.getElementById('searchStockTransfer').value.toLowerCase();
            const rows = document.querySelectorAll('#stockTransferTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        

