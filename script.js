const grassLibrary = [
    { id: "tf", name: "Tall Fescue", mow: "3.5-4.0\"", desc: "Coarse blades, deep roots.", img: "https://images.unsplash.com/photo-1533460004989-cee1901c048d?auto=format&fit=crop&w=400" },
    { id: "kb", name: "Kentucky Blue", mow: "2.5-3.5\"", desc: "Soft texture, boat tips.", img: "https://images.unsplash.com/photo-1599351431613-18ef1fbc27e1?auto=format&fit=crop&w=400" },
    { id: "ber", name: "Bermuda", mow: "1.0-2.0\"", desc: "Aggressive spreader. Heat lover.", img: "https://images.unsplash.com/photo-1558449132-95a97668143b?auto=format&fit=crop&w=400" }
];

// Router
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.getElementById('navLinks').classList.remove('show');
    updateUI();
}

document.getElementById('menuToggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('navLinks').classList.toggle('show');
};

// Weather Logic
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return;
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
    const air = localStorage.getItem('currentAirTemp') || "--";
    const rain = parseFloat(localStorage.getItem('nextRain') || 0);
    const gdd = Math.round(localStorage.getItem('totalGDD') || 0);
    const grass = JSON.parse(localStorage.getItem('userGrassType') || "null");
    const mows = (parseInt(localStorage.getItem('mowCount') || 0)) - (parseInt(localStorage.getItem('mowsAtLastSharpen') || 0));
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);

    // Dashboard
    if (document.getElementById('temp')) {
        document.getElementById('temp').innerText = air + "°";
        document.getElementById('soilTempDisplay').innerText = soil + "°";
        document.getElementById('gddTotalDisplay').innerText = gdd;
        document.getElementById('rainAlert').style.display = rain >= 1.0 ? 'block' : 'none';
        document.getElementById('maintAlert').style.display = mows >= limit ? 'block' : 'none';

        let advice = grass ? `Mow at ${grass.mow}.` : "Select grass type.";
        if (soil >= 55) advice = "🚨 SOIL ALERT: Crabgrass window is OPEN.";
        if (rain >= 1.0) advice = "⛈️ RAIN DELAY: Avoid fertilizing today.";
        document.getElementById('coachAction').innerHTML = advice;
    }

    // Yard History
    const hist = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const histDiv = document.getElementById('activityHistory');
    if (histDiv) histDiv.innerHTML = hist.map(l => `<div>${l.date} - ${l.type}</div>`).join('');

    // Garage
    const activeMow = localStorage.getItem('activeMower') || "No Mower Set";
    if (document.getElementById('activeMowerDisplay')) {
        document.getElementById('activeMowerDisplay').innerText = "Active: " + activeMow;
        document.getElementById('mowsSinceReset').innerText = "Mows since sharpen: " + mows;
    }

    // Library
    const grid = document.getElementById('grassGrid');
    if (grid) {
        grid.innerHTML = grassLibrary.map(g => `
            <div class="grass-card ${grass?.id === g.id ? 'selected' : ''}">
                <img src="${g.img}" class="grass-img">
                <div style="padding:10px;">
                    <h4>${g.name}</h4>
                    <button onclick='setMyGrass("${g.id}")' class="btn-save">${grass?.id === g.id ? 'ACTIVE' : 'SELECT'}</button>
                </div>
            </div>
        `).join('');
    }
}

function logActivity(type) {
    if (type === 'Mow') {
        localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
        localStorage.setItem('totalGDD', parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0));
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
}

function resetBladeCounter() {
    localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount'));
    updateUI();
}

function setMyGrass(id) {
    localStorage.setItem('userGrassType', JSON.stringify(grassLibrary.find(g => g.id === id)));
    updateUI();
}

// Logic for Quiz
let qStep = 0;
function quizAnswer(ans) {
    const qText = document.getElementById('quizQuestion');
    if (qStep === 0) {
        if (ans) { finishQuiz("Kentucky Blue"); } else { qText.innerText = "Does it spread via surface runners?"; qStep = 1; }
    } else if (qStep === 1) {
        finishQuiz(ans ? "Bermuda" : "Tall Fescue");
    }
}
function finishQuiz(name) {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    document.getElementById('quizMatchText').innerText = "Match: " + name;
    localStorage.setItem('tempMatch', name);
}
function confirmQuizSelection() {
    const name = localStorage.getItem('tempMatch');
    setMyGrass(grassLibrary.find(g => g.name === name).id);
    showPage('dashboard');
}

window.onload = () => showPage('dashboard');
