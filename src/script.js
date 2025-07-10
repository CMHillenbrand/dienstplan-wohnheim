// Daten bleiben gleich...
let mitarbeiter = [
    { id: 1, name: "Anna Müller", bild: "https://via.placeholder.com/80" },
    { id: 2, name: "Max Mustermann", bild: "https://via.placeholder.com/80" },
    { id: 3, name: "Lisa Schmidt", bild: "https://via.placeholder.com/80" },
    { id: 4, name: "Tom Weber", bild: "https://via.placeholder.com/80" }
];

let dienstplan = {
    "Montag": { "Frühdienst": [1, 2], "Spätdienst": [3], "Nachtdienst": [4] },
    "Dienstag": { "Frühdienst": [4, 1], "Spätdienst": [2], "Nachtdienst": [3] },
    "Mittwoch": { "Frühdienst": [3, 2], "Spätdienst": [1], "Nachtdienst": [4] },
    "Donnerstag": { "Frühdienst": [4, 3], "Spätdienst": [2], "Nachtdienst": [1] },
    "Freitag": { "Frühdienst": [1, 2], "Spätdienst": [3], "Nachtdienst": [4] },
    "Samstag": { "Frühdienst": [4, 1], "Spätdienst": [2], "Nachtdienst": [3] },
    "Sonntag": { "Frühdienst": [3, 2], "Spätdienst": [1], "Nachtdienst": [4] }
};

let currentAdminView = 'mitarbeiter';
let currentEditingTag = 'Montag';

// Routing
function initRouter() {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
        showAdminView();
    } else {
        showDienstplanView();
    }
}

// Hilfsfunktionen
function formatMitarbeiterName(mitarbeiter) {
    const parts = mitarbeiter.name.split(' ');
    if (parts.length > 1) {
        return parts[0] + ' ' + parts[1].charAt(0) + '.';
    }
    return parts[0];
}

function getMitarbeiterById(id) {
    return mitarbeiter.find(m => m.id === id);
}

// DIENSTPLAN ANZEIGE (Grid-Layout)
function showDienstplanView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="dienstplan-view">
            <div class="dienstplan-grid" id="dienstplanGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    renderDienstplanGrid();
}

