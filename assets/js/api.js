// assets/js/api.js

const SHEET_ID = '1ihnb6E27RTX3RekiTJW9ONKA33YAXUfIBCofLMBSbk4';
const API_KEY = 'AIzaSyAI6poofBSVYkvAwXpkSWZrnj-bJhESOLo';

window.materials = [];
window.categories = [];
window.units = [];
window.locations = [];
window.stockData = [];
window.requests = [];
window.receipts = [];
window.usages = [];
window.adjustments = [];
window.destructions = [];
window.transfers = [];
window.activities = [];

// ========== FETCH & CRUD UTILS ==========
async function fetchSheetRange(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;
    const resp = await fetch(url);
    return resp.json();
}
async function fetchSheetRangeIfExist(sheetName) {
    try {
        return await fetchSheetRange(sheetName);
    } catch {
        return { values: [] };
    }
}
async function appendToSheet(sheetName, data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A1:append?valueInputOption=RAW&key=${API_KEY}`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: data })
    });
    return resp.json();
}
async function updateSheet(sheetName, range, data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!${range}?valueInputOption=RAW&key=${API_KEY}`;
    const resp = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: data })
    });
    return resp.json();
}
async function createSheet(sheetName, headers) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate?key=${API_KEY}`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: sheetName } } }]
        })
    });
    await appendToSheet(sheetName, [headers]);
}

// ========== LOADERS ==========

async function loadMasterData() {
    try {
        // Materials
        const materialsData = await fetchSheetRangeIfExist('Materials');
        if (materialsData.values && materialsData.values.length > 1) {
            materials = materialsData.values.slice(1).map(row => ({
                code: row[0], name: row[1], category: row[2], unit: row[3],
                minStock: row[4], isExpirable: row[5] === 'TRUE', notes: row[6]
            }));
            categories = [...new Set(materials.map(m => m.category))];
            units = [...new Set(materials.map(m => m.unit))];
        } else if (!materialsData.values) {
            await createSheet('Materials', ['Kode', 'Nama', 'Kategori', 'Satuan', 'Min Stok', 'Expirable', 'Catatan']);
        }
        // Locations
        const locationsData = await fetchSheetRangeIfExist('Locations');
        if (locationsData.values && locationsData.values.length > 1) {
            locations = locationsData.values.slice(1).map(row => row[0]);
        } else if (!locationsData.values) {
            await createSheet('Locations', ['Nama Lokasi']);
            locations = ['Gudang Utama'];
            await appendToSheet('Locations', [['Gudang Utama']]);
        }
    } catch (e) {
        showError('Gagal memuat data master. Silakan coba lagi.');
    }
}

async function loadStockData() {
    try {
        const stock = await fetchSheetRangeIfExist('Stock');
        if (stock.values && stock.values.length > 1) {
            stockData = stock.values.slice(1).map(row => ({
                materialCode: row[0], batch: row[1], quantity: parseFloat(row[2]),
                location: row[3], expiryDate: row[4] || null
            }));
        } else if (!stock.values) {
            await createSheet('Stock', ['Kode Material', 'Batch', 'Qty', 'Lokasi', 'Expired Date']);
        }
    } catch (e) {
        showError('Gagal memuat data stok. Silakan coba lagi.');
    }
}

async function loadTransactionData() {
    try {
        // Requests
        const req = await fetchSheetRangeIfExist('MaterialRequests');
        requests = [];
        if (req.values && req.values.length > 1) {
            requests = req.values.slice(1).map(row => ({
                number: row[0], date: row[1], training: row[2], status: row[3], createdBy: row[4], notes: row[5], items: []
            }));
        } else if (!req.values) {
            await createSheet('MaterialRequests', ['No. Permintaan', 'Tanggal', 'Pelatihan', 'Status', 'Dibuat Oleh', 'Catatan']);
        }
        // Request Items
        const reqItems = await fetchSheetRangeIfExist('MaterialRequestItems');
        if (reqItems.values && reqItems.values.length > 1) {
            reqItems.values.slice(1).forEach(row => {
                const r = requests.find(x => x.number === row[0]);
                if (r) {
                    r.items = r.items || [];
                    r.items.push({ materialCode: row[1], quantity: parseFloat(row[2]), purpose: row[3] });
                }
            });
        } else if (!reqItems.values) {
            await createSheet('MaterialRequestItems', ['No. Permintaan', 'Kode Material', 'Qty', 'Kebutuhan']);
        }

        // Receipts
        const rec = await fetchSheetRangeIfExist('MaterialReceipts');
        receipts = [];
        if (rec.values && rec.values.length > 1) {
            receipts = rec.values.slice(1).map(row => ({
                number: row[0], date: row[1], supplier: row[2], poNumber: row[3], location: row[4], createdBy: row[5], notes: row[6], items: []
            }));
        } else if (!rec.values) {
            await createSheet('MaterialReceipts', ['No. Penerimaan', 'Tanggal', 'Supplier', 'No. PO', 'Lokasi', 'Dibuat Oleh', 'Catatan']);
        }
        // Receipt Items
        const recItems = await fetchSheetRangeIfExist('MaterialReceiptItems');
        if (recItems.values && recItems.values.length > 1) {
            recItems.values.slice(1).forEach(row => {
                const r = receipts.find(x => x.number === row[0]);
                if (r) {
                    r.items = r.items || [];
                    r.items.push({ materialCode: row[1], batch: row[2], quantity: parseFloat(row[3]), expiryDate: row[4] || null });
                }
            });
        } else if (!recItems.values) {
            await createSheet('MaterialReceiptItems', ['No. Penerimaan', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
        }

        // Usages
        const usage = await fetchSheetRangeIfExist('MaterialUsages');
        usages = [];
        if (usage.values && usage.values.length > 1) {
            usages = usage.values.slice(1).map(row => ({
                number: row[0], date: row[1], training: row[2], location: row[3], createdBy: row[4], notes: row[5], items: []
            }));
        } else if (!usage.values) {
            await createSheet('MaterialUsages', ['No. Pengeluaran', 'Tanggal', 'Pelatihan', 'Lokasi', 'Dikeluarkan Oleh', 'Catatan']);
        }
        // Usage Items
        const usageItems = await fetchSheetRangeIfExist('MaterialUsageItems');
        if (usageItems.values && usageItems.values.length > 1) {
            usageItems.values.slice(1).forEach(row => {
                const u = usages.find(x => x.number === row[0]);
                if (u) {
                    u.items = u.items || [];
                    u.items.push({ materialCode: row[1], batch: row[2], quantity: parseFloat(row[3]) });
                }
            });
        } else if (!usageItems.values) {
            await createSheet('MaterialUsageItems', ['No. Pengeluaran', 'Kode Material', 'Batch', 'Qty']);
        }

        // Adjustments
        const adj = await fetchSheetRangeIfExist('StockAdjustments');
        adjustments = [];
        if (adj.values && adj.values.length > 1) {
            adjustments = adj.values.slice(1).map(row => ({
                number: row[0], date: row[1], location: row[2], reason: row[3], createdBy: row[4], notes: row[5], items: []
            }));
        } else if (!adj.values) {
            await createSheet('StockAdjustments', ['No. Penyesuaian', 'Tanggal', 'Lokasi', 'Alasan', 'Dilakukan Oleh', 'Catatan']);
        }
        // Adjustment Items
        const adjItems = await fetchSheetRangeIfExist('StockAdjustmentItems');
        if (adjItems.values && adjItems.values.length > 1) {
            adjItems.values.slice(1).forEach(row => {
                const a = adjustments.find(x => x.number === row[0]);
                if (a) {
                    a.items = a.items || [];
                    a.items.push({ materialCode: row[1], batch: row[2], systemQty: parseFloat(row[3]), physicalQty: parseFloat(row[4]), difference: parseFloat(row[5]) });
                }
            });
        } else if (!adjItems.values) {
            await createSheet('StockAdjustmentItems', ['No. Penyesuaian', 'Kode Material', 'Batch', 'Qty Sistem', 'Qty Fisik', 'Selisih']);
        }

        // Destructions
        const destr = await fetchSheetRangeIfExist('StockDestructions');
        destructions = [];
        if (destr.values && destr.values.length > 1) {
            destructions = destr.values.slice(1).map(row => ({
                number: row[0], date: row[1], location: row[2], reason: row[3], method: row[4], createdBy: row[5], notes: row[6], items: []
            }));
        } else if (!destr.values) {
            await createSheet('StockDestructions', ['No. Pemusnahan', 'Tanggal', 'Lokasi', 'Alasan', 'Metode', 'Dilakukan Oleh', 'Catatan']);
        }
        // Destruction Items
        const destrItems = await fetchSheetRangeIfExist('StockDestructionItems');
        if (destrItems.values && destrItems.values.length > 1) {
            destrItems.values.slice(1).forEach(row => {
                const d = destructions.find(x => x.number === row[0]);
                if (d) {
                    d.items = d.items || [];
                    d.items.push({ materialCode: row[1], batch: row[2], quantity: parseFloat(row[3]), expiryDate: row[4] || null });
                }
            });
        } else if (!destrItems.values) {
            await createSheet('StockDestructionItems', ['No. Pemusnahan', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
        }

        // Transfers
        const tf = await fetchSheetRangeIfExist('StockTransfers');
        transfers = [];
        if (tf.values && tf.values.length > 1) {
            transfers = tf.values.slice(1).map(row => ({
                number: row[0], date: row[1], fromLocation: row[2], toLocation: row[3], createdBy: row[4], notes: row[5], items: []
            }));
        } else if (!tf.values) {
            await createSheet('StockTransfers', ['No. Transfer', 'Tanggal', 'Dari Lokasi', 'Ke Lokasi', 'Dilakukan Oleh', 'Catatan']);
        }
        // Transfer Items
        const tfItems = await fetchSheetRangeIfExist('StockTransferItems');
        if (tfItems.values && tfItems.values.length > 1) {
            tfItems.values.slice(1).forEach(row => {
                const t = transfers.find(x => x.number === row[0]);
                if (t) {
                    t.items = t.items || [];
                    t.items.push({ materialCode: row[1], batch: row[2], quantity: parseFloat(row[3]), expiryDate: row[4] || null });
                }
            });
        } else if (!tfItems.values) {
            await createSheet('StockTransferItems', ['No. Transfer', 'Kode Material', 'Batch', 'Qty', 'Expired Date']);
        }

        // Activities
        const act = await fetchSheetRangeIfExist('Activities');
        activities = [];
        if (act.values && act.values.length > 1) {
            activities = act.values.slice(1).map(row => ({
                date: row[0], type: row[1], documentNumber: row[2], materialCode: row[3], quantity: parseFloat(row[4]), location: row[5], user: row[6]
            }));
        } else if (!act.values) {
            await createSheet('Activities', ['Tanggal', 'Tipe', 'No. Dokumen', 'Kode Material', 'Qty', 'Lokasi', 'User']);
        }
    } catch (e) {
        showError('Gagal memuat data transaksi. Silakan coba lagi.');
    }
}

// Untuk update stock dan activity, fungsi ditaruh di main.js sesuai aksi transaksi (biar tetap terstruktur).
window.api = {
    fetchSheetRange, appendToSheet, updateSheet, createSheet,
    loadMasterData, loadStockData, loadTransactionData,
};
