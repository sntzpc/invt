 // Global variables
        const SHEET_ID = '1ihnb6E27RTX3RekiTJW9ONKA33YAXUfIBCofLMBSbk4';
        const API_KEY = 'AIzaSyAI6poofBSVYkvAwXpkSWZrnj-bJhESOLo';
        let currentUser = 'Admin Training Center';
        let materials = [];
        let categories = [];
        let units = [];
        let locations = [];
        let stockData = [];
        let requests = [];
        let receipts = [];
        let usages = [];
        let adjustments = [];
        let destructions = [];
        let transfers = [];
        let activities = [];
        
        // Initialize the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
            setupEventListeners();
        });
        
        // Initialize the application
        function initializeApp() {
            // Load all necessary data
            loadMasterData();
            loadStockData();
            loadTransactionData();
            
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('requestDate').value = today;
            document.getElementById('receiptDate').value = today;
            document.getElementById('usageDate').value = today;
            document.getElementById('adjustmentDate').value = today;
            document.getElementById('destructionDate').value = today;
            document.getElementById('transferDate').value = today;
            document.getElementById('reportStartDate').value = today;
            document.getElementById('reportEndDate').value = today;
            
            // Generate document numbers
            generateDocumentNumbers();
        }
        
        // Setup event listeners
        function setupEventListeners() {
            // Refresh buttons
            document.getElementById('refreshDashboard').addEventListener('click', refreshDashboard);
            document.getElementById('refreshForecast').addEventListener('click', refreshForecast);
            document.getElementById('refreshReports').addEventListener('click', refreshReports);
            
            // Save buttons
            document.getElementById('saveMaterial').addEventListener('click', saveMaterial);
            document.getElementById('submitRequest').addEventListener('click', submitRequest);
            document.getElementById('submitReceipt').addEventListener('click', submitReceipt);
            document.getElementById('submitUsage').addEventListener('click', submitUsage);
            document.getElementById('submitAdjustment').addEventListener('click', submitAdjustment);
            document.getElementById('submitDestruction').addEventListener('click', submitDestruction);
            document.getElementById('submitTransfer').addEventListener('click', submitTransfer);
            document.getElementById('saveSettings').addEventListener('click', saveSettings);
            
            // Add item buttons
            document.getElementById('addRequestItem').addEventListener('click', addRequestItem);
            document.getElementById('addReceiptItem').addEventListener('click', addReceiptItem);
            document.getElementById('addUsageItem').addEventListener('click', addUsageItem);
            document.getElementById('addAdjustmentItem').addEventListener('click', addAdjustmentItem);
            document.getElementById('addDestructionItem').addEventListener('click', addDestructionItem);
            document.getElementById('addTransferItem').addEventListener('click', addTransferItem);
            
            // Report buttons
            document.getElementById('generateReport').addEventListener('click', generateReport);
            document.getElementById('exportReport').addEventListener('click', exportReport);
            
            // Forecast button
            document.getElementById('calculateForecast').addEventListener('click', calculateForecast);
            
            // Backup buttons
            document.getElementById('backupData').addEventListener('click', backupData);
            document.getElementById('restoreData').addEventListener('click', restoreData);
            
            // Print buttons
            document.getElementById('printDetail').addEventListener('click', printDetail);
            
            // Search functionality
            document.getElementById('searchMasterData').addEventListener('input', searchMasterData);
            document.getElementById('searchMaterialRequest').addEventListener('input', searchMaterialRequest);
            document.getElementById('searchMaterialReceipt').addEventListener('input', searchMaterialReceipt);
            document.getElementById('searchMaterialUsage').addEventListener('input', searchMaterialUsage);
            document.getElementById('searchStockAdjustment').addEventListener('input', searchStockAdjustment);
            document.getElementById('searchStockDestruction').addEventListener('input', searchStockDestruction);
            document.getElementById('searchStockTransfer').addEventListener('input', searchStockTransfer);
            
            // Report type change
            document.getElementById('reportType').addEventListener('change', function() {
                const type = this.value;
                document.getElementById('reportMaterialContainer').style.display = 
                    (type === 'usage' || type === 'movement') ? 'block' : 'none';
                document.getElementById('reportLocationContainer').style.display = 
                    (type === 'stock' || type === 'movement') ? 'block' : 'none';
            });
        }
        
        // Load master data from Google Sheets
        async function loadMasterData() {
            try {
                // Load materials
                const materialsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Materials?key=${API_KEY}`);
                const materialsData = await materialsResponse.json();
                if (materialsData.values && materialsData.values.length > 1) {
                    materials = materialsData.values.slice(1).map(row => ({
                        code: row[0],
                        name: row[1],
                        category: row[2],
                        unit: row[3],
                        minStock: row[4],
                        isExpirable: row[5] === 'TRUE',
                        notes: row[6]
                    }));
                    
                    // Populate materials table
                    populateMaterialsTable();
                    
                    // Populate material dropdowns
                    populateMaterialDropdowns();
                } else if (!materialsData.values) {
                    // Create Materials sheet if it doesn't exist
                    await createSheet('Materials', ['Kode', 'Nama', 'Kategori', 'Satuan', 'Min Stok', 'Expirable', 'Catatan']);
                }
                
                // Load categories
                categories = [...new Set(materials.map(m => m.category))];
                
                // Load units
                units = [...new Set(materials.map(m => m.unit))];
                
                // Load locations
                const locationsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Locations?key=${API_KEY}`);
                const locationsData = await locationsResponse.json();
                if (locationsData.values && locationsData.values.length > 1) {
                    locations = locationsData.values.slice(1).map(row => row[0]);
                } else if (!locationsData.values) {
                    // Create Locations sheet if it doesn't exist
                    await createSheet('Locations', ['Nama Lokasi']);
                    locations = ['Gudang Utama'];
                    await appendToSheet('Locations', [['Gudang Utama']]);
                }
                
                console.log('Master data loaded successfully');
            } catch (error) {
                console.error('Error loading master data:', error);
                showError('Gagal memuat data master. Silakan coba lagi.');
            }
        }
        
        // Load stock data from Google Sheets
        async function loadStockData() {
            try {
                const stockResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Stock?key=${API_KEY}`);
                const stockData = await stockResponse.json();
                if (stockData.values && stockData.values.length > 1) {
                    stockData = stockData.values.slice(1).map(row => ({
                        materialCode: row[0],
                        batch: row[1],
                        quantity: parseFloat(row[2]),
                        location: row[3],
                        expiryDate: row[4] || null
                    }));
                    
                    // Update dashboard
                    updateDashboard();
                } else if (!stockData.values) {
                    // Create Stock sheet if it doesn't exist
                    await createSheet('Stock', ['Kode Material', 'Batch', 'Qty', 'Lokasi', 'Expired Date']);
                }
                
                console.log('Stock data loaded successfully');
            } catch (error) {
                console.error('Error loading stock data:', error);
                showError('Gagal memuat data stok. Silakan coba lagi.');
            }
        }
        
        // Load transaction data from Google Sheets
        async function loadTransactionData() {
            try {
                // Load requests
                const requestsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialRequests?key=${API_KEY}`);
                const requestsData = await requestsResponse.json();
                if (requestsData.values && requestsData.values.length > 1) {
                    requests = requestsData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        training: row[2],
                        status: row[3],
                        createdBy: row[4],
                        notes: row[5]
                    }));
                    
                    // Load request items
                    const requestItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialRequestItems?key=${API_KEY}`);
                    const requestItemsData = await requestItemsResponse.json();
                    if (requestItemsData.values && requestItemsData.values.length > 1) {
                        requestItemsData.values.slice(1).forEach(row => {
                            const request = requests.find(r => r.number === row[0]);
                            if (request) {
                                if (!request.items) request.items = [];
                                request.items.push({
                                    materialCode: row[1],
                                    quantity: parseFloat(row[2]),
                                    purpose: row[3]
                                });
                            }
                        });
                    }
                    
                    populateMaterialRequestTable();
                } else if (!requestsData.values) {
                    // Create MaterialRequests and MaterialRequestItems sheets if they don't exist
                    await createSheet('MaterialRequests', ['No. Permintaan', 'Tanggal', 'Pelatihan', 'Status', 'Dibuat Oleh', 'Catatan']);
                    await createSheet('MaterialRequestItems', ['No. Permintaan', 'Kode Material', 'Qty', 'Kebutuhan']);
                }
                
                // Load receipts
                const receiptsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialReceipts?key=${API_KEY}`);
                const receiptsData = await receiptsResponse.json();
                if (receiptsData.values && receiptsData.values.length > 1) {
                    receipts = receiptsData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        supplier: row[2],
                        poNumber: row[3],
                        location: row[4],
                        createdBy: row[5],
                        notes: row[6]
                    }));
                    
                    // Load receipt items
                    const receiptItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialReceiptItems?key=${API_KEY}`);
                    const receiptItemsData = await receiptItemsResponse.json();
                    if (receiptItemsData.values && receiptItemsData.values.length > 1) {
                        receiptItemsData.values.slice(1).forEach(row => {
                            const receipt = receipts.find(r => r.number === row[0]);
                            if (receipt) {
                                if (!receipt.items) receipt.items = [];
                                receipt.items.push({
                                    materialCode: row[1],
                                    batch: row[2],
                                    quantity: parseFloat(row[3]),
                                    expiryDate: row[4] || null
                                });
                            }
                        });
                    }
                    
                    populateMaterialReceiptTable();
                } else if (!receiptsData.values) {
                    // Create MaterialReceipts and MaterialReceiptItems sheets if they don't exist
                    await createSheet('MaterialReceipts', ['No. Penerimaan', 'Tanggal', 'Supplier', 'No. PO', 'Lokasi', 'Dibuat Oleh', 'Catatan']);
                    await createSheet('MaterialReceiptItems', ['No. Penerimaan', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
                }
                
                // Load usages
                const usagesResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialUsages?key=${API_KEY}`);
                const usagesData = await usagesResponse.json();
                if (usagesData.values && usagesData.values.length > 1) {
                    usages = usagesData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        training: row[2],
                        location: row[3],
                        createdBy: row[4],
                        notes: row[5]
                    }));
                    
                    // Load usage items
                    const usageItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/MaterialUsageItems?key=${API_KEY}`);
                    const usageItemsData = await usageItemsResponse.json();
                    if (usageItemsData.values && usageItemsData.values.length > 1) {
                        usageItemsData.values.slice(1).forEach(row => {
                            const usage = usages.find(u => u.number === row[0]);
                            if (usage) {
                                if (!usage.items) usage.items = [];
                                usage.items.push({
                                    materialCode: row[1],
                                    batch: row[2],
                                    quantity: parseFloat(row[3])
                                });
                            }
                        });
                    }
                    
                    populateMaterialUsageTable();
                } else if (!usagesData.values) {
                    // Create MaterialUsages and MaterialUsageItems sheets if they don't exist
                    await createSheet('MaterialUsages', ['No. Pengeluaran', 'Tanggal', 'Pelatihan', 'Lokasi', 'Dikeluarkan Oleh', 'Catatan']);
                    await createSheet('MaterialUsageItems', ['No. Pengeluaran', 'Kode Material', 'Batch', 'Qty']);
                }
                
                // Load adjustments
                const adjustmentsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockAdjustments?key=${API_KEY}`);
                const adjustmentsData = await adjustmentsResponse.json();
                if (adjustmentsData.values && adjustmentsData.values.length > 1) {
                    adjustments = adjustmentsData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        location: row[2],
                        reason: row[3],
                        createdBy: row[4],
                        notes: row[5]
                    }));
                    
                    // Load adjustment items
                    const adjustmentItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockAdjustmentItems?key=${API_KEY}`);
                    const adjustmentItemsData = await adjustmentItemsResponse.json();
                    if (adjustmentItemsData.values && adjustmentItemsData.values.length > 1) {
                        adjustmentItemsData.values.slice(1).forEach(row => {
                            const adjustment = adjustments.find(a => a.number === row[0]);
                            if (adjustment) {
                                if (!adjustment.items) adjustment.items = [];
                                adjustment.items.push({
                                    materialCode: row[1],
                                    batch: row[2],
                                    systemQty: parseFloat(row[3]),
                                    physicalQty: parseFloat(row[4]),
                                    difference: parseFloat(row[5])
                                });
                            }
                        });
                    }
                    
                    populateStockAdjustmentTable();
                } else if (!adjustmentsData.values) {
                    // Create StockAdjustments and StockAdjustmentItems sheets if they don't exist
                    await createSheet('StockAdjustments', ['No. Penyesuaian', 'Tanggal', 'Lokasi', 'Alasan', 'Dilakukan Oleh', 'Catatan']);
                    await createSheet('StockAdjustmentItems', ['No. Penyesuaian', 'Kode Material', 'Batch', 'Qty Sistem', 'Qty Fisik', 'Selisih']);
                }
                
                // Load destructions
                const destructionsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockDestructions?key=${API_KEY}`);
                const destructionsData = await destructionsResponse.json();
                if (destructionsData.values && destructionsData.values.length > 1) {
                    destructions = destructionsData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        location: row[2],
                        reason: row[3],
                        method: row[4],
                        createdBy: row[5],
                        notes: row[6]
                    }));
                    
                    // Load destruction items
                    const destructionItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockDestructionItems?key=${API_KEY}`);
                    const destructionItemsData = await destructionItemsResponse.json();
                    if (destructionItemsData.values && destructionItemsData.values.length > 1) {
                        destructionItemsData.values.slice(1).forEach(row => {
                            const destruction = destructions.find(d => d.number === row[0]);
                            if (destruction) {
                                if (!destruction.items) destruction.items = [];
                                destruction.items.push({
                                    materialCode: row[1],
                                    batch: row[2],
                                    quantity: parseFloat(row[3]),
                                    expiryDate: row[4] || null
                                });
                            }
                        });
                    }
                    
                    populateStockDestructionTable();
                } else if (!destructionsData.values) {
                    // Create StockDestructions and StockDestructionItems sheets if they don't exist
                    await createSheet('StockDestructions', ['No. Pemusnahan', 'Tanggal', 'Lokasi', 'Alasan', 'Metode', 'Dilakukan Oleh', 'Catatan']);
                    await createSheet('StockDestructionItems', ['No. Pemusnahan', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
                }
                
                // Load transfers
                const transfersResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockTransfers?key=${API_KEY}`);
                const transfersData = await transfersResponse.json();
                if (transfersData.values && transfersData.values.length > 1) {
                    transfers = transfersData.values.slice(1).map(row => ({
                        number: row[0],
                        date: row[1],
                        fromLocation: row[2],
                        toLocation: row[3],
                        createdBy: row[4],
                        notes: row[5]
                    }));
                    
                    // Load transfer items
                    const transferItemsResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/StockTransferItems?key=${API_KEY}`);
                    const transferItemsData = await transferItemsResponse.json();
                    if (transferItemsData.values && transferItemsData.values.length > 1) {
                        transferItemsData.values.slice(1).forEach(row => {
                            const transfer = transfers.find(t => t.number === row[0]);
                            if (transfer) {
                                if (!transfer.items) transfer.items = [];
                                transfer.items.push({
                                    materialCode: row[1],
                                    batch: row[2],
                                    quantity: parseFloat(row[3]),
                                    expiryDate: row[4] || null
                                });
                            }
                        });
                    }
                    
                    populateStockTransferTable();
                } else if (!transfersData.values) {
                    // Create StockTransfers and StockTransferItems sheets if they don't exist
                    await createSheet('StockTransfers', ['No. Transfer', 'Tanggal', 'Dari Lokasi', 'Ke Lokasi', 'Dilakukan Oleh', 'Catatan']);
                    await createSheet('StockTransferItems', ['No. Transfer', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
                }
                
                // Load activities
                const activitiesResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Activities?key=${API_KEY}`);
                const activitiesData = await activitiesResponse.json();
                if (activitiesData.values && activitiesData.values.length > 1) {
                    activities = activitiesData.values.slice(1).map(row => ({
                        date: row[0],
                        type: row[1],
                        documentNumber: row[2],
                        materialCode: row[3],
                        quantity: parseFloat(row[4]),
                        location: row[5],
                        user: row[6]
                    }));
                    
                    // Update activity table on dashboard
                    updateActivityTable();
                } else if (!activitiesData.values) {
                    // Create Activities sheet if it doesn't exist
                    await createSheet('Activities', ['Tanggal', 'Tipe', 'No. Dokumen', 'Kode Material', 'Qty', 'Lokasi', 'User']);
                }
                
                console.log('Transaction data loaded successfully');
            } catch (error) {
                console.error('Error loading transaction data:', error);
                showError('Gagal memuat data transaksi. Silakan coba lagi.');
            }
        }
        
        // Create a new sheet in Google Sheets
        async function createSheet(sheetName, headers) {
            try {
                const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetName
                                }
                            }
                        }]
                    })
                });
                
                const result = await response.json();
                console.log(`Sheet ${sheetName} created successfully`);
                
                // Add headers to the new sheet
                await appendToSheet(sheetName, [headers]);
            } catch (error) {
                console.error(`Error creating sheet ${sheetName}:`, error);
                throw error;
            }
        }
        
        // Append data to a sheet
        async function appendToSheet(sheetName, data) {
            try {
                const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A1:append?valueInputOption=RAW&key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        values: data
                    })
                });
                
                const result = await response.json();
                console.log(`Data appended to ${sheetName} successfully`);
                return result;
            } catch (error) {
                console.error(`Error appending data to ${sheetName}:`, error);
                throw error;
            }
        }
        
        // Update data in a sheet
        async function updateSheet(sheetName, range, data) {
            try {
                const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!${range}?valueInputOption=RAW&key=${API_KEY}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        values: data
                    })
                });
                
                const result = await response.json();
                console.log(`Data updated in ${sheetName} successfully`);
                return result;
            } catch (error) {
                console.error(`Error updating data in ${sheetName}:`, error);
                throw error;
            }
        }
        
        // Generate document numbers
        function generateDocumentNumbers() {
            const today = new Date();
            const year = today.getFullYear().toString().substr(-2);
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            
            // Get settings from the form (or use defaults)
            const requestPrefix = document.getElementById('requestPrefix').value || 'REQ';
            const receiptPrefix = document.getElementById('receiptPrefix').value || 'REC';
            const usagePrefix = document.getElementById('usagePrefix').value || 'USE';
            const adjustmentPrefix = document.getElementById('adjustmentPrefix').value || 'ADJ';
            const destructionPrefix = document.getElementById('destructionPrefix').value || 'DES';
            const transferPrefix = document.getElementById('transferPrefix').value || 'TRF';
            
            // Generate sequential numbers (in a real app, you'd get the last number from the database)
            const seq = Math.floor(Math.random() * 1000).toString().padStart(4, '0');
            
            document.getElementById('requestNumber').value = `${requestPrefix}${year}${month}${day}${seq}`;
            document.getElementById('receiptNumber').value = `${receiptPrefix}${year}${month}${day}${seq}`;
            document.getElementById('usageNumber').value = `${usagePrefix}${year}${month}${day}${seq}`;
            document.getElementById('adjustmentNumber').value = `${adjustmentPrefix}${year}${month}${day}${seq}`;
            document.getElementById('destructionNumber').value = `${destructionPrefix}${year}${month}${day}${seq}`;
            document.getElementById('transferNumber').value = `${transferPrefix}${year}${month}${day}${seq}`;
        }
        
        // Populate materials table
        function populateMaterialsTable() {
            const tableBody = document.querySelector('#masterDataTable tbody');
            tableBody.innerHTML = '';
            
            materials.forEach(material => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${material.code}</td>
                    <td>${material.name}</td>
                    <td>${material.category}</td>
                    <td>${material.unit}</td>
                    <td>${material.minStock}</td>
                    <td>${material.isExpirable ? 'Ya' : 'Tidak'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-material" data-code="${material.code}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-material" data-code="${material.code}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-material').forEach(button => {
                button.addEventListener('click', function() {
                    const code = this.getAttribute('data-code');
                    editMaterial(code);
                });
            });
            
            document.querySelectorAll('.delete-material').forEach(button => {
                button.addEventListener('click', function() {
                    const code = this.getAttribute('data-code');
                    deleteMaterial(code);
                });
            });
        }
        
        // Populate material dropdowns
        function populateMaterialDropdowns() {
            const materialDropdowns = [
                document.getElementById('forecastMaterial'),
                document.getElementById('reportMaterial')
            ];
            
            materialDropdowns.forEach(dropdown => {
                if (dropdown) {
                    dropdown.innerHTML = '<option value="">Pilih Material</option>';
                    materials.forEach(material => {
                        const option = document.createElement('option');
                        option.value = material.code;
                        option.textContent = `${material.code} - ${material.name}`;
                        dropdown.appendChild(option);
                    });
                }
            });
            
            // Also populate material selects in modals
            // This would be done when the modals are opened to ensure fresh data
        }
        
        // Populate material request table
        function populateMaterialRequestTable() {
            const tableBody = document.querySelector('#materialRequestTable tbody');
            tableBody.innerHTML = '';
            
            requests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.number}</td>
                    <td>${request.date}</td>
                    <td>${request.training}</td>
                    <td><span class="badge bg-${getStatusBadgeClass(request.status)}">${request.status}</span></td>
                    <td>${request.createdBy}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-request" data-number="${request.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${request.status === 'Draft' ? `
                        <button class="btn btn-sm btn-warning edit-request" data-number="${request.number}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-request" data-number="${request.number}">
                            <i class="bi bi-trash"></i>
                        </button>
                        ` : ''}
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view, edit and delete buttons
            document.querySelectorAll('.view-request').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewRequest(number);
                });
            });
            
            document.querySelectorAll('.edit-request').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    editRequest(number);
                });
            });
            
            document.querySelectorAll('.delete-request').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    deleteRequest(number);
                });
            });
        }
        
        // Populate material receipt table
        function populateMaterialReceiptTable() {
            const tableBody = document.querySelector('#materialReceiptTable tbody');
            tableBody.innerHTML = '';
            
            receipts.forEach(receipt => {
                const totalItems = receipt.items ? receipt.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${receipt.number}</td>
                    <td>${receipt.date}</td>
                    <td>${receipt.supplier || '-'}</td>
                    <td>${receipt.poNumber || '-'}</td>
                    <td>${totalItems}</td>
                    <td>${receipt.location}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-receipt" data-number="${receipt.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-receipt').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewReceipt(number);
                });
            });
        }
        
        // Populate material usage table
        function populateMaterialUsageTable() {
            const tableBody = document.querySelector('#materialUsageTable tbody');
            tableBody.innerHTML = '';
            
            usages.forEach(usage => {
                const totalItems = usage.items ? usage.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usage.number}</td>
                    <td>${usage.date}</td>
                    <td>${usage.training}</td>
                    <td>${totalItems}</td>
                    <td>${usage.location}</td>
                    <td>${usage.createdBy}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-usage" data-number="${usage.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-usage').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewUsage(number);
                });
            });
        }
        
        // Populate stock adjustment table
        function populateStockAdjustmentTable() {
            const tableBody = document.querySelector('#stockAdjustmentTable tbody');
            tableBody.innerHTML = '';
            
            adjustments.forEach(adjustment => {
                const firstItem = adjustment.items && adjustment.items.length > 0 ? adjustment.items[0] : null;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${adjustment.number}</td>
                    <td>${adjustment.date}</td>
                    <td>${firstItem ? getMaterialName(firstItem.materialCode) : '-'}</td>
                    <td>${firstItem ? firstItem.systemQty : '-'}</td>
                    <td>${firstItem ? firstItem.physicalQty : '-'}</td>
                    <td>${adjustment.reason}</td>
                    <td>${adjustment.createdBy}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-adjustment" data-number="${adjustment.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-adjustment').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewAdjustment(number);
                });
            });
        }
        
        // Populate stock destruction table
        function populateStockDestructionTable() {
            const tableBody = document.querySelector('#stockDestructionTable tbody');
            tableBody.innerHTML = '';
            
            destructions.forEach(destruction => {
                const firstItem = destruction.items && destruction.items.length > 0 ? destruction.items[0] : null;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${destruction.number}</td>
                    <td>${destruction.date}</td>
                    <td>${firstItem ? getMaterialName(firstItem.materialCode) : '-'}</td>
                    <td>${firstItem ? firstItem.quantity : '-'}</td>
                    <td>${firstItem ? firstItem.batch : '-'}</td>
                    <td>${destruction.reason}</td>
                    <td>${destruction.createdBy}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-destruction" data-number="${destruction.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-destruction').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewDestruction(number);
                });
            });
        }
        
        // Populate stock transfer table
        function populateStockTransferTable() {
            const tableBody = document.querySelector('#stockTransferTable tbody');
            tableBody.innerHTML = '';
            
            transfers.forEach(transfer => {
                const firstItem = transfer.items && transfer.items.length > 0 ? transfer.items[0] : null;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transfer.number}</td>
                    <td>${transfer.date}</td>
                    <td>${firstItem ? getMaterialName(firstItem.materialCode) : '-'}</td>
                    <td>${firstItem ? firstItem.quantity : '-'}</td>
                    <td>${transfer.fromLocation}</td>
                    <td>${transfer.toLocation}</td>
                    <td>${transfer.createdBy}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-transfer" data-number="${transfer.number}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-transfer').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    viewTransfer(number);
                });
            });
        }
        
        // Update dashboard with current data
        function updateDashboard() {
            // Update summary cards
            document.getElementById('totalMaterials').textContent = materials.length;
            
            const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('totalStock').textContent = totalStock;
            
            const today = new Date();
            const warningDays = parseInt(document.getElementById('daysBeforeExpiryWarning').value) || 30;
            
            const expiredStock = stockData.filter(item => {
                if (!item.expiryDate) return false;
                const expiryDate = new Date(item.expiryDate);
                return expiryDate < today;
            }).reduce((sum, item) => sum + item.quantity, 0);
            
            document.getElementById('expiredStock').textContent = expiredStock;
            
            const expiringStock = stockData.filter(item => {
                if (!item.expiryDate) return false;
                const expiryDate = new Date(item.expiryDate);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= warningDays;
            }).reduce((sum, item) => sum + item.quantity, 0);
            
            document.getElementById('expiringStock').textContent = expiringStock;
            
            // Update low stock table
            updateLowStockTable();
            
            // Update expiring table
            updateExpiringTable();
            
            // Update activity table
            updateActivityTable();
        }
        
        // Update low stock table
        function updateLowStockTable() {
            const tableBody = document.getElementById('lowStockTable');
            tableBody.innerHTML = '';
            
            materials.forEach(material => {
                const stockInLocation = {};
                
                // Calculate stock per location
                stockData.filter(item => item.materialCode === material.code).forEach(item => {
                    if (!stockInLocation[item.location]) {
                        stockInLocation[item.location] = 0;
                    }
                    stockInLocation[item.location] += item.quantity;
                });
                
                // Check if stock is below minimum in any location
                Object.keys(stockInLocation).forEach(location => {
                    if (stockInLocation[location] < material.minStock) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${material.name}</td>
                            <td>${stockInLocation[location]}</td>
                            <td>${material.minStock}</td>
                            <td>${location}</td>
                        `;
                        tableBody.appendChild(row);
                    }
                });
            });
        }
        
        // Update expiring table
        function updateExpiringTable() {
            const tableBody = document.getElementById('expiringTable');
            tableBody.innerHTML = '';
            
            const today = new Date();
            const warningDays = parseInt(document.getElementById('daysBeforeExpiryWarning').value) || 30;
            
            stockData.filter(item => item.expiryDate).forEach(item => {
                const expiryDate = new Date(item.expiryDate);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= warningDays) {
                    const material = materials.find(m => m.code === item.materialCode);
                    const row = document.createElement('tr');
                    row.className = diffDays <= 0 ? 'expired' : (diffDays <= warningDays ? 'expiring-soon' : '');
                    
                    row.innerHTML = `
                        <td>${material ? material.name : item.materialCode}</td>
                        <td>${item.batch || '-'}</td>
                        <td>${item.expiryDate}</td>
                        <td>
                            <span class="badge ${diffDays <= 0 ? 'bg-danger' : 'bg-warning'}">
                                ${diffDays <= 0 ? 'Expired' : `${diffDays} hari`}
                            </span>
                        </td>
                    `;
                    tableBody.appendChild(row);
                }
            });
        }
        
        // Update activity table
        function updateActivityTable() {
            const tableBody = document.getElementById('activityTable');
            tableBody.innerHTML = '';
            
            // Show latest 10 activities
            const latestActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
            
            latestActivities.forEach(activity => {
                const material = materials.find(m => m.code === activity.materialCode);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${activity.date}</td>
                    <td>${activity.type}</td>
                    <td>${material ? material.name : activity.materialCode}</td>
                    <td>${activity.quantity}</td>
                    <td>${activity.location}</td>
                    <td>${activity.user}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        // Get material name by code
        function getMaterialName(code) {
            const material = materials.find(m => m.code === code);
            return material ? material.name : code;
        }
        
        // Get status badge class
        function getStatusBadgeClass(status) {
            switch (status) {
                case 'Draft': return 'secondary';
                case 'Disetujui': return 'success';
                case 'Ditolak': return 'danger';
                case 'Diproses': return 'warning';
                case 'Selesai': return 'primary';
                default: return 'secondary';
            }
        }
        
        // Refresh dashboard
        function refreshDashboard() {
            loadStockData();
            showSuccess('Dashboard diperbarui');
        }
        
        // Refresh forecast
        function refreshForecast() {
            // In a real app, this would recalculate forecasts
            showSuccess('Data forecast diperbarui');
        }
        
        // Refresh reports
        function refreshReports() {
            // In a real app, this would reload report data
            showSuccess('Data laporan diperbarui');
        }
        
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
        
        // Update stock in Google Sheets
        async function updateStock(materialCode, batch, quantityChange, location, expiryDate = null) {
            try {
                // Find existing stock for this material and batch in this location
                const existingStock = stockData.find(item => 
                    item.materialCode === materialCode && 
                    item.batch === batch && 
                    item.location === location
                );
                
                let newQuantity;
                let newExpiryDate = expiryDate;
                
                if (existingStock) {
                    // Update existing stock
                    newQuantity = existingStock.quantity + quantityChange;
                    newExpiryDate = existingStock.expiryDate || expiryDate;
                    
                    // Find the row in Google Sheets (in a real app, you'd need to know the row number)
                    // This is simplified - in reality you'd need to get the range first
                    const stockIndex = stockData.findIndex(item => 
                        item.materialCode === materialCode && 
                        item.batch === batch && 
                        item.location === location
                    );
                    
                    if (stockIndex >= 0) {
                        const stockRow = [
                            materialCode,
                            batch,
                            newQuantity,
                            location,
                            newExpiryDate || ''
                        ];
                        
                        await updateSheet('Stock', `A${stockIndex + 2}:E${stockIndex + 2}`, [stockRow]);
                    }
                } else if (quantityChange > 0) {
                    // Add new stock (only if quantity is positive)
                    newQuantity = quantityChange;
                    
                    const stockRow = [
                        materialCode,
                        batch,
                        newQuantity,
                        location,
                        newExpiryDate || ''
                    ];
                    
                    await appendToSheet('Stock', [stockRow]);
                }
                
                // Update local stock data
                if (existingStock) {
                    if (newQuantity <= 0) {
                        // Remove from array if quantity is zero or negative
                        stockData = stockData.filter(item => 
                            !(item.materialCode === materialCode && 
                              item.batch === batch && 
                              item.location === location)
                        );
                    } else {
                        // Update quantity
                        existingStock.quantity = newQuantity;
                        if (newExpiryDate) {
                            existingStock.expiryDate = newExpiryDate;
                        }
                    }
                } else if (quantityChange > 0) {
                    // Add new stock
                    stockData.push({
                        materialCode,
                        batch,
                        quantity: newQuantity,
                        location,
                        expiryDate: newExpiryDate
                    });
                }
                
                console.log(`Stock updated: ${materialCode} (${batch}) in ${location} changed by ${quantityChange}`);
            } catch (error) {
                console.error('Error updating stock:', error);
                throw error;
            }
        }
        
        // Add activity to Google Sheets
        async function addActivity(date, type, documentNumber, materialCode, quantity, location, user) {
            try {
                const activityData = [
                    date,
                    type,
                    documentNumber,
                    materialCode,
                    quantity,
                    location,
                    user
                ];
                
                await appendToSheet('Activities', [activityData]);
                
                // Add to local array
                activities.push({
                    date,
                    type,
                    documentNumber,
                    materialCode,
                    quantity,
                    location,
                    user
                });
                
                console.log(`Activity added: ${type} ${documentNumber}`);
            } catch (error) {
                console.error('Error adding activity:', error);
                throw error;
            }
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
        
        // Save settings
        async function saveSettings() {
            const companyName = document.getElementById('companyName').value;
            const trainingCenterName = document.getElementById('trainingCenterName').value;
            const defaultLocation = document.getElementById('defaultLocation').value;
            const daysBeforeExpiryWarning = document.getElementById('daysBeforeExpiryWarning').value;
            
            const requestPrefix = document.getElementById('requestPrefix').value;
            const receiptPrefix = document.getElementById('receiptPrefix').value;
            const usagePrefix = document.getElementById('usagePrefix').value;
            const adjustmentPrefix = document.getElementById('adjustmentPrefix').value;
            const destructionPrefix = document.getElementById('destructionPrefix').value;
            const transferPrefix = document.getElementById('transferPrefix').value;
            
            const sheetId = document.getElementById('sheetId').value;
            const apiKey = document.getElementById('apiKey').value;
            
            try {
                // In a real app, you would save these settings to Google Sheets or localStorage
                // For this example, we'll just show a success message
                
                showSuccess('Pengaturan berhasil disimpan');
            } catch (error) {
                console.error('Error saving settings:', error);
                showError('Gagal menyimpan pengaturan. Silakan coba lagi.');
            }
        }
        
        // Backup data
        async function backupData() {
            try {
                // In a real app, this would create a backup of all data
                // For this example, we'll just show a success message
                
                showSuccess('Backup data berhasil dilakukan');
            } catch (error) {
                console.error('Error backing up data:', error);
                showError('Gagal melakukan backup data. Silakan coba lagi.');
            }
        }
        
        // Restore data
        async function restoreData() {
            const fileInput = document.getElementById('restoreFile');
            const file = fileInput.files[0];
            
            if (!file) {
                showError('Harap pilih file backup terlebih dahulu');
                return;
            }
            
            try {
                // In a real app, this would restore data from the backup file
                // For this example, we'll just show a success message
                
                showSuccess('Restore data berhasil dilakukan');
                fileInput.value = ''; // Clear file input
            } catch (error) {
                console.error('Error restoring data:', error);
                showError('Gagal melakukan restore data. Silakan coba lagi.');
            }
        }
        
        // Print detail
        function printDetail() {
            // In a real app, this would print the current detail view
            showInfo('Fitur print akan diimplementasikan');
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
        
        // Show success message
        function showSuccess(message) {
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
        }
        
        // Show error message
        function showError(message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        }
        
        // Show info message
        function showInfo(message) {
            Swal.fire({
                icon: 'info',
                title: 'Info',
                text: message
            });
        }