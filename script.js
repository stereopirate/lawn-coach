// --- DATABASES & GLOBALS ---
const grassData = [{n:"Tall Fescue", f:"Mow 3.5-4\""}, {n:"Kentucky Blue", f:"Mow 2.5-3\""}, {n:"Bermuda", f:"Mow 1-2\""}];
const fungusData = [{n:"Brown Patch", s:"Circular patches"}, {n:"Dollar Spot", s:"Coin sized spots"}];

// --- NAV & PAGE CONTROL ---
document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); document.getElementById('navLinks').classList.toggle('show'); };
document.onclick = () => document.getElementById('navLinks').classList.remove('show');
function showPage(p) { document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active')); document.getElementById(p).classList.add('active'); updateUI(); }

// --- WEATHER & AUTOMATED GDD ---
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return;
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        
        const air = Math.round(res.current.temperature_2m);
        const soil = Math.round(res.current.soil_temperature_6cm);
        const gddToday = Math.max(0, Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50));

        document.getElementById('temp').innerText = air + "°F";
        document.getElementById('soilTempDisplay').innerText = "Soil: " + soil + "°F";
        document.getElementById('gddToday').innerText = "+" + gddToday;
        
        localStorage.setItem('userZip', zip);
        localStorage.setItem('currentSoilTemp', soil);
        localStorage.setItem('lastGDDValue', gddToday);
        updateUI();
    } catch (e) { alert("Weather error"); }
}

// --- LOGGING ---
function logActivity(type) {
    if (type === 'Mow') localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
    if (type === 'Mow') {
        let total = parseFloat(localStorage.getItem('totalGDD') || 0);
        total += parseFloat(localStorage.getItem('lastGDDValue') || 0);
        localStorage.setItem('totalGDD', total);
    }
    updateUI();
    alert(type + " Logged");
}

function calculateFertilizer() {
    const s = document.getElementById('lawnSize').value;
    const n = document.getElementById('bagN').value;
    const lbs = (1 / (n / 100)) * (s / 1000);
    document.getElementById('fertResult').innerText = `Apply ${lbs.toFixed(1)} lbs of product.`;
}

// --- UI UPDATE ---
function updateUI() {
    const gdd = Math.round(localStorage.getItem('totalGDD') || 0);
    const mows = parseInt(localStorage.getItem('mowCount') || 0) - parseInt(localStorage.getItem('mowsAtLastSharpen') || 0);
    const grass = localStorage.getItem('userGrassType') || "Not Set";
    const soil = localStorage.getItem('currentSoilTemp') || 0;

    document.getElementById('gddTotalDisplay').innerText = "Total: " + gdd;
    document.getElementById('mowsSinceReset').innerText = "Mows since sharpen: " + mows;
    document.getElementById('activeMowerDisplay').innerText = "Mower: Toro TimeMaster 30\"";
    
    // Coaching
    let p = "Update weather to see coaching.";
    let s = mows >= 5 ? "⚠️ SHARPEN BLADES: Your cut quality is dropping." : "✅ Blades are sharp.";
    if (soil >= 55) p = "🚨 SOIL ALERT: Pre-emergent window is OPEN.";
    else if (grass === "Tall Fescue") p = "🚜 Mow Fescue at 4\" to protect roots.";
    
    document.getElementById('coachAction').innerHTML = p;
    document.getElementById('secondaryAdvice').innerHTML = s;
    document.getElementById('garageAlert').style.display = mows >= 5 ? 'block' : 'none';

    // Grids
    document.getElementById('grassGrid').innerHTML = grassData.map(g => `<div class="db-card" onclick="localStorage.setItem('userGrassType','${g.n}');updateUI()"><b>${g.n}</b><br>${g.f}</div>`).join('');
    document.getElementById('fungusLibrary').innerHTML = fungusData.map(f => `<div class="db-card"><b>${f.name}</b><br>${f.s}</div>`).join('');
}
function resetBladeCounter() { localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount')); updateUI(); }
window.onload = updateUI;
