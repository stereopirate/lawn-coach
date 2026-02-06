// --- DATABASES ---
const grassData = [
    { name: "Tall Fescue", features: "Deep roots, bunch growth. Mow 3.5\"-4\"." },
    { name: "Kentucky Blue", features: "Rhizomes, boat-shaped tips. Mow 2.5\"-3\"." },
    { name: "Bermuda", features: "Sun lover, aggressive spreading. Mow 1\"-2\"." }
];

const fungusData = [
    { name: "Brown Patch", symp: "Large brown circles. Avoid night watering." },
    { name: "Dollar Spot", symp: "Small tan spots. Needs Nitrogen." }
];

// --- APP CORE ---
const navLinks = document.getElementById('navLinks');
document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    updateUI();
}

// --- LOGIC FUNCTIONS ---
function saveEquipment() {
    localStorage.setItem('activeMower', document.getElementById('mowerSelect').value);
    updateUI();
}

function setGrassType(name) {
    localStorage.setItem('userGrassType', name);
    updateUI();
}

function addGDD() {
    let total = parseFloat(localStorage.getItem('totalGDD') || 0);
    total += parseFloat(document.getElementById('manualGDD').value || 0);
    localStorage.setItem('totalGDD', total);
    document.getElementById('manualGDD').value = '';
    updateUI();
}

function saveSoilTest() {
    const ph = document.getElementById('soilPH').value;
    const n = document.getElementById('soilN').value;
    localStorage.setItem('soilData', JSON.stringify({ ph, n, date: new Date().toLocaleDateString() }));
    updateUI();
}

function resetBladeCounter() {
    localStorage.setItem('mowsAtLastSharpen', 5); // Placeholder for logic
    updateUI();
}

// --- LEVELER ---
let levelMode = 'side';
function setLevelMode(m) { levelMode = m; updateUI(); }
function startLeveler() {
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then(s => { if(s=='granted') window.addEventListener('deviceorientation', handleLevel); });
    } else { window.addEventListener('deviceorientation', handleLevel); }
}
function handleLevel(e) {
    let angle = levelMode === 'side' ? e.gamma : e.beta;
    document.getElementById('levelDisplay').innerText = angle.toFixed(1) + "°";
}

// --- PHOTO LOGIC ---
function uploadPhoto() {
    const file = document.getElementById('photoInput').files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        let photos = JSON.parse(localStorage.getItem('lawnPhotos') || '[]');
        photos.unshift({ date: new Date().toLocaleDateString(), data: reader.result });
        localStorage.setItem('lawnPhotos', JSON.stringify(photos.slice(0, 4)));
        updateUI();
    };
    if (file) reader.readAsDataURL(file);
}

// --- UI UPDATE ---
function updateUI() {
    // Persistence
    document.getElementById('activeMowerDisplay').innerText = "Active: " + (localStorage.getItem('activeMower') || "Toro TimeMaster 30\"");
    document.getElementById('gddTotalDisplay').innerText = "Total Season GDD: " + Math.round(localStorage.getItem('totalGDD') || 0);
    
    // Soil
    const soil = JSON.parse(localStorage.getItem('soilData') || '{}');
    document.getElementById('soilDisplay').innerHTML = soil.ph ? `Last Test (${soil.date}): <b>pH ${soil.ph}</b> | <b>N ${soil.n}ppm</b>` : "No soil test on record.";

    // Grass DB
    const userGrass = localStorage.getItem('userGrassType');
    document.getElementById('grassGrid').innerHTML = grassData.map(g => `
        <div class="db-card" style="${userGrass === g.name ? 'border:2px solid var(--accent)' : ''}">
            <b>${g.name}</b><br><small>${g.features}</small>
            <button onclick="setGrassType('${g.name}')" class="btn-save" style="padding:4px; font-size:10px; margin-top:5px">Select</button>
        </div>
    `).join('');

    // Fungus
    document.getElementById('fungusLibrary').innerHTML = fungusData.map(f => `
        <div class="db-card"><b>${f.name}</b><br><small>${f.symp}</small></div>
    `).join('');

    // Gallery
    const photos = JSON.parse(localStorage.getItem('lawnPhotos') || '[]');
    document.getElementById('photoGrid').innerHTML = photos.map(p => `<img src="${p.data}" style="width:100%; border-radius:8px;">`).join('');

    // Coaching
    let advice = "Check GDD for timing.";
    if (userGrass === "Tall Fescue") advice = "💡 Mow your Fescue at 4\" to shade soil and prevent weeds.";
    if (parseFloat(localStorage.getItem('totalGDD')) > 50) advice += "<br>⚠️ GDD Alert: Crabgrass germination active.";
    document.getElementById('coachAction').innerHTML = advice;
}

window.onload = updateUI;