function renderDienstplanGrid() {
    const grid = document.getElementById('dienstplanGrid');
    grid.innerHTML = '';
    
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    // Tag-Header erstellen
    wochentage.forEach(tag => {
        const tagHeader = document.createElement('div');
        tagHeader.className = 'tag-header';
        tagHeader.textContent = tag;
        grid.appendChild(tagHeader);
    });
    
    // Schichten erstellen
    schichten.forEach(schicht => {
        wochentage.forEach(tag => {
            const schichtCell = document.createElement('div');
            schichtCell.className = `schicht-cell schicht-${schicht.toLowerCase()}`;
            
            const schichtHeader = document.createElement('div');
            schichtHeader.className = 'schicht-header';
            schichtHeader.textContent = schicht;
            schichtCell.appendChild(schichtHeader);
            
            const mitarbeiterContainer = document.createElement('div');
            mitarbeiterContainer.className = 'mitarbeiter-container';
            
            // Mitarbeiter für diese Schicht hinzufügen
            if (dienstplan[tag] && dienstplan[tag][schicht]) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = getMitarbeiterById(mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'mitarbeiter-item';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span class="mitarbeiter-name">${formatMitarbeiterName(mitarbeiterObj)}</span>
                        `;
                        mitarbeiterContainer.appendChild(mitarbeiterDiv);
                    }
                });
            }
            
            schichtCell.appendChild(mitarbeiterContainer);
            grid.appendChild(schichtCell);
        });
    });
}

// ADMIN BEREICH (bleibt gleich)
function showAdminView() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="admin-view">
            <div class="admin-header">
                <h1>Dienstplan Verwaltung</h1>
                <a href="/" class="btn btn-primary">Zur Dienstplan-Anzeige</a>
            </div>
            
            <nav class="admin-nav">
                <button onclick="switchAdminView('mitarbeiter')" class="btn btn-primary ${currentAdminView === 'mitarbeiter' ? 'active' : ''}">
                    👥 Mitarbeiter verwalten
                </button>
                <button onclick="switchAdminView('dienstplan')" class="btn btn-primary ${currentAdminView === 'dienstplan' ? 'active' : ''}">
                    📅 Dienstplan bearbeiten
                </button>
            </nav>
            
            <div class="admin-content" id="adminContent">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    switchAdminView(currentAdminView);
}

function switchAdminView(view) {
    currentAdminView = view;
    
    // Navigation aktualisieren
    const navButtons = document.querySelectorAll('.admin-nav button');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(view)) {
            btn.classList.add('active');
        }
    });
    
    if (view === 'mitarbeiter') {
        showMitarbeiterVerwaltung();
    } else if (view === 'dienstplan') {
        showDienstplanEditor();
    }
}

// Rest der Funktionen bleiben gleich...
function showMitarbeiterVerwaltung() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="mitarbeiter-verwaltung">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Mitarbeiter</h2>
                <button onclick="showAddMitarbeiterForm()" class="btn btn-success">➕ Neuer Mitarbeiter</button>
            </div>
            
            <div id="mitarbeiterFormContainer" style="display: none;">
                <!-- Formular wird hier eingefügt -->
            </div>
            
            <div class="mitarbeiter-grid" id="mitarbeiterGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
    `;
    
    renderMitarbeiterGrid();
}

function renderMitarbeiterGrid() {
    const grid = document.getElementById('mitarbeiterGrid');
    grid.innerHTML = '';
    
    mitarbeiter.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mitarbeiter-card';
        card.innerHTML = `
            <img src="${m.bild}" alt="${m.name}">
            <h3>${m.name}</h3>
            <div class="actions">
                <button onclick="editMitarbeiter(${m.id})" class="btn btn-warning">✏️ Bearbeiten</button>
                <button onclick="deleteMitarbeiter(${m.id})" class="btn btn-danger">🗑️ Löschen</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function showAddMitarbeiterForm() {
    const container = document.getElementById('mitarbeiterFormContainer');
    container.innerHTML = `
        <form id="mitarbeiterForm" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #dee2e6;">
            <h3>Neuer Mitarbeiter</h3>
            <div class="form-group">
                <label for="mitarbeiterName">Name:</label>
                <input type="text" id="mitarbeiterName" required>
            </div>
            <div class="form-group">
                <label for="mitarbeiterBild">Foto:</label>
                <input type="file" id="mitarbeiterBild" accept="image/*" onchange="previewImage()">
                <div id="imagePreview" style="margin-top: 10px;"></div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-success">💾 Speichern</button>
                <button type="button" onclick="cancelMitarbeiterForm()" class="btn btn-danger">❌ Abbrechen</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMitarbeiter();
    });
}

function previewImage() {
    const file = document.getElementById('mitarbeiterBild').files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

function saveMitarbeiter() {
    const name = document.getElementById('mitarbeiterName').value;
    const file = document.getElementById('mitarbeiterBild').files[0];
    
    const newId = Math.max(...mitarbeiter.map(m => m.id)) + 1;
    const newMitarbeiter = {
        id: newId,
        name: name,
        bild: "https://via.placeholder.com/80"
    };
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newMitarbeiter.bild = e.target.result;
            mitarbeiter.push(newMitarbeiter);
            finishMitarbeiterSave();
        };
        reader.readAsDataURL(file);
    } else {
        mitarbeiter.push(newMitarbeiter);
        finishMitarbeiterSave();
    }
}

function finishMitarbeiterSave() {
    cancelMitarbeiterForm();
    renderMitarbeiterGrid();
    saveToStorage();
}

function cancelMitarbeiterForm() {
    document.getElementById('mitarbeiterFormContainer').style.display = 'none';
}

function editMitarbeiter(id) {
    // Implementierung für später
    alert('Bearbeitung wird noch implementiert');
}

function deleteMitarbeiter(id) {
    if (confirm('Mitarbeiter wirklich löschen?')) {
        mitarbeiter = mitarbeiter.filter(m => m.id !== id);
        
        // Aus Dienstplan entfernen
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(mId => mId !== id);
            });
        });
        
        renderMitarbeiterGrid();
        saveToStorage();
    }
}

