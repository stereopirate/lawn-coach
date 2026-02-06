let selectedEquipId = null;
let levelMode = 'side';

// --- NAVIGATION ---
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    navLinks.classList.remove('show');
    render();
}

// --- GDD LOGIC ---
function addGDD() {
    const input = parseFloat(document.getElementById('manualGDD').value) || 0;
    let total = parseFloat(localStorage.getItem('totalGDD')) || 0;
    total += input;
    localStorage.setItem('totalGDD', total);
    document.getElementById('manualGDD').value = '';
    render();
}

// --- DIGITAL TOOLS (LEVELER) ---
function setLevelMode(mode) {
    levelMode = mode;
    document.getElementById('btnSide').style.background = mode === 'side' ? 'var(--accent)' : '#555';
    document.getElementById('btnRake').style.background = mode === 'rake' ? 'var(--accent)' : '#555';
}

function startLeveler() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation);
        });
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function handleOrientation(event) {
    const display = document.getElementById('levelDisplay');
    const advice = document.getElementById('levelAdvice');
    let angle = levelMode === 'side' ? event.gamma : event.beta;
    display.innerText = angle.toFixed(1) + "°";

    if (levelMode === 'side') {
        if (Math.abs(angle) < 0.5) { display.style.color = "#27ae60"; advice.innerText = "PERFECTLY LEVEL"; }
        else { display.style.color = "#ff7675"; advice.innerText = angle > 0 ? "LOW ON LEFT" : "LOW ON RIGHT"; }
    } else {
        // Rake target: 0.5 to 1.5 degrees forward tilt
        if (angle >= 0.5 && angle <= 1.5) { display.style.color = "#27ae60"; advice.innerText = "OPTIMAL RAKE"; }
        else { display.style.color = "#ff7675"; advice.innerText = angle < 0.5 ? "TOO FLAT" : "TOO MUCH RAKE"; }
    }
}

// --- EQUIPMENT & BLADES ---
function resetBladeCounter() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    localStorage.setItem('mowsAtLastSharpen', logs.filter(l => l.type === 'Mow').length);
    render();
}

function render() {
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const totalGDD = Math.round(localStorage.getItem('totalGDD') || 0);

    if(document.getElementById('gddTotalDisplay')) 
        document.getElementById('gddTotalDisplay').innerText = `Total Season GDD: ${totalGDD}`;

    // Blade Counter
    const activeMower = eq.find(e => e.id === selectedEquipId && e.type === 'mower');
    const bladeCard = document.getElementById('bladeStatusCard');
    if (activeMower && bladeCard) {
        bladeCard.style.display = 'block';
        const lastSharpen = parseInt(localStorage.getItem('mowsAtLastSharpen') || 0);
        const current = logs.filter(l => l.type === 'Mow').length;
        document.getElementById('mowsSinceReset').innerText = `Mows since sharpen: ${current - lastSharpen}`;
    }

    // Call updateCoachCorner...
}
