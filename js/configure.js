document.getElementById('sport').value = localStorage.getItem('sport');
document.getElementById('surface').value = localStorage.getItem('surface');
document.getElementById('pport').value = localStorage.getItem('pport');
document.getElementById('pip').value = localStorage.getItem('pip');
document.getElementById('bport').value = localStorage.getItem('bport');
document.getElementById('bip').value = localStorage.getItem('bip');
document.getElementById('vip').value = localStorage.getItem('vip');
document.getElementById('vport').value = localStorage.getItem('vport');
document.getElementById('mouse').value = localStorage.getItem('mouse');

document.getElementById('save').onclick = function() {
    localStorage.setItem('sport', document.getElementById('sport').value);
    localStorage.setItem('surface', document.getElementById('surface').value);
    localStorage.setItem('pport', document.getElementById('pport').value);
    localStorage.setItem('pip', document.getElementById('pip').value);
    localStorage.setItem('bport', document.getElementById('bport').value);
    localStorage.setItem('bip', document.getElementById('bip').value);
    localStorage.setItem('vip', document.getElementById('vip').value);
    localStorage.setItem('vport', document.getElementById('vport').value);
    localStorage.setItem('mouse', document.getElementById('mouse').value);    
};