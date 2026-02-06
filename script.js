// --- DATABASES ---
const grassData = [{n:"Tall Fescue", f:"Mow 3.5-4\""}, {n:"Kentucky Blue", f:"Mow 2.5-3\""}, {n:"Bermuda", f:"Mow 1-2\""}];

// --- NAVIGATION ---
document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); document.getElementById('navLinks').classList.toggle('show'); };
document.onclick = () => document.getElementById('navLinks').classList.remove('show');
function showPage(p) { document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active')); document.getElementById(p).classList.add('active'); updateUI(); }

// --- WEATHER & GDD ---
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return alert("Enter Zip Code");
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        localStorage.setItem('currentSoilTemp', Math.round(res.current.soil_temperature_6cm));
        localStorage.setItem('lastGDDValue', Math.max(0, Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50)));
        localStorage.setItem('currentAirTemp', Math.round(res.current.temperature_2m));
        updateUI();
    } catch (e) { alert("Weather Update Failed"); }
}

// --- EQUIPMENT & FERTILIZER ---
function toggleCustomMower() {
    document.getElementById('customMowerInput').style.display = (document.getElementById('mowerLibrary').value === 'custom') ? 'block' : 'none';
}

function saveEquipment() {
    const libVal = document.getElementById('mowerLibrary').value;
    const name = (libVal === 'custom') ? document.getElementById('newMowerName').value : libVal;
    const interval = document.getElementById('maintInterval').value;
    if (!name) return alert("Enter Mower Name");
    localStorage.setItem('activeMower', name);
    localStorage.setItem('sharpenInterval', interval);
    updateUI();
}

function handleFertSelect() {
    const select = document.getElementById('fertSelect');
    const opt = select.options[select.selectedIndex];
    if (!opt.value) return;
    document.getElementById('npkDisplay').innerText = `N-P-K: ${opt.value}`;
    document.getElementById('bagN').value = opt.value.split('-')[0];
    document.getElementById('productTip').innerHTML = opt.getAttribute('data-desc');
    document.getElementById('fertAdvice').style.display = "block";
}

function calculateFertilizer() {
    const size = parseFloat(document.getElementById('lawnSize').value);
    const n = parseFloat(document.getElementById('bagN').value);
    if (!size || !n) return;
    const lbs = (1 / (n / 100)) * (size / 1000);
    document.getElementById('fertResult').innerHTML = `Total Needed: <b>${lbs.toFixed(1)} lbs</b>`;
    
    // Spreader Settings Logic
    const spreader = document.getElementById('spreaderModel').value;
    const rate = lbs / (size / 1000);
    let set = "Refer to Manual";
    if (spreader === 'echo') set = rate > 5 ? "5.5" : (rate > 4 ? "5.0" : "4.0");
    if (spreader === 'scotts') set = rate > 5 ? "6.0" : (rate > 4 ? "5.0" : "4.5");
    if (spreader === 'lesco') set = rate > 5 ? "16" : "14";
    document.getElementById('spreaderSetting').innerText = `Setting: ${set}`;
}

// --- ACTIVITY LOGS ---
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

function resetBladeCounter() { 
    const mower = localStorage.getItem('activeMower') || "Mower";
    logActivity('Maint', `Sharpened ${mower} blades`);
    localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount')); 
    updateUI(); 
}

// --- DIGITAL LEVELER ---
function startLeveler() {
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then(s => { if(s=='granted') window.addEventListener('deviceorientation', handleLevel); });
    } else { window.addEventListener('deviceorientation', handleLevel); }
}
function handleLevel(e) {
    let angle = e.gamma;
    document.getElementById('levelDisplay').innerText = angle.toFixed(1) + "°";
    document.getElementById('levelAdvice').innerText = Math.abs(angle) < 0.5 ? "LEVEL" : (angle > 0 ? "LOW LEFT" : "LOW RIGHT");
}

// --- UI REFRESH ---
function updateUI() {
    const mower = localStorage.getItem('activeMower') || "Toro TimeMaster 30\"";
    const mows = parseInt(localStorage.getItem('mowCount') || 0) - parseInt(localStorage.getItem('mowsAtLastSharpen') || 0);
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    
    document.getElementById('activeMowerDisplay').innerText = `Active: ${mower}`;
    document.getElementById('mowsSinceReset').innerText = `Mows since sharpen: ${mows}`;
    document.getElementById('temp').innerText = (localStorage.getItem('currentAirTemp') || "--") + "°F";
    document.getElementById('soilTempDisplay').innerText = "Soil: " + soil + "°F";
    document.getElementById('gddTotalDisplay').innerText = "Total GDD: " + Math.round(localStorage.getItem('totalGDD') || 0);
    
    // Alerts
    const serviceDue = mows >= limit;
    document.getElementById('garageAlert').style.display = serviceDue ? 'block' : 'none';
    document.getElementById('coachAction').innerHTML = soil >= 55 ? "🚨 SOIL ALERT: Crabgrass window is OPEN." : "Update weather for coaching.";
    document.getElementById('secondaryAdvice').innerHTML = serviceDue ? `⚠️ <b>Maintenance:</b> ${mower} needs service.` : `✅ ${mower} is ready.`;

    // History
    const logs = JSON.parse(localStorage.getItem('lawnMasterLogs') || '[]');
    document.getElementById('activityHistory').innerHTML = logs.filter(l=>l.type!=='Maint').map(l=>`<div>${l.date} - ${l.type}</div>`).join('');
    document.getElementById('maintenanceHistory').innerHTML = logs.filter(l=>l.type==='Maint').map(l=>`<div>${l.date} - ${l.detail}</div>`).join('');
    document.getElementById('grassGrid').innerHTML = grassData.map(g => `<div class="db-card" onclick="localStorage.setItem('userGrassType','${g.n}');updateUI()"><b>${g.n}</b></div>`).join('');
}
window.onload = updateUI;
