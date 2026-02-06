// --- INITIALIZATION ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Databases
const grassData = [
    { name: "Tall Fescue", type: "Cool Season", features: "Wide blades, bunch-type growth, deep green." },
    { name: "Kentucky Bluegrass", type: "Cool Season", features: "Boat-shaped tips, soft texture, spreads via rhizomes." },
    { name: "Bermuda", type: "Warm Season", features: "Fine texture, aggressive spreader, dormant in winter." },
    { name: "St. Augustine", type: "Warm Season", features: "Wide, rounded blades, coarse texture, salt-tolerant." }
];

const fungusData = [
    { name: "Brown Patch", symptoms: "Circular brown patches. Common in humidity/heat." },
    { name: "Dollar Spot", symptoms: "Small spots (silver dollar size). Hourglass leaf lesions." },
    { name: "Red Thread", symptoms: "Pink/Red threads on leaf tips. Common in cool, wet weather." }
];

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
    updateUI(); // Refresh content for the specific page
}

// --- EQUIPMENT & BLADES ---
function resetBladeCounter() {
    localStorage.setItem('mowsAtLastSharpen', getCurrentMowCount());
    updateUI();
}

function getCurrentMowCount() {
    // This looks at your logs. If no logs exist, it defaults to 0.
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    return logs.filter(l => l.type === 'Mow').length;
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

// --- DIGITAL TOOLS ---
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
    document.getElementById('levelAdvice').innerText = Math.abs(angle) < 0.5 ? "PERFECTLY LEVEL" : (angle > 0 ? "LOW ON LEFT/FRONT" : "LOW ON RIGHT/BACK");
}

// --- PHOTO UPLOAD ---
function uploadPhoto() {
    const file = document.getElementById('photoInput').files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        let photos = JSON.parse(localStorage.getItem('lawnPhotos') || '[]');
        photos.unshift({ date: new Date().toLocaleDateString(), data: reader.result });
        if (photos.length > 4) photos.pop(); 
        localStorage.setItem('lawnPhotos', JSON.stringify(photos));
        updateUI();
    };
    if (file) reader.readAsDataURL(file);
}

// --- CORE UI UPDATE ---
function updateUI() {
    // GDD Update
    const totalGDD = localStorage.getItem('totalGDD') || 0;
    const gddDisplay = document.getElementById('gddTotalDisplay');
    if (gddDisplay) gddDisplay.innerText = `Total Season GDD: ${Math.round(totalGDD)}`;

    // Blade Counter Update
    const mowsDisplay = document.getElementById('mowsSinceReset');
    if (mowsDisplay) {
        const lastReset = parseInt(localStorage.getItem('mowsAtLastSharpen') || 0);
        const current = getCurrentMowCount();
        mowsDisplay.innerText = `Mows since sharpen: ${current - lastReset}`;
    }

    // Grass Grid Update
    const grassGrid = document.getElementById('grassGrid');
    if (grassGrid) {
        grassGrid.innerHTML = grassData.map(g => `
            <div class="db-card">
                <strong>${g.name}</strong><br>
                <small>${g.features}</small>
            </div>
        `).join('');
    }

    // Fungus Grid Update
    const fungusGrid = document.getElementById('fungusLibrary');
    if (fungusGrid) {
        fungusGrid.innerHTML = fungusData.map(f => `
            <div class="db-card" style="border-top: 3px solid var(--accent);">
                <strong>${f.name}</strong><br>
                <small>${f.symptoms}</small>
            </div>
        `).join('');
    }

    // Photo Grid Update
    const photoGrid = document.getElementById('photoGrid');
    if (photoGrid) {
        const photos = JSON.parse(localStorage.getItem('lawnPhotos') || '[]');
        photoGrid.innerHTML = photos.map(p => `
            <div class="db-card">
                <img src="${p.data}" style="width:100%; border-radius:5px;">
                <div style="font-size:10px; text-align:center;">${p.date}</div>
            </div>
        `).join('');
    }
}

// Run update on load
window.onload = updateUI;
