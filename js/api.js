// js/api.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwgvpUkeNSoqfDBTzyK2oj15ciObC9KstoLZo_tRtoEcW6M5f76gDNRsS1r9ZWMETg/exec';

const SHEETS = ['Categories', 'Units', 'Locations'];
for (const s of SHEETS) {
  window['get'+s] = async function() {
    const res = await fetch(`${GAS_URL}?sheet=${s}`);
    const json = await res.json();
    return json.data || [];
  };
  window['add'+s.slice(0,-1)] = async function(data) {
    const res = await fetch(`${GAS_URL}?sheet=${s}&action=add`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  };
  window['edit'+s.slice(0,-1)] = async function(data) {
    const res = await fetch(`${GAS_URL}?sheet=${s}&action=edit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  };
  window['delete'+s.slice(0,-1)] = async function(id) {
    const res = await fetch(`${GAS_URL}?sheet=${s}&action=delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
    return await res.json();
  };
}