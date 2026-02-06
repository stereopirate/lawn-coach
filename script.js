let mowingChart = null;
const API_KEY = '9e2c8cda4fb95a6d8392dd058bab70da'; 
let selectedEquipId = null;

const MOWER_MODELS = ["Toro TimeMaster 30\"", "EGO Power+ LM2130SP", "Toro Recycler Max", "Honda HRX217", "John Deere S120", "Other"];
const SPREADER_MODELS = ["Echo RB-60", "Scotts EdgeGuard DLX", "Scotts Elite", "Earthway 2150", "Other"];

const GRASS_PROFILES = {
    tall_fescue: { name: "Tall Fescue", water: 1.5, height: "3.5\"", freq: 20, notch: "6 or 7" },
    kentucky_bluegrass: { name: "Kentucky Bluegrass", water: 1.2, height: "3.0\"", freq: 15, notch: "5 or 6" },
    bermuda: { name: "Bermuda", water: 1.0, height: "1.5\"", freq: 25, notch: "2 or 3" },
    zoysia: { name: "Zoysia", water: 1.0, height: "2.0\"", freq: 25, notch: "3 or 4" },
    st_augustine: { name: "St. Augustine", water: 1.25, height: "3.5\"", freq: 20, notch: "6" }
};

// --- NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    render();
}

const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');
menuToggle.onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };
document.onclick = () => navLinks.classList.remove('show');

// --- COACH'S CORNER BRAIN ---
function updateCoachCorner() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const grassKey = localStorage.getItem('grassType') || 'tall_fescue';
    const profile = GRASS_PROFILES[grassKey];
    const ph = parseFloat(localStorage.getItem('soilPH')) || 7.0;
    const month = new Date().getMonth();
    const coachDiv = document.getElementById('coachAction');

    // Priority 1: Mechanical (Mower Blade)
    const mowsSinceSharpen = logs.filter(l => l.type === 'Mow').length; // Simplification for demo
    if (mowsSinceSharpen > 0 && mowsSinceSharpen % profile.freq === 0) {
        coachDiv.innerHTML = `🚨 <strong>Blade Sharpness:</strong> You've hit ${mowsSinceSharpen} mows. It's time to sharpen your blades to keep your ${profile.name} healthy.`;
        return;
    }

    // Priority 2: Biological (pH)
    if (ph < 6.2) {
        coachDiv.innerHTML = `🧪 <strong>Soil Action:</strong> Your pH is low (${ph}). Apply <strong>Lime</strong> to unlock nutrients for your lawn.`;
        return;
    }

    // Priority 3: Hydration
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyWater = logs.filter(l => l.type === 'Water' && new Date(l.date) >= weekAgo).reduce((s, l) => s + l.amount, 0);
    if (weeklyWater < profile.water) {
        coachDiv.innerHTML = `💧 <strong>Watering:</strong> You're below your ${profile.water}" goal. Give the yard about ${(profile.water - weeklyWater).toFixed(1)}" of water soon.`;
        return;
    }

    // Priority 4: Seasonal
    if (month >= 2 && month <= 4) coachDiv.innerHTML = "🌱 <strong>Spring Launch:</strong> Soil is warming up. Time for pre-emergent herbicide!";
    else if (month >= 8 && month <= 10) coachDiv.innerHTML = "🍂 <strong>Fall Reset:</strong> Perfect window for aeration and overseeding.";
    else coachDiv.innerHTML = `✅ <strong>All Clear:</strong> Keep mowing at <strong>${profile.height}</strong> and enjoy the lawn!`;
}

// --- CORE RENDER ---
function render() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const grassKey = localStorage.getItem('grassType') || 'tall_fescue';
    const profile = GRASS_PROFILES[grassKey];
    const ph = parseFloat(localStorage.getItem('soilPH')) || 7.0;

    updateCoachCorner();

    // Yard Rendering
    document.getElementById('grassTypeSelector').value = grassKey;
    document.getElementById('soilPH').value = ph;
    document.getElementById('soilAdvice').innerText = ph < 6.5 ? "Low pH: Needs Lime." : (ph > 7.2 ? "High pH: Needs Sulfur." : "Optimal pH.");
    document.getElementById('mowHeightAdvice').innerHTML = `For ${profile.name}, set levers to <strong>${profile.notch}</strong> (${profile.height}).`;

    // Dashboard Rendering
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyWater = logs.filter(l => l.type === 'Water' && new Date(l.date) >= weekAgo).reduce((s, l) => s + l.amount, 0);
    document.getElementById('waterStat').innerText = `${weeklyWater.toFixed(1)} / ${profile.water}"`;
    document.getElementById('waterBar').style.width = Math.min((weeklyWater / profile.water) * 100, 100) + '%';

    // Equipment Rendering
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    document.getElementById('mowerSelect').innerHTML = MOWER_MODELS.map(m => `<option value="${m}">${m}</option>`).join('');
    document.getElementById('spreaderSelect').innerHTML = SPREADER_MODELS.map(s => `<option value="${s}">${s}</option>`).join('');
    
    document.getElementById('equipmentList').innerHTML = eq.map(e => `
        <div class="history-item" onclick="selectEquip(${e.id})" style="cursor:pointer; background:#fff; padding:10px; margin-bottom:5px; border-radius:8px; border: 1px solid ${selectedEquipId === e.id ? 'var(--accent)' : '#eee'}">
            <span>${e.type === 'mower' ? '🚜' : '⚙️'} ${e.name}</span>
            <button onclick="deleteEquip(${e.id}); event.stopPropagation();" class="btn-delete">🗑️</button>
        </div>
    `).join('');

    if (selectedEquipId) {
        const active = eq.find(e => e.id === selectedEquipId);
        if (active.type === 'mower') {
            document.getElementById('activeMowerName').innerText = active.name;
            document.getElementById('activeServiceHistory').innerHTML = active.services.slice().reverse().map(s => `
                <div class="history-item"><small>${s.date}: ${s.task}</small></div>
            `).join('');
        }
    }

    // History
    document.getElementById('historyList').innerHTML = logs.slice().reverse().map(log => `
        <div class="history-item">
            <div><strong>${log.type}</strong><br><small>${log.date}</small></div>
            <button onclick="deleteLog(${log.id})" class="btn-delete">🗑️</button>
        </div>
    `).join('');

    renderChart(logs);
}

