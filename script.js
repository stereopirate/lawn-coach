let mowingChart = null;
const API_KEY = '9e2c8cda4fb95a6d8392dd058bab70da'; 

// --- NAVIGATION ---
const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');
menuToggle.onclick = (e) => { e.stopPropagation(); navLinks.classList.toggle('show'); };
document.onclick = () => navLinks.classList.remove('show');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'dashboard' || pageId === 'garage') render();
}

function toggleInputs() {
    const type = document.getElementById('actType').value;
    document.getElementById('waterInput').style.display = type === 'Water' ? 'block' : 'none';
    document.getElementById('fertInput').style.display = type === 'Fertilize' ? 'block' : 'none';
}

// --- WEATHER ---
async function fetchWeather(zip) {
    if (!zip) return;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) {
            document.getElementById('temp').innerText = Math.round(data.main.temp) + '°F';
            document.getElementById('weatherDesc').innerText = `${data.weather[0].description} in ${data.name}`;
        }
    } catch (e) { console.error(e); }
}

function saveZip() {
    const zip = document.getElementById('zipCode').value;
    if (zip.length === 5) { localStorage.setItem('lawnZip', zip); fetchWeather(zip); }
}

// --- CORE DATA ---
const activityForm = document.getElementById('activityForm');

activityForm.onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const type = document.getElementById('actType').value;
    
    const entry = {
        id: Date.now(),
        type: type,
        date: document.getElementById('actDate').value,
        amount: parseFloat(document.getElementById('actAmount').value) || 0,
        n: parseFloat(document.getElementById('valInputN').value) || 0,
        p: parseFloat(document.getElementById('valInputP').value) || 0,
        k: parseFloat(document.getElementById('valInputK').value) || 0
    };
    
    logs.push(entry);
    localStorage.setItem('lawnLogs', JSON.stringify(logs));
    activityForm.reset();
    toggleInputs();
    render();
};

function deleteLog(id) {
    let logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    localStorage.setItem('lawnLogs', JSON.stringify(logs.filter(l => l.id !== id)));
    render();
}

function resetMaintenance(type) {
    localStorage.setItem('lastSharpenDate', Date.now());
    render();
}

function render() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const lastSharpen = localStorage.getItem('lastSharpenDate') || 0;

    // 1. Nutrient Calculation
    const totalN = logs.reduce((s, l) => s + (l.n || 0), 0);
    const totalP = logs.reduce((s, l) => s + (l.p || 0), 0);
    const totalK = logs.reduce((s, l) => s + (l.k || 0), 0);
    document.getElementById('valN').innerText = totalN.toFixed(1);
    document.getElementById('valP').innerText = totalP.toFixed(1);
    document.getElementById('valK').innerText = totalK.toFixed(1);

    // 2. Water Goal
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyWater = logs.filter(l => l.type === 'Water' && new Date(l.date) >= weekAgo).reduce((s, l) => s + l.amount, 0);
    document.getElementById('waterStat').innerText = `${weeklyWater.toFixed(1)} / 1.5"`;
    document.getElementById('waterBar').style.width = Math.min((weeklyWater / 1.5) * 100, 100) + '%';

    // 3. Maintenance Logic
    const mowsSinceSharpen = logs.filter(l => l.type === 'Mow' && l.id > lastSharpen).length;
    document.getElementById('mowCountMaint').innerText = mowsSinceSharpen;
    
    const alertDiv = document.getElementById('maintAlerts');
    if (mowsSinceSharpen >= 20) {
        alertDiv.innerHTML = `<div style="background:#ffeaa7; padding:10px; border-radius:8px; margin-bottom:10px;">⚠️ <strong>Dull Blade Warning:</strong> You have mowed ${mowsSinceSharpen} times. Time to sharpen!</div>`;
    } else {
        alertDiv.innerHTML = `<p style="color:green">✅ Blades are currently sharp.</p>`;
    }

    // 4. History List
    document.getElementById('historyList').innerHTML = logs.slice().reverse().map(log => `
        <div class="history-item">
            <div>
                <strong>${log.type}</strong><br>
                <small>${log.date} ${log.n ? `(NPK: ${log.n}-${log.p}-${log.k})` : ''} ${log.amount ? `(${log.amount}")` : ''}</small>
            </div>
            <button class="btn-delete" onclick="deleteLog(${log.id})">🗑️</button>
        </div>
    `).join('');

    renderChart(logs);
}

function renderChart(logs) {
    const mows = logs.filter(l => l.type === 'Mow').sort((a,b) => new Date(a.date) - new Date(b.date));
    const ctx = document.getElementById('mowingChart').getContext('2d');
    if (mowingChart) mowingChart.destroy();
    mowingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: mows.map(m => m.date),
            datasets: [{ label: 'Cumulative Mows', data: mows.map((_, i) => i + 1), borderColor: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.1)', fill: true, tension: 0.3 }]
        },
        options: { maintainAspectRatio: false }
    });
}

window.onload = () => {
    const zip = localStorage.getItem('lawnZip');
    if (zip) { document.getElementById('zipCode').value = zip; fetchWeather(zip); }
    render();
};
