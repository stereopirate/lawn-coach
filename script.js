const grassData = [{n:"Tall Fescue", f:"Mow 3.5-4\""}, {n:"Kentucky Blue", f:"Mow 2.5-3\""}, {n:"Bermuda", f:"Mow 1-2\""}];

// --- NAVIGATION ---
document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); document.getElementById('navLinks').classList.toggle('show'); };
document.onclick = () => document.getElementById('navLinks').classList.remove('show');
function showPage(p) { document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active')); document.getElementById(p).classList.add('active'); updateUI(); }

// --- WEATHER & GDD ---
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return;
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        localStorage.setItem('currentSoilTemp', Math.round(res.current.soil_temperature_6cm));
        localStorage.setItem('lastGDDValue', Math.max(0, Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50)));
        localStorage.setItem('currentAirTemp', Math.round(res.current.temperature_2m));
        updateUI();
    } catch (e) { alert("Weather Error"); }
}

// --- FERTILIZER & ECHO RB60 ---
function handleFertSelect() {
    const select = document.getElementById('fertSelect');
    const opt = select.options[select.selectedIndex];
    if (!opt.value) return;
    document.getElementById('npkDisplay').innerText = `N-P-K: ${opt.value}`;
    document.getElementById('bagN').value = opt.value.split('-')[0];
    const strategy = opt.getAttribute('data-desc');
    document.getElementById('productTip').innerHTML = strategy;
    document.getElementById('fertAdvice').style.display = "block";
    localStorage.setItem('activeFertStrategy', strategy);
}

function calculateFertilizer() {
    const size = parseFloat(document.getElementById('lawnSize').value);
    const n = parseFloat(document.getElementById('bagN').value);
    const lbs = (1 / (n / 100)) * (size / 1000);
    document.getElementById('fertResult').innerHTML = `Apply <b>${lbs.toFixed(1)} lbs</b> total.`;
    
    // Echo RB60 Settings Map
    const rate = lbs / (size / 1000);
    let setting = "4.0";
    if (rate > 3.5) setting = "4.5";
    if (rate > 4.5) setting = "5.0";
    if (rate > 5.5) setting = "6.0";
    document.getElementById('spreaderSetting').innerText = `Echo RB60 Setting: ${setting}`;
}

// --- LOGGING ---
function logActivity(type, detail = "") {
    const logs = JSON.parse(localStorage.getItem('lawnMasterLogs') || '[]');
    logs.unshift({ type, detail, date: new Date().toLocaleDateString(), gdd: localStorage.getItem('totalGDD') || 0 });
    localStorage.setItem('lawnMasterLogs', JSON.stringify(logs.slice(0,50)));
    if (type === 'Mow') {
        localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
        localStorage.setItem('totalGDD', parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0));
    }
    updateUI();
}

// --- UI CORE ---
function updateUI() {
    const mows = parseInt(localStorage.getItem('mowCount') || 0) - parseInt(localStorage.getItem('mowsAtLastSharpen') || 0);
    const interval = parseInt(localStorage.getItem('sharpenInterval') || 5);
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    
    document.getElementById('temp').innerText = (localStorage.getItem('currentAirTemp') || "--") + "°F";
    document.getElementById('soilTempDisplay').innerText = "Soil: " + soil + "°F";
    document.getElementById('gddTotalDisplay').innerText = "Total GDD: " + Math.round(localStorage.getItem('totalGDD') || 0);
    document.getElementById('mowsSinceReset').innerText = "Mows since sharpen: " + mows;
    
    // Coach Alerts
    let p = soil >= 55 ? "🚨 SOIL ALERT: Crabgrass window is OPEN." : "Update weather for coaching.";
    let s = mows >= interval ? "⚠️ MAINTENANCE: Sharpen TimeMaster blades." : "✅ Equipment is ready.";
    document.getElementById('coachAction').innerHTML = p;
    document.getElementById('secondaryAdvice').innerHTML = s;
    document.getElementById('garageAlert').style.display = mows >= interval ? 'block' : 'none';

    // History
    const logs = JSON.parse(localStorage.getItem('lawnMasterLogs') || '[]');
    document.getElementById('activityHistory').innerHTML = logs.filter(l=>l.type!=='Maint').map(l=>`<div>${l.date} - ${l.type}</div>`).join('');
    document.getElementById('maintenanceHistory').innerHTML = logs.filter(l=>l.type==='Maint').map(l=>`<div>${l.date} - ${l.detail}</div>`).join('');
    
    document.getElementById('grassGrid').innerHTML = grassData.map(g => `<div class="db-card" onclick="localStorage.setItem('userGrassType','${g.n}');updateUI()"><b>${g.n}</b></div>`).join('');
}

function addNewEquipment() {
    localStorage.setItem('activeMower', document.getElementById('newMowerName').value);
    localStorage.setItem('sharpenInterval', document.getElementById('maintInterval').value);
    updateUI();
}
function resetBladeCounter() { 
    logActivity('Maint', 'Blades Sharpened');
    localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount')); 
    updateUI(); 
}
window.onload = updateUI;
