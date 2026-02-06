let selectedEquipId = null;
let levelMode = 'side';

// --- MENU TOGGLE ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
};

document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    navLinks.classList.remove('show');
    render();
}

// --- LEVELER ---
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
    let angle = levelMode === 'side' ? e.gamma : e.beta;
    const display = document.getElementById('levelDisplay');
    display.innerText = angle.toFixed(1) + "°";
    display.style.color = Math.abs(angle) < 0.5 ? "#27ae60" : "#ff7675";
}

// --- INITIALIZE & RENDER ---
function render() {
    // Logic for Grass DB, Photo Gallery, and Coach Corner...
    // Ensure renderFungusLibrary() and renderGrassDB() are called here
}

window.onload = render;