// DIENSTPLAN EDITOR
function showDienstplanEditor() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="dienstplan-bearbeitung">
            <h2>Dienstplan bearbeiten</h2>
            
            <div class="dienstplan-editor">
                <div class="tag-selector">
                    <h3>Tag auswählen</h3>
                    <div id="tagButtons">
                        ${['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map(tag => 
                            `<button type="button" onclick="selectTag('${tag}')" class="tag-btn ${tag === currentEditingTag ? 'active' : ''}">${tag}</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="schicht-editor" id="schichtEditor">
                    <!-- Wird dynamisch gefüllt -->
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="saveDienstplan()" class="btn btn-success">💾 Dienstplan speichern</button>
            </div>
        </div>
    `;
    
    loadSchichtEditor();
}

function selectTag(tag) {
    currentEditingTag = tag;
    
    // Buttons aktualisieren
    const buttons = document.querySelectorAll('.tag-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === tag) {
            btn.classList.add('active');
        }
    });
    
    loadSchichtEditor();
}

function loadSchichtEditor() {
    const editor = document.getElementById('schichtEditor');
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    editor.innerHTML = '';
    
    schichten.forEach(schicht => {
        const group = document.createElement('div');
        group.className = 'schicht-group';
        group.innerHTML = `
            <h3>${schicht}</h3>
            <div class="mitarbeiter-checkboxes">
                ${mitarbeiter.map(m => `
                    <div class="checkbox-item ${dienstplan[currentEditingTag][schicht].includes(m.id) ? 'selected' : ''}">
                        <input type="checkbox" id="${schicht}_${m.id}" 
                               ${dienstplan[currentEditingTag][schicht].includes(m.id) ? 'checked' : ''}
                               onchange="toggleMitarbeiterSchicht('${schicht}', ${m.id}, this.checked)">
                        <img src="${m.bild}" alt="${m.name}">
                        <span>${formatMitarbeiterName(m)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        editor.appendChild(group);
    });
}

function toggleMitarbeiterSchicht(schicht, mitarbeiterId, checked) {
    if (checked) {
        if (!dienstplan[currentEditingTag][schicht].includes(mitarbeiterId)) {
            dienstplan[currentEditingTag][schicht].push(mitarbeiterId);
        }
    } else {
        dienstplan[currentEditingTag][schicht] = dienstplan[currentEditingTag][schicht].filter(id => id !== mitarbeiterId);
    }
    
    // Nachtschicht automatisch zu Frühdienst des nächsten Tags
    if (schicht === 'Nachtdienst' && checked) {
        const nextDay = getNextDay(currentEditingTag);
        if (nextDay && !dienstplan[nextDay]['Frühdienst'].includes(mitarbeiterId)) {
            dienstplan[nextDay]['Frühdienst'].push(mitarbeiterId);
        }
    }
    
    // Checkbox-Item Style aktualisieren
    const checkboxItem = document.querySelector(`#${schicht}_${mitarbeiterId}`).parentElement;
    if (checked) {
        checkboxItem.classList.add('selected');
    } else {
        checkboxItem.classList.remove('selected');
    }
}

function getNextDay(currentDay) {
    const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const index = tage.indexOf(currentDay);
    return index === 6 ? 'Montag' : tage[index + 1];
}

function saveDienstplan() {
    saveToStorage();
    alert('Dienstplan wurde gespeichert!');
}

// STORAGE
function saveToStorage() {
    localStorage.setItem('dienstplan_mitarbeiter', JSON.stringify(mitarbeiter));
    localStorage.setItem('dienstplan_plan', JSON.stringify(dienstplan));
}

function loadFromStorage() {
    const savedMitarbeiter = localStorage.getItem('dienstplan_mitarbeiter');
    const savedPlan = localStorage.getItem('dienstplan_plan');
    
    if (savedMitarbeiter) {
        mitarbeiter = JSON.parse(savedMitarbeiter);
    }
    
    if (savedPlan) {
        dienstplan = JSON.parse(savedPlan);
    }
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initRouter();
});

