// js/api.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwp7rkFVgcTPzkpDPGTJZBoS5JD1C_ZrCws1EwxFZhUpEU91BNw2Z7yRPu1DBtmtuc7/exec';

export async function getMaterials() {
    const res = await fetch(`${GAS_URL}?sheet=Materials`);
    const json = await res.json();
    return json.data || [];
}
export async function addMaterial(mat) {
    const res = await fetch(`${GAS_URL}?sheet=Materials&action=add`, {
        method: 'POST',
        body: JSON.stringify(mat),
    });
    return await res.json();
}
export async function editMaterial(mat) {
    const res = await fetch(`${GAS_URL}?sheet=Materials&action=edit`, {
        method: 'POST',
        body: JSON.stringify(mat),
    });
    return await res.json();
}
export async function deleteMaterial(id) {
    const res = await fetch(`${GAS_URL}?sheet=Materials&action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id }),
    });
    return await res.json();
}