// --- EQUIPMENT HELPERS ---
function addEquipment(type) {
    const sel = type === 'mower' ? 'mowerSelect' : 'spreaderSelect';
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    eq.push({ id: Date.now(), name: document.getElementById(sel).value, type, services: [] });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function selectEquip(id) {
    selectedEquipId = id;
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const active = eq.find(e => e.id === id);
    document.getElementById('mowerServiceSection').style.display = active.type === 'mower' ? 'block' : 'none';
    document.getElementById('spreaderToolSection').style.display = active.type === 'spreader' ? 'block' : 'none';
    render();
}

function deleteEquip(id) {
    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    localStorage.setItem('lawnEquip', JSON.stringify(eq.filter(e => e.id !== id)));
    if (selectedEquipId === id) selectedEquipId = null;
    render();
}

function saveService() {
    const task = document.getElementById('serviceTask').value;
    const date = document.getElementById('serviceDate').value;
    if (!date || !selectedEquipId) return;
    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const idx = eq.findIndex(i => i.id === selectedEquipId);
    eq[idx].services.push({ task, date });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

// --- CALCS & LOGS ---
function runCalibrationCalc() {
    const w = parseFloat(document.getElementById('bagWeight').value);
    const c = parseFloat(document.getElementById('bagCoverage').value);
    if (w && c) document.getElementById('calResult').innerHTML = `Target: <strong>${((w/c)*100).toFixed(2)} lbs</strong> per 100 sq. ft.`;
}

function calculateMaterials() {
    const sq = parseFloat(document.getElementById('projSqFt').value);
    const d = parseFloat(document.getElementById('projDepth').value);
    if (sq && d) document.getElementById('projResult').innerHTML = `Total: <strong>${((sq*(d/12))/27).toFixed(2)} Cubic Yards</strong>`;
}

function toggleInputs() {
    const type = document.getElementById('actType').value;
    document.getElementById('waterInput').style.display = type === 'Water' ? 'block' : 'none';
    document.getElementById('fertInput').style.display = type === 'Fertilize' ? 'block' : 'none';
}

function deleteLog(id) {
    let logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    localStorage.setItem('lawnLogs', JSON.stringify(logs.filter(l => l.id !== id)));
    render();
}

const activityForm = document.getElementById('activityForm');
if (activityForm) {
    activityForm.onsubmit = (e) => {
        e.preventDefault();
        const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
        logs.push({
            id: Date.now(),
            type: document.getElementById('actType').value,
            date: document.getElementById('actDate').value,
            amount: parseFloat(document.getElementById('actAmount').value) || 0,
            n: parseFloat(document.getElementById('valInputN').value) || 0,
            p: parseFloat(document.getElementById('valInputP').value) || 0,
            k: parseFloat(document.getElementById('valInputK').value) || 0
        });
        localStorage.setItem('lawnLogs', JSON.stringify(logs));
        activityForm.reset(); render();
    };
}

// --- WEATHER & CHART ---
async function fetchWeather(zip) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) document.getElementById('temp').innerText = Math.round(data.main.temp) + '°F';
    } catch (e) { console.error(e); }
}

function saveZip() {
    const zip = document.getElementById('zipCode').value;
    if (zip.length === 5) { localStorage.setItem('lawnZip', zip); fetchWeather(zip); }
}

function renderChart(logs) {
    const mows = logs.filter(l => l.type === 'Mow').sort((a,b) => new Date(a.date) - new Date(b.date));
    const ctx = document.getElementById('mowingChart').getContext('2d');
    if (mowingChart) mowingChart.destroy();
    mowingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mows.map(m => m.date),
            datasets: [{ label: 'Cumulative Mows', data: mows.map((_, i) => i + 1), borderColor: '#27ae60', fill: true, tension: 0.3 }]
        },
        options: { maintainAspectRatio: false }
    });
}

window.onload = () => {
    const zip = localStorage.getItem('lawnZip');
    if (zip) { document.getElementById('zipCode').value = zip; fetchWeather(zip); }
    render();
};