// Navigation ohne Reload
window.addEventListener('popstate', initRouter);

// Links abfangen
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')) {
        const href = e.target.getAttribute('href');
        if (href === '/' || href === '/admin') {
            e.preventDefault();
            window.history.pushState({}, '', href);
            initRouter();
        }
    }
});

// Globale Variable für den aktuell bearbeiteten Mitarbeiter
let currentEditingMitarbeiter = null;

// Mitarbeiterbearbeitung implementieren
function editMitarbeiter(id) {
    const mitarbeiterObj = getMitarbeiterById(id);
    if (mitarbeiterObj) {
        currentEditingMitarbeiter = id;
        showEditMitarbeiterForm(mitarbeiterObj);
    }
}

function showEditMitarbeiterForm(mitarbeiterObj) {
    const container = document.getElementById('mitarbeiterFormContainer');
    container.innerHTML = `
        <form id="mitarbeiterForm" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #007bff;">
            <h3>Mitarbeiter bearbeiten</h3>
            <div class="form-group">
                <label for="mitarbeiterName">Name:</label>
                <input type="text" id="mitarbeiterName" value="${mitarbeiterObj.name}" required>
            </div>
            <div class="form-group">
                <label for="mitarbeiterBild">Foto ändern (optional):</label>
                <input type="file" id="mitarbeiterBild" accept="image/*" onchange="previewImage()">
                <div id="imagePreview" style="margin-top: 10px;">
                    <div style="margin-bottom: 10px;">
                        <strong>Aktuelles Foto:</strong>
                    </div>
                    <img src="${mitarbeiterObj.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-success">💾 Änderungen speichern</button>
                <button type="button" onclick="cancelMitarbeiterForm()" class="btn btn-danger">❌ Abbrechen</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMitarbeiter();
    });
}

function showAddMitarbeiterForm() {
    currentEditingMitarbeiter = null;
    const container = document.getElementById('mitarbeiterFormContainer');
    container.innerHTML = `
        <form id="mitarbeiterForm" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #28a745;">
            <h3>Neuer Mitarbeiter</h3>
            <div class="form-group">
                <label for="mitarbeiterName">Name:</label>
                <input type="text" id="mitarbeiterName" required>
            </div>
            <div class="form-group">
                <label for="mitarbeiterBild">Foto:</label>
                <input type="file" id="mitarbeiterBild" accept="image/*" onchange="previewImage()">
                <div id="imagePreview" style="margin-top: 10px;"></div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-success">💾 Speichern</button>
                <button type="button" onclick="cancelMitarbeiterForm()" class="btn btn-danger">❌ Abbrechen</button>
            </div>
        </form>
    `;
    
    container.style.display = 'block';
    
    document.getElementById('mitarbeiterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMitarbeiter();
    });
}

function previewImage() {
    const file = document.getElementById('mitarbeiterBild').files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (currentEditingMitarbeiter) {
                // Bei Bearbeitung: Neues Bild + aktuelles Bild anzeigen
                const currentMitarbeiter = getMitarbeiterById(currentEditingMitarbeiter);
                preview.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>Neues Foto:</strong>
                    </div>
                    <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #28a745; margin-right: 10px;">
                    <div style="margin-top: 10px; margin-bottom: 10px;">
                        <strong>Aktuelles Foto:</strong>
                    </div>
                    <img src="${currentMitarbeiter.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
                `;
            } else {
                // Bei neuem Mitarbeiter: Nur Vorschau
                preview.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>Vorschau:</strong>
                    </div>
                    <img src="${e.target.result}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #28a745;">
                `;
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (currentEditingMitarbeiter) {
            // Zurück zum aktuellen Bild
            const currentMitarbeiter = getMitarbeiterById(currentEditingMitarbeiter);
            preview.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Aktuelles Foto:</strong>
                </div>
                <img src="${currentMitarbeiter.bild}" style="max-width: 100px; max-height: 100px; border-radius: 50%; border: 2px solid #dee2e6;">
            `;
        } else {
            preview.innerHTML = '';
        }
    }
}

