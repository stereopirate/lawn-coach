// --- NAVIGATION LOGIC ---
const navLinks = document.getElementById('navLinks');
document.getElementById('menuToggle').onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
};

// Close menu when clicking anywhere else
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    // 2. Show the selected page
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.style.display = 'block';
        activePage.classList.add('active');
    }

    // 3. Close the mobile menu
    navLinks.classList.remove('show');

    // 4. Refresh data
    updateUI();
}

// --- APP DATA & LOGIC ---
const grassLibrary = [
    { id: "tf", name: "Tall Fescue", mow: "3.5-4.0\"", desc: "Coarse blades, deep ridges.", img: "https://images.unsplash.com/photo-1533460004989-cee1901c048d?auto=format&fit=crop&w=400" },
    { id: "kb", name: "Kentucky Blue", mow: "2.5-3.5\"", desc: "Soft texture, boat-shaped tips.", img: "https://images.unsplash.com/photo-1599351431613-18ef1fbc27e1?auto=format&fit=crop&w=400" }
];

async function fetchWeather() {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return;
    try {
        const geo = await fetch(`https://api.zippopotam.us/us/${zip}`).then(r => r.json());
        const { latitude: lat, longitude: lon } = geo.places[0];
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,soil_temperature_6cm&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`).then(r => r.json());
        localStorage.setItem('currentSoilTemp', Math.round(res.current.soil_temperature_6cm));
        localStorage.setItem('currentAirTemp', Math.round(res.current.temperature_2m));
        localStorage.setItem('lastGDDValue', Math.round(((res.daily.temperature_2m_max[0] + res.daily.temperature_2m_min[0]) / 2) - 50));
        updateUI();
    } catch (e) { console.error(e); }
}

function updateUI() {
    const soil = localStorage.getItem('currentSoilTemp') || "--";
    const air = localStorage.getItem('currentAirTemp') || "--";
    const gdd = Math.round(localStorage.getItem('totalGDD') || 0);
    const grass = JSON.parse(localStorage.getItem('userGrassType') || "null");
    const mows = (parseInt(localStorage.getItem('mowCount') || 0)) - (parseInt(localStorage.getItem('mowsAtLastSharpen') || 0));
    const limit = parseInt(localStorage.getItem('sharpenInterval') || 5);

    // Dashboard Updates
    if (document.getElementById('temp')) {
        document.getElementById('temp').innerText = air + "°";
        document.getElementById('soilTempDisplay').innerText = soil + "°";
        document.getElementById('gddTotalDisplay').innerText = gdd;
        
        let advice = grass ? `Mow ${grass.name} at ${grass.mow}.` : "Set grass in Library.";
        if (soil >= 55) advice = "🚨 SOIL ALERT: Crabgrass window is OPEN.";
        document.getElementById('coachAction').innerHTML = advice;
        document.getElementById('secondaryAdvice').innerHTML = mows >= limit ? "⚠️ Maintenance Overdue" : "✅ Equipment Ready";
    }

    // Library Rendering
    const grid = document.getElementById('grassGrid');
    if (grid && grid.offsetParent !== null) {
        grid.innerHTML = grassLibrary.map(g => `
            <div class="grass-card ${grass?.id === g.id ? 'selected' : ''}">
                <img src="${g.img}" class="grass-img">
                <div class="grass-content">
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
        localStorage.setItem('totalGDD', (parseFloat(localStorage.getItem('totalGDD') || 0) + parseFloat(localStorage.getItem('lastGDDValue') || 0)));
    }
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs.unshift({ type, date: new Date().toLocaleDateString() });
    localStorage.setItem('lawnLogs', JSON.stringify(logs.slice(0,5)));
    updateUI();
}

// Initial Boot
window.onload = () => showPage('dashboard');
