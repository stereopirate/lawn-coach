let mowingChart = null;
const API_KEY = '9e2c8cda4fb95a6d8392dd058bab70da'; 

// --- NAVIGATION ---
const navLinks = document.getElementById('navLinks');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('show');
});

document.addEventListener('click', () => navLinks.classList.remove('show'));

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'dashboard') render();
}

// --- WEATHER ---
async function fetchWeather(zip) {
    if (!zip) return;
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&units=imperial&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.cod === 200) {
            document.getElementById('temp').innerText = Math.round(data.main.temp) + '°F';
            document.getElementById('weatherDesc').innerText = `${data.weather[0].description} in ${data.name}`;
        } else {
            document.getElementById('weatherDesc').innerText = "ZIP not found";
        }
    } catch (e) { 
        console.error(e);
        document.getElementById('weatherDesc').innerText = "Service unavailable";
    }
}

function saveZip() {
    const zip = document.getElementById('zipCode').value;
    if (zip.length === 5) {
        localStorage.setItem('lawnZip', zip);
        fetchWeather(zip);
    }
}

// --- LOGS & RENDERING ---
const activityForm = document.getElementById('activityForm');
const actType = document.getElementById('actType');
const actAmount = document.getElementById('actAmount');

actType.onchange = () => { actAmount.style.display = actType.value === 'Water' ? 'inline-block' : 'none'; };

activityForm.onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    logs.push({
        id: Date.now(),
        type: actType.value,
        date: document.getElementById('actDate').value,
        amount: parseFloat(actAmount.value) || 0
    });
    localStorage.setItem('lawnLogs', JSON.stringify(logs));
    render();
    activityForm.reset();
    actAmount.style.display = 'none';
};

function deleteLog(id) {
    let logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    localStorage.setItem('lawnLogs', JSON.stringify(logs.filter(l => l.id !== id)));
    render();
}

function render() {
    const logs = JSON.parse(localStorage.getItem('lawnLogs') || '[]');
    const currentYear = new Date().getFullYear().toString();
    const yearly = logs.filter(l => l.date.includes(currentYear));

    // Stats
    document.getElementById('totalMows').innerText = yearly.filter(l => l.type === 'Mow').length;
    document.getElementById('totalWater').innerText = yearly.filter(l => l.type === 'Water').reduce((s, l) => s + l.amount, 0).toFixed(1) + '"';

    // Weekly Water
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekly = logs.filter(l => l.type === 'Water' && new Date(l.date) >= weekAgo).reduce((s, l) => s + l.amount, 0);
    document.getElementById('waterStat').innerText = `${weekly.toFixed(1)} / 1.5"`;
    document.getElementById('waterBar').style.width = Math.min((weekly / 1.5) * 100, 100) + '%';

    // History
    document.getElementById('historyList').innerHTML = logs.slice().reverse().map(log => `
        <div class="history-item">
            <div><strong>${log.type} ${log.amount ? `(${log.amount}")` : ''}</strong><br><small>${log.date}</small></div>
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
            datasets: [{ 
                label: 'Total Mows', 
                data: mows.map((_, i) => i + 1), 
                borderColor: '#27ae60', 
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                fill: true, 
                tension: 0.3 
            }]
        },
        options: { maintainAspectRatio: false }
    });
}

window.onload = () => {
    const zip = localStorage.getItem('lawnZip');
    if (zip) { 
        document.getElementById('zipCode').value = zip; 
        fetchWeather(zip); 
    }
    render();
};