function saveMitarbeiter() {
    const name = document.getElementById('mitarbeiterName').value;
    const file = document.getElementById('mitarbeiterBild').files[0];
    
    if (currentEditingMitarbeiter) {
        // Mitarbeiter bearbeiten
        const mitarbeiterObj = getMitarbeiterById(currentEditingMitarbeiter);
        mitarbeiterObj.name = name;
        
        if (file) {
            // Neues Bild hochgeladen
            const reader = new FileReader();
            reader.onload = function(e) {
                mitarbeiterObj.bild = e.target.result;
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(file);
        } else {
            // Kein neues Bild - nur Name aktualisieren
            finishMitarbeiterSave();
        }
    } else {
        // Neuer Mitarbeiter
        const newId = Math.max(...mitarbeiter.map(m => m.id)) + 1;
        const newMitarbeiter = {
            id: newId,
            name: name,
            bild: "https://via.placeholder.com/80"
        };
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newMitarbeiter.bild = e.target.result;
                mitarbeiter.push(newMitarbeiter);
                finishMitarbeiterSave();
            };
            reader.readAsDataURL(file);
        } else {
            mitarbeiter.push(newMitarbeiter);
            finishMitarbeiterSave();
        }
    }
}

function finishMitarbeiterSave() {
    cancelMitarbeiterForm();
    renderMitarbeiterGrid();
    saveToStorage();
    
    // Dienstplan-Anzeige aktualisieren falls sie geladen ist
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    // Success-Message
    showSuccessMessage(currentEditingMitarbeiter ? 'Mitarbeiter wurde aktualisiert!' : 'Mitarbeiter wurde erstellt!');
    
    // Reset
    currentEditingMitarbeiter = null;
}

function cancelMitarbeiterForm() {
    document.getElementById('mitarbeiterFormContainer').style.display = 'none';
    currentEditingMitarbeiter = null;
}

function deleteMitarbeiter(id) {
    const mitarbeiterObj = getMitarbeiterById(id);
    if (confirm(`Mitarbeiter "${mitarbeiterObj.name}" wirklich löschen?\n\nDer Mitarbeiter wird auch aus dem Dienstplan entfernt.`)) {
        // Aus Mitarbeiter-Array entfernen
        mitarbeiter = mitarbeiter.filter(m => m.id !== id);
        
        // Aus Dienstplan entfernen
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = dienstplan[tag][schicht].filter(mId => mId !== id);
            });
        });
        
        renderMitarbeiterGrid();
        saveToStorage();
        
        // Dienstplan-Anzeige aktualisieren falls sie geladen ist
        if (window.location.pathname === '/') {
            renderDienstplanGrid();
        }
        
        showSuccessMessage(`Mitarbeiter "${mitarbeiterObj.name}" wurde gelöscht.`);
    }
}

// Success-Message anzeigen
function showSuccessMessage(message) {
    // Entferne vorhandene Messages
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Nach 3 Sekunden ausblenden
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Verbesserte Mitarbeiter-Grid-Darstellung
function renderMitarbeiterGrid() {
    const grid = document.getElementById('mitarbeiterGrid');
    grid.innerHTML = '';
    
    if (mitarbeiter.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                <h3>Noch keine Mitarbeiter vorhanden</h3>
                <p>Klicken Sie auf "Neuer Mitarbeiter" um den ersten Mitarbeiter hinzuzufügen.</p>
            </div>
        `;
        return;
    }
    
    mitarbeiter.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mitarbeiter-card';
        card.innerHTML = `
            <img src="${m.bild}" alt="${m.name}" onerror="this.src='https://via.placeholder.com/80'">
            <h3>${m.name}</h3>
            <p style="color: #6c757d; margin-bottom: 15px;">ID: ${m.id}</p>
            <div class="actions">
                <button onclick="editMitarbeiter(${m.id})" class="btn btn-warning">✏️ Bearbeiten</button>
                <button onclick="deleteMitarbeiter(${m.id})" class="btn btn-danger">🗑️ Löschen</button>
            </div>
        `;
        grid.appendChild(card);
    });
}
