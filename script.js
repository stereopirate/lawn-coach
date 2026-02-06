let selectedEquipId = null;

function addEquipment(category) {
    const selector = category === 'mower' ? 'mowerSelect' : 'spreaderSelect';
    const name = document.getElementById(selector).value;
    const eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    
    const newEntry = { 
        id: Date.now(), 
        name: name, 
        type: category,
        services: [] 
    };
    
    eq.push(newEntry);
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}

function selectEquip(id) {
    selectedEquipId = id;
    document.getElementById('activeEquipmentSection').style.display = 'block';
    render();
}

function saveService() {
    const task = document.getElementById('serviceTask').value;
    const date = document.getElementById('serviceDate').value;
    if (!date || !selectedEquipId) return;

    let eq = JSON.parse(localStorage.getItem('lawnEquip') || '[]');
    const index = eq.findIndex(item => item.id === selectedEquipId);
    
    eq[index].services.push({ task, date, id: Date.now() });
    localStorage.setItem('lawnEquip', JSON.stringify(eq));
    render();
}
