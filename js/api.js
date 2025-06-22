// js/api.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzWdYPkK47bQLi2MvpMUOAoFNCjldYJRjw3oOSm0VrIXqB0DpjjMQrlqexjfP4drQUA/exec';

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
