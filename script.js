const grassLibrary = [
    { id: "tf", name: "Tall Fescue", mow: "3.5-4.0\"", desc: "Wide blades, deep roots.", img: "https://images.unsplash.com/photo-1533460004989-cee1901c048d?auto=format&fit=crop&w=400" },
    { id: "kb", name: "Kentucky Blue", mow: "2.5-3.5\"", desc: "Soft texture, boat tips.", img: "https://images.unsplash.com/photo-1599351431613-18ef1fbc27e1?auto=format&fit=crop&w=400" }
];

// Router logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('navLinks').classList.remove('show');
    updateUI();
}

document.getElementById('menuToggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('navLinks').classList.toggle('show');
};

// Weather Engine
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return alert("Enter Zip");
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        
        localStorage.setItem('currentSoilTemp', Math.round(res.current.soil_temperature_6cm));
        localStorage.setItem('currentAirTemp', Math.round(res.current.temperature_2m));
        localStorage.setItem('lastGDDValue', Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50));
        localStorage.setItem('nextRain', (res.daily.precipitation_sum[0] / 25.4).toFixed(2));
        updateUI();
    } catch (e) { alert("Sync failed."); }
}

function updateUI() {
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    const rain = parseFloat(localStorage.getItem('nextRain') || 0);
    const mows = (parseInt(localStorage.getItem('mowCount') || 0)) - (parseInt(localStorage.getItem('mowsAtLastSharpen') || 0));
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);
    const grass = JSON.parse(localStorage.getItem('userGrassType') || "null");

    // Dashboard
    if (document.getElementById('dashboard').classList.contains('active')) {
        document.getElementById('temp').innerText = (localStorage.getItem('currentAirTemp') || "--") + "°";
        document.getElementById('soilTempDisplay').innerText = soil + "°";
        document.getElementById('gddTotalDisplay').innerText = Math.round(localStorage.getItem('totalGDD') || 0);
        
        document.getElementById('rainAlert').style.display = rain >= 1.0 ? 'block' : 'none';
        document.getElementById('maintAlert').style.display = mows >= limit ? 'block' : 'none';

        let advice = grass ? `Mow ${grass.name} at ${grass.mow}.` : "Select grass in Library.";
        if (soil >= 55) advice = "🚨 SOIL ALERT: Crabgrass window open.";
        if (rain >= 1.0) advice = "⛈️ RAIN DELAY: Don't fertilize today.";
        document.getElementById('coachAction').innerHTML = advice;
    }

    // Yard History
    const histDiv = document.getElementById('activityHistory');
    if (histDiv) {
        const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
        histDiv.innerHTML = logs.map(l => `<div style="padding:10px; border-bottom:1px solid #eee;">${l.date} - ${l.type}</div>`).join('') || "No logs yet.";
    }

    // Grass Library Rendering
    const grid = document.getElementById('grassGrid');
    if (grid && document.getElementById('grass-db').classList.contains('active')) {
        grid.innerHTML = grassLibrary.map(g => `
            <div class="grass-card ${grass?.id === g.id ? 'selected' : ''}">
                <img src="${g.img}" class="grass-img">
                <div style="padding:10px;">
                    <h4>${g.name}</h4>
                    <button onclick='setMyGrass("${g.id}")' class="btn-save" style="margin-top:10px">${grass?.id === g.id ? 'ACTIVE' : 'SELECT'}</button>
                </div>
            </div>
        `).join('');
    }
}

function logActivity(type) {
    if (type === 'Mow') {
        localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
        localStorage.setItem('totalGDD', (parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0)));
    }
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs.unshift({ type, date: new Date().toLocaleDateString() });
    localStorage.setItem('lawnLogs', JSON.stringify(logs.slice(0,10)));
    updateUI();
}

function saveEquipment() {
    localStorage.setItem('activeMower', document.getElementById('mowerLibrary').value);
    localStorage.setItem('sharpenInterval', document.getElementById('maintInterval').value);
    updateUI();
    alert("Profile Saved");
}

function resetBladeCounter() {
    localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount'));
    updateUI();
}

function setMyGrass(id) {
    localStorage.setItem('userGrassType', JSON.stringify(grassLibrary.find(g => g.id === id)));
    updateUI();
}

// Initial Boot
window.onload = () => showPage('dashboard');
