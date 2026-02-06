let mowingChart = null;
const API_KEY = '9e2c8cda4fb95a6d8392dd058bab70da';

const MOWER_SPECS = {
    "Toro TimeMaster 30\"": { oil: 50, blade: 25, width: 30 },
    "Honda HRX217": { oil: 50, blade: 25, width: 21 },
    "Default": { oil: 50, blade: 20, width: 21 }
};

const GRASS_PROFILES = {
    tall_fescue: { name: "Tall Fescue", water: 1.5, height: 3.5, notch: "6" },
    bermuda: { name: "Bermuda", water: 1.0, height: 1.5, notch: "2" }
};

function saveGrowth() {
    const h = parseFloat(document.getElementById('grassHeight').value);
    const profile = GRASS_PROFILES[localStorage.getItem('grassType') || 'tall_fescue'];
    localStorage.setItem('lastHeight', h);
    
    // One-Third Rule Check
    const maxCut = h * 0.33;
    const actualCut = h - profile.height;
    
    let advice = actualCut > maxCut ? "⚠️ <b>Warning:</b> You are cutting more than 1/3 of the blade. Raise your mower height!" : "✅ Growth looks healthy for a cut.";
    document.getElementById('growthAdvice').innerHTML = advice;
    render();
}

function updateCoachCorner() {
    const soilTemp = parseFloat(localStorage.getItem('soilTemp'));
    const moisture = parseFloat(localStorage.getItem('soilMoisture'));
    const coachDiv = document.getElementById('coachAction');

    if (soilTemp >= 50 && soilTemp <= 55) {
        coachDiv.innerHTML = "🏃 <b>Sprint!</b> Soil temp is 55°F. Get your pre-emergent down today.";
    } else if (moisture < 20) {
        coachDiv.innerHTML = "💦 <b>Dry Soil:</b> Moisture is below 20%. Plan a deep soak.";
    } else {
        coachDiv.innerHTML = "👍 Lawn is stable. Follow your standard schedule.";
    }
}

function calculateFertNeeded() {
    const target = parseFloat(document.getElementById('targetN').value);
    const nPct = parseFloat(document.getElementById('bagN').value) / 100;
    const weight = parseFloat(document.getElementById('fertBagWeight').value);
    if (target && nPct && weight) {
        const totalLbs = (target / nPct) * 5; // Assumes 5k sq ft yard
        document.getElementById('fertResult').innerHTML = `Need <b>${(totalLbs/weight).toFixed(1)} bags</b>.`;
    }
}

// ... Additional helper functions for render, equipment, and weather ...
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    render();
}
window.onload = render;
