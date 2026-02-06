// --- DATABASES ---
const grassLibrary = [
    { id: "tf", name: "Tall Fescue", mow: "3.5-4.0\"", water: "1.5\"/wk", desc: "Wide blades, deep ridges. Very drought hardy.", img: "https://images.unsplash.com/photo-1533460004989-cee1901c048d?auto=format&fit=crop&w=400" },
    { id: "kb", name: "Kentucky Blue", mow: "2.5-3.5\"", water: "1.0\"/wk", desc: "Soft texture, boat-shaped tips. Spreads via rhizomes.", img: "https://images.unsplash.com/photo-1599351431613-18ef1fbc27e1?auto=format&fit=crop&w=400" },
    { id: "ber", name: "Bermuda", mow: "1.0-2.0\"", water: "0.75\"/wk", desc: "Aggressive spreader. Loves heat. Winter dormant.", img: "https://images.unsplash.com/photo-1558449132-95a97668143b?auto=format&fit=crop&w=400" }
];

// --- NAVIGATION ROUTER ---
const navLinks = document.getElementById('navLinks');
document.getElementById('menuToggle').onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.style.display = 'block';
        activePage.classList.add('active');
    }
    navLinks.classList.remove('show');
    updateUI();
}

// --- CORE APP LOGIC ---
async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return alert("Enter Zip Code");
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        localStorage.setItem('currentSoilTemp', Math.round(res.current.soil_temperature_6cm));
        localStorage.setItem('currentAirTemp', Math.round(res.current.temperature_2m));
        localStorage.setItem('lastGDDValue', Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50));
        updateUI();
    } catch (e) { alert("Weather Update Failed"); }
}

function updateUI() {
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    const gdd = Math.round(localStorage.getItem('totalGDD') || 0);
    const grass = JSON.parse(localStorage.getItem('userGrassType') || "null");
    const mowsSince = (parseInt(localStorage.getItem('mowCount') || 0)) - (parseInt(localStorage.getItem('mowsAtLastSharpen') || 0));
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);

    // Dashboard Snapshot
    if (document.getElementById('dashboard').classList.contains('active')) {
        document.getElementById('temp').innerText = (localStorage.getItem('currentAirTemp') || "--") + "°";
        document.getElementById('soilTempDisplay').innerText = soil + "°";
        document.getElementById('gddTotalDisplay').innerText = gdd;
        let advice = grass ? `Mow ${grass.name} at ${grass.mow}.` : "Set grass in Library.";
        if (soil >= 55) advice = "🚨 SOIL ALERT: Crabgrass window is OPEN.";
        document.getElementById('coachAction').innerHTML = advice;
        document.getElementById('secondaryAdvice').innerHTML = mowsSince >= limit ? "⚠️ Maintenance Overdue" : "✅ Equipment Ready";
    }

    // Yard History
    if (document.getElementById('yard').classList.contains('active')) {
        const hist = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
        document.getElementById('activityHistory').innerHTML = hist.map(l => `<div style="padding:10px; border-bottom:1px solid #eee;">${l.date} - ${l.type}</div>`).join('') || "No logs yet.";
    }

    // Grass Library Rendering
    const grid = document.getElementById('grassGrid');
    if (grid && document.getElementById('grass-db').classList.contains('active')) {
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
}

// Initial Boot
window.onload = () => showPage('dashboard');

// --- KEEP PREVIOUS CALC, QUIZ, AND MOWER FUNCTIONS ---
function logActivity(type) {
    if (type === 'Mow') {
        localStorage.setItem('mowCount', (parseInt(localStorage.getItem('mowCount') || 0) + 1));
        localStorage.setItem('totalGDD', (parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0)));
    }
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs.unshift({ type, date: new Date().toLocaleDateString() });
    localStorage.setItem('lawnLogs', JSON.stringify(logs.slice(0,10)));
    updateUI();
    alert(type + " Logged.");
}
// [Remaining functions: calculateFertilizer, setMyGrass, quizAnswer, etc. from previous version]
