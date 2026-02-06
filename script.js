// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// --- NAVIGATION ---
const navLinks = document.getElementById('navLinks');
document.getElementById('menuToggle').onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
};
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.classList.add('active');
    navLinks.classList.remove('show');
}

// --- GDD LOGIC ---
function addGDD() {
    const val = parseFloat(document.getElementById('manualGDD').value) || 0;
    let total = parseFloat(localStorage.getItem('totalGDD')) || 0;
    total += val;
    localStorage.setItem('totalGDD', total);
    document.getElementById('manualGDD').value = '';
    updateUI();
}

// --- LEVELER ---
let levelMode = 'side';
function setLevelMode(mode) {
    levelMode = mode;
    document.getElementById('btnSide').classList.toggle('active', mode === 'side');
    document.getElementById('btnRake').classList.toggle('active', mode === 'rake');
}

function startLeveler() {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') window.addEventListener('deviceorientation', handleLevel);
        });
    } else {
        window.addEventListener('deviceorientation', handleLevel);
    }
}

function handleLevel(e) {
    let angle = (levelMode === 'side') ? e.gamma : e.beta;
    document.getElementById('levelDisplay').innerText = angle.toFixed(1) + "°";
}

// --- UI UPDATES ---
function updateUI() {
    const totalGDD = localStorage.getItem('totalGDD') || 0;
    const gddDisplay = document.getElementById('gddTotalDisplay');
    if (gddDisplay) gddDisplay.innerText = `Total Season GDD: ${Math.round(totalGDD)}`;
    
    // Auto-populate Grass Library if empty
    const grassGrid = document.getElementById('grassGrid');
    if (grassGrid && grassGrid.children.length === 0) {
        const grasses = [
            {n:'Tall Fescue', f:'Bunch type, wide blade'},
            {n:'Kentucky Blue', f:'Boat-shaped tip, soft'},
            {n:'Bermuda', f:'Warm season, aggressive'},
            {n:'St. Augustine', f:'Wide rounded blades'}
        ];
        grassGrid.innerHTML = grasses.map(g => `<div class="db-card"><b>${g.n}</b><br>${g.f}</div>`).join('');
    }
}

// Ensure UI updates on load
window.onload = updateUI;
