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
const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');
menuToggle.onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
    render();
}

// --- LOGGING & DATA ---
function toggleInputs() {
    const type = document.getElementById('actType').value;
    document.getElementById('waterInput').style.display = type === 'Water' ? 'block' : 'none';
    document.getElementById('fertInput').style.display = type === 'Fertilize' ? 'block' : 'none';
}

const activityForm = document.getElementById('activityForm');
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
    activityForm.reset();
    toggleInputs();
    render();
};

function deleteLog(id) {
    let logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    localStorage.setItem('lawnLogs', JSON.stringify(logs.filter(l => l.id !== id)));
    render();
}

// --- YARD LOGIC ---
function saveSoil() { localStorage.setItem('soilPH', document.getElementById('soilPH').value); render(); }
function updateGrassType() { localStorage.setItem('grassType', document.getElementById('grassTypeSelector').value); render(); }

function calculateMaterials() {
    const sqFt = parseFloat(document.getElementById('projSqFt').value);
    const depth = parseFloat(document.getElementById('projDepth').value);
    if (!sqFt || !depth) return;
    const cubicYards = (sqFt * (depth / 12)) / 27;
    document.getElementById('projResult').innerHTML = `Need: <b>${cubicYards.toFixed(2)} Cubic Yards</b> (approx. ${Math.ceil(cubicYards * 27)} bags)`;
}

// --- GARAGE LOGIC ---
function addEquipment(type) {
    const selector = type === 'mower' ? 'mowerSelect' : 'spreaderSelect';
    const name = document.getElementById(selector).value;
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    eq.push({ id: Date.now(), name, type, services: [] });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function selectEquip(id) {
    selectedEquipId = id;
    document.getElementById('activeEquipmentSection').style.display = 'block';
    render();
}

function saveService() {
    const task = document.getElementById('serviceTask').value;
    const date = document.getElementById('serviceDate').value;
    if (!date || !selectedEquipId) return;
    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const idx = eq.findIndex(i => i.id === selectedEquipId);
    eq[idx].services.push({ id: Date.now(), task, date });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function runCalibrationCalc() {
    const w = parseFloat(document.getElementById('bagWeight').value);
    const c = parseFloat(document.getElementById('bagCoverage').value);
    if (w && c) document.getElementById('calResult').innerHTML = `Put <b>${((w/c)*100).toFixed(2)} lbs</b> in spreader for a 100sq ft test.`;
}

// --- RENDER ENGINE ---
function render() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const grassKey = localStorage.getItem('grassType') || 'tall_fescue';
    const profile = GRASS_PROFILES[grassKey];
    const ph = parseFloat(localStorage.getItem('soilPH')) || 7.0;

    // Grass & Soil
    document.getElementById('grassTypeSelector').value = grassKey;
    document.getElementById('soilPH').value = ph;
    document.getElementById('soilAdvice').innerText = ph < 6.5 ? "Low pH: Add Lime." : (ph > 7.2 ? "High pH: Add Sulfur." : "pH is optimal.");
    document.getElementById('mowHeightAdvice').innerHTML = `Set levers to <b>${profile.notch}</b> for a ${profile.height} cut.`;

    // Dashboard Stats
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyWater = logs.filter(l => l.type === 'Water' && new Date(l.date) >= weekAgo).reduce((s, l) => s + l.amount, 0);
    document.getElementById('waterStat').innerText = `${weeklyWater.toFixed(1)} / ${profile.water}"`;
    document.getElementById('waterBar').style.width = Math.min((weeklyWater / profile.water) * 100, 100) + '%';

    // Equipment Lists
    document.getElementById('mowerSelect').innerHTML = MOWER_MODELS.map(m => `<option value="${m}">${m}</option>`).join('');
    document.getElementById('spreaderSelect').innerHTML = SPREADER_MODELS.map(s => `<option value="${s}">${s}</option>`).join('');
    
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    document.getElementById('equipmentList').innerHTML = eq.map(e => `
        <div class="history-item" onclick="selectEquip(${e.id})" style="cursor:pointer; background:#fff; padding:10px; margin-bottom:5px; border-radius:8px; border: 1px solid ${selectedEquipId === e.id ? 'var(--accent)' : '#eee'}">
            <span>${e.type === 'mower' ? '🚜' : '⚙️'} ${e.name}</span>
        </div>
    `).join('');

    if (selectedEquipId) {
        const active = eq.find(e => e.id === selectedEquipId);
        document.getElementById('activeEquipName').innerText = active.name;
        document.getElementById('activeServiceHistory').innerHTML = active.services.slice().reverse().map(s => `
            <div class="history-item"><small>${s.date}: ${s.task}</small></div>
        `).join('');
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

function renderChart(logs) {
    const mows = logs.filter(l => l.type === 'Mow').sort((a,b) => new Date(a.date) - new Date(b.date));
    const ctx = document.getElementById('mowingChart').getContext('2d');
    if (mowingChart) mowingChart.destroy();
    mowingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mows.map(m => m.date),
            datasets: [{ label: 'Total Mows', data: mows.map((_, i) => i + 1), borderColor: '#27ae60', fill: true, tension: 0.3 }]
        },
        options: { maintainAspectRatio: false }
    });
}

window.onload = render;
