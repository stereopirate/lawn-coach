// Grass Species Database
const grassLibrary = [
    { id: "tf", name: "Tall Fescue", mow: "3.5-4.0\"", water: "1.5\"/wk", desc: "Coarse blades, bunch-forming. Very drought hardy.", img: "https://images.unsplash.com/photo-1533460004989-cee1901c048d?auto=format&fit=crop&w=400" },
    { id: "kb", name: "Kentucky Blue", mow: "2.5-3.5\"", water: "1.0\"/wk", desc: "Soft texture, boat-shaped tips. Spreads via rhizomes.", img: "https://images.unsplash.com/photo-1599351431613-18ef1fbc27e1?auto=format&fit=crop&w=400" },
    { id: "ber", name: "Bermuda", mow: "1.0-2.0\"", water: "0.75\"/wk", desc: "Aggressive spreader. Loves heat. Winter dormant.", img: "https://images.unsplash.com/photo-1558449132-95a97668143b?auto=format&fit=crop&w=400" },
    { id: "zo", name: "Zoysia", mow: "1.5-2.5\"", water: "1.0\"/wk", desc: "Dense, carpet-like feel. Extremely weed resistant.", img: "https://images.unsplash.com/photo-1592150621344-c792147c3ef2?auto=format&fit=crop&w=400" }
];

// Navigation
document.getElementById('menuToggle').onclick = (e) => { 
    e.stopPropagation(); 
    document.getElementById('navLinks').classList.toggle('show'); 
};
document.onclick = () => document.getElementById('navLinks').classList.remove('show');

function showPage(p) { 
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active')); 
    document.getElementById(p).classList.add('active'); 
    updateUI(); 
}

// Weather Engine
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
    } catch (e) { alert("Update Failed. Check connection."); }
}

// Fertilizer Logic
function handleFertSelect() {
    const opt = document.getElementById('fertSelect').options[document.getElementById('fertSelect').selectedIndex];
    if (!opt.value) return;
    document.getElementById('bagN').value = opt.value.split('-')[0];
    document.getElementById('productTip').innerText = opt.getAttribute('data-desc');
    document.getElementById('fertAdvice').style.display = "block";
}

function calculateFertilizer() {
    const size = parseFloat(document.getElementById('lawnSize').value);
    const n = parseFloat(document.getElementById('bagN').value);
    const spreader = document.getElementById('spreaderModel').value;
    
    if (!size || !n) return alert("Missing area or N%");

    const lbs = (1 / (n / 100)) * (size / 1000);
    const rate = lbs / (size / 1000);
    
    document.getElementById('fertResult').innerHTML = `Apply <b>${lbs.toFixed(1)} lbs</b> total.`;
    
    let set = "Manual Required";
    if (spreader === 'echo') set = rate > 5 ? "5.5" : (rate > 4 ? "5.0" : "4.0");
    else if (spreader === 'scotts') set = rate > 5 ? "6.0" : (rate > 4 ? "5.5" : "4.5");
    else if (spreader === 'lesco') set = rate > 5 ? "16" : "14";
    
    document.getElementById('spreaderSetting').innerText = `Setting: ${set}`;
}

// Equipment Management
function toggleCustomMower() {
    document.getElementById('customMowerInput').style.display = (document.getElementById('mowerLibrary').value === 'custom') ? 'block' : 'none';
}

function saveEquipment() {
    const libVal = document.getElementById('mowerLibrary').value;
    const name = (libVal === 'custom') ? document.getElementById('newMowerName').value : libVal;
    localStorage.setItem('activeMower', name);
    localStorage.setItem('sharpenInterval', document.getElementById('maintInterval').value);
    updateUI();
}

function logActivity(type) {
    if (type === 'Mow') {
        localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
        localStorage.setItem('totalGDD', (parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0)));
    }
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs.unshift({ type, date: new Date().toLocaleDateString() });
    localStorage.setItem('lawnLogs', JSON.stringify(logs.slice(0,20)));
    updateUI();
    alert(type + " Logged.");
}

function resetBladeCounter() {
    localStorage.setItem('mowsAtLastSharpen', localStorage.getItem('mowCount'));
    updateUI();
}

// Grass ID Quiz
let quizStep = 0;
let quizResultName = "";
function quizAnswer(ans) {
    if (quizStep === 0) {
        if (ans) { quizResultName = "Kentucky Blue"; quizStep = 3; } else quizStep = 1;
        document.getElementById('quizQuestion').innerText = "Does the grass spread via surface runners (vines)?";
    } else if (quizStep === 1) {
        if (ans) { quizResultName = "Bermuda"; quizStep = 3; } else quizStep = 2;
        document.getElementById('quizQuestion').innerText = "Does the blade have deep vertical ridges?";
    } else if (quizStep === 2) {
        quizResultName = ans ? "Tall Fescue" : "Zoysia";
        quizStep = 3;
    }

    if (quizStep === 3) {
        document.getElementById('quizContainer').style.display = 'none';
        document.getElementById('quizResult').style.display = 'block';
        document.getElementById('quizMatchText').innerText = "Match Found: " + quizResultName;
    }
}

function confirmQuizSelection() {
    const grass = grassLibrary.find(g => g.name === quizResultName);
    localStorage.setItem('userGrassType', JSON.stringify(grass));
    showPage('dashboard');
}

// UI Refresh
function updateUI() {
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    const gdd = Math.round(localStorage.getItem('totalGDD') || 0);
    const grass = JSON.parse(localStorage.getItem('userGrassType') || "null");
    const mower = localStorage.getItem('activeMower') || "Toro TimeMaster";
    const mowsSince = (parseInt(localStorage.getItem('mowCount') || 0)) - (parseInt(localStorage.getItem('mowsAtLastSharpen') || 0));
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);

    document.getElementById('temp').innerText = (localStorage.getItem('currentAirTemp') || "--") + "°";
    document.getElementById('soilTempDisplay').innerText = soil + "°";
    document.getElementById('gddTotalDisplay').innerText = gdd;
    document.getElementById('activeMowerDisplay').innerText = "Active: " + mower;
    document.getElementById('mowsSinceReset').innerText = "Mows since sharpen: " + mowsSince;
    document.getElementById('garageAlert').style.display = mowsSince >= limit ? 'block' : 'none';

    let advice = grass ? `Mow ${grass.name} at ${grass.mow}.` : "Set grass in Library.";
    if (soil >= 55) advice = "🚨 SOIL ALERT: Crabgrass window is OPEN.";
    document.getElementById('coachAction').innerHTML = advice;

    // Library Rendering
    const grid = document.getElementById('grassGrid');
    if (grid) {
        grid.innerHTML = grassLibrary.map(g => `
            <div class="grass-card ${grass?.id === g.id ? 'selected' : ''}">
                <img src="${g.img}" class="grass-img">
                <div class="grass-content">
                    <h4>${g.name}</h4>
                    <p>${g.desc}</p>
                    <button onclick='setMyGrass("${g.id}")' class="btn-save" style="margin-top:10px">${grass?.id === g.id ? 'ACTIVE' : 'SELECT'}</button>
                </div>
            </div>
        `).join('');
    }
    
    const hist = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const histDiv = document.getElementById('activityHistory');
    if (histDiv) histDiv.innerHTML = hist.map(l => `<div style="padding:10px; border-bottom:1px solid #eee;">${l.date} - ${l.type}</div>`).join('');
}

function setMyGrass(id) {
    localStorage.setItem('userGrassType', JSON.stringify(grassLibrary.find(g => g.id === id)));
    updateUI();
}

window.onload = updateUI;
