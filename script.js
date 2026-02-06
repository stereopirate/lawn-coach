let mowingChart = null;
const API_KEY = '9e2c8cda4fb95a6d8392dd058bab70da'; 
let selectedEquipId = null;

// --- INITIALIZATION ---
window.onload = () => {
    const zip = localStorage.getItem('lawnZip');
    if (zip) { 
        document.getElementById('zipCode').value = zip; 
        fetchWeather(zip); 
    }
    document.getElementById('yardSqFtInput').value = localStorage.getItem('yardSqFt') || '';
    render();
};

// --- MENU FIX ---
document.getElementById('menuToggle').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('navLinks').classList.toggle('show');
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('navLinks').classList.remove('show');
    render();
}

// --- COACH'S CORNER REPAIR ---
function updateCoachCorner() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const grassKey = localStorage.getItem('grassType') || 'tall_fescue';
    const profile = GRASS_PROFILES[grassKey];
    const soilTemp = parseFloat(localStorage.getItem('soilTemp')) || 0;
    const moisture = parseFloat(localStorage.getItem('soilMoisture')) || 0;
    const coachDiv = document.getElementById('coachAction');

    if (!coachDiv) return;

    if (soilTemp > 0 && soilTemp <= 55) {
        coachDiv.innerHTML = "🎯 <b>Soil Temp Alert:</b> Window for Pre-Emergent is open (55°F).";
    } else if (moisture > 0 && moisture < 25) {
        coachDiv.innerHTML = "🌵 <b>Drought Stress:</b> Soil moisture is low. Deep water tomorrow.";
    } else {
        coachDiv.innerHTML = `✅ ${profile.name} status: Optimal. Cut at <b>${profile.height}</b>.`;
    }
}

// --- DATA SAVING ---
function saveYardSize() {
    const val = document.getElementById('yardSqFtInput').value;
    localStorage.setItem('yardSqFt', val);
    render();
}

function saveSoilHealth() {
    localStorage.setItem('soilTemp', document.getElementById('soilTemp').value);
    localStorage.setItem('soilMoisture', document.getElementById('soilMoisture').value);
    render();
}

// --- WEATHER REPAIR ---
async function fetchWeather(zip) {
    const tempDiv = document.getElementById('temp');
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) {
            tempDiv.innerText = Math.round(data.main.temp) + '°F';
        } else {
            tempDiv.innerText = "Error";
        }
    } catch (e) {
        tempDiv.innerText = "Offline";
    }
}

// (Keep existing addEquipment, saveService, and renderChart functions here)
