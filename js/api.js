// js/api.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwgvpUkeNSoqfDBTzyK2oj15ciObC9KstoLZo_tRtoEcW6M5f76gDNRsS1r9ZWMETg/exec';

// Tambahkan semua entitas yang ada di aplikasi Anda di sini:
const SHEETS = [
  { sheet: 'Materials', singular: 'Material' },
  { sheet: 'Categories', singular: 'Category' },
  { sheet: 'Units', singular: 'Unit' },
  { sheet: 'Locations', singular: 'Location' },
  { sheet: 'Requests', singular: 'Request' },
  { sheet: 'Receipts', singular: 'Receipt' },
  { sheet: 'Usages', singular: 'Usage' },
  { sheet: 'Adjustments', singular: 'Adjustment' }
  
];

// CRUD otomatis untuk semua sheet di atas:
for (const s of SHEETS) {
  // Ambil seluruh data (GET)
  window['get'+s.sheet] = async function() {
    const res = await fetch(`${GAS_URL}?sheet=${s.sheet}`);
    const json = await res.json();
    return json.data || [];
  };
  // Tambah data (ADD)
  window['add'+s.singular] = async function(data) {
    const res = await fetch(`${GAS_URL}?sheet=${s.sheet}&action=add`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  };
  // Edit data (EDIT)
  window['edit'+s.singular] = async function(data) {
    const res = await fetch(`${GAS_URL}?sheet=${s.sheet}&action=edit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  };
  // Hapus data (DELETE)
  window['delete'+s.singular] = async function(id) {
    const res = await fetch(`${GAS_URL}?sheet=${s.sheet}&action=delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    return await res.json();
  };
}
