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

// Globale Variablen für die Auswahl
let currentEditingSchicht = null;
let currentSelectedMitarbeiter = [];
let filteredMitarbeiter = [];

// VISUELLER DIENSTPLAN EDITOR
function showDienstplanEditor() {
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div class="dienstplan-bearbeitung">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Dienstplan bearbeiten</h2>
                <div>
                    <button onclick="resetDienstplan()" class="btn btn-warning">🔄 Zurücksetzen</button>
                    <button onclick="saveDienstplan()" class="btn btn-success">💾 Speichern</button>
                </div>
            </div>
            
            <div class="alert" style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>Anleitung:</strong> Klicken Sie auf eine Schicht, um die Mitarbeiter für diese Schicht auszuwählen.
            </div>
            
            <div class="dienstplan-edit-grid" id="dienstplanEditGrid">
                <!-- Wird dynamisch gefüllt -->
            </div>
        </div>
        
        <!-- Mitarbeiter-Auswahl Modal -->
        <div id="mitarbeiterAuswahlModal" class="mitarbeiter-auswahl-modal">
            <div class="mitarbeiter-auswahl-content">
                <div class="auswahl-header">
                    <h2>Mitarbeiter auswählen</h2>
                    <span class="close" onclick="closeMitarbeiterAuswahl()">&times;</span>
                </div>
                
                <div class="auswahl-info">
                    <h3 id="schichtInfo">Schicht auswählen</h3>
                    <div class="selected-count" id="selectedCount">0 ausgewählt</div>
                </div>
                
                <div class="search-container">
                    <input type="text" class="search-input" id="mitarbeiterSearch" 
                           placeholder="Mitarbeiter suchen..." 
                           onkeyup="filterMitarbeiter()">
                </div>
                
                <div class="mitarbeiter-auswahl-grid" id="mitarbeiterAuswahlGrid">
                    <!-- Wird dynamisch gefüllt -->
                </div>
                
                <div class="auswahl-actions">
                    <button onclick="clearSelection()" class="btn btn-warning">🗑️ Auswahl leeren</button>
                    <div class="auswahl-buttons">
                        <button onclick="closeMitarbeiterAuswahl()" class="btn btn-danger">❌ Abbrechen</button>
                        <button onclick="saveSchichtAuswahl()" class="btn btn-success">💾 Übernehmen</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    renderDienstplanEditGrid();
}

function renderDienstplanEditGrid() {
    const grid = document.getElementById('dienstplanEditGrid');
    grid.innerHTML = '';
    
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    // Tag-Header erstellen
    wochentage.forEach(tag => {
        const tagHeader = document.createElement('div');
        tagHeader.className = 'edit-tag-header';
        tagHeader.textContent = tag;
        grid.appendChild(tagHeader);
    });
    
    // Schichten erstellen
    schichten.forEach(schicht => {
        wochentage.forEach(tag => {
            const schichtCell = document.createElement('div');
            schichtCell.className = 'edit-schicht-cell';
            schichtCell.onclick = () => openMitarbeiterAuswahl(tag, schicht);
            
            const schichtHeader = document.createElement('div');
            schichtHeader.className = 'edit-schicht-header';
            schichtHeader.textContent = schicht;
            schichtCell.appendChild(schichtHeader);
            
            const mitarbeiterContainer = document.createElement('div');
            mitarbeiterContainer.className = 'edit-mitarbeiter-container';
            
            // Mitarbeiter für diese Schicht anzeigen
            if (dienstplan[tag] && dienstplan[tag][schicht]) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = getMitarbeiterById(mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'edit-mitarbeiter-item';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span>${formatMitarbeiterName(mitarbeiterObj)}</span>
                        `;
                        mitarbeiterContainer.appendChild(mitarbeiterDiv);
                    }
                });
            }
            
            // Add-Button
            const addButton = document.createElement('button');
            addButton.className = 'edit-add-button';
            addButton.textContent = '+ Mitarbeiter';
            addButton.onclick = (e) => {
                e.stopPropagation();
                openMitarbeiterAuswahl(tag, schicht);
            };
            mitarbeiterContainer.appendChild(addButton);
            
            schichtCell.appendChild(mitarbeiterContainer);
            grid.appendChild(schichtCell);
        });
    });
}

function openMitarbeiterAuswahl(tag, schicht) {
    currentEditingSchicht = { tag, schicht };
    
    // Aktuell ausgewählte Mitarbeiter laden
    currentSelectedMitarbeiter = dienstplan[tag][schicht] ? [...dienstplan[tag][schicht]] : [];
    
    // Info aktualisieren
    document.getElementById('schichtInfo').textContent = `${tag} - ${schicht}`;
    
    // Suchfeld leeren
    document.getElementById('mitarbeiterSearch').value = '';
    
    // Mitarbeiter laden
    filteredMitarbeiter = [...mitarbeiter];
    renderMitarbeiterAuswahlGrid();
    
    // Modal anzeigen
    document.getElementById('mitarbeiterAuswahlModal').style.display = 'block';
    
    // Aktuell bearbeitete Zelle hervorheben
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
        cell.classList.remove('editing');
    });
    
    // Entsprechende Zelle finden und hervorheben
    const cells = document.querySelectorAll('.edit-schicht-cell');
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
    
    const tagIndex = wochentage.indexOf(tag);
    const schichtIndex = schichten.indexOf(schicht);
    const cellIndex = schichtIndex * 7 + tagIndex;
    
    if (cells[cellIndex]) {
        cells[cellIndex].classList.add('editing');
    }
}

function renderMitarbeiterAuswahlGrid() {
    const grid = document.getElementById('mitarbeiterAuswahlGrid');
    grid.innerHTML = '';
    
    if (filteredMitarbeiter.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                <h3>Keine Mitarbeiter gefunden</h3>
                <p>Versuchen Sie einen anderen Suchbegriff.</p>
            </div>
        `;
        return;
    }
    
    filteredMitarbeiter.forEach(m => {
        const card = document.createElement('div');
        card.className = 'auswahl-mitarbeiter-card';
        card.onclick = () => toggleMitarbeiterSelection(m.id);
        
        if (currentSelectedMitarbeiter.includes(m.id)) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <img src="${m.bild}" alt="${m.name}">
            <h4>${m.name}</h4>
            <div class="checkmark">✓</div>
        `;
        
        grid.appendChild(card);
    });
    
    updateSelectedCount();
}

function toggleMitarbeiterSelection(mitarbeiterId) {
    if (currentSelectedMitarbeiter.includes(mitarbeiterId)) {
        currentSelectedMitarbeiter = currentSelectedMitarbeiter.filter(id => id !== mitarbeiterId);
    } else {
        currentSelectedMitarbeiter.push(mitarbeiterId);
    }
    
    // Karte aktualisieren
    const cards = document.querySelectorAll('.auswahl-mitarbeiter-card');
    cards.forEach(card => {
        const img = card.querySelector('img');
        const mitarbeiterObj = mitarbeiter.find(m => m.bild === img.src);
        if (mitarbeiterObj && mitarbeiterObj.id === mitarbeiterId) {
            card.classList.toggle('selected');
        }
    });
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = currentSelectedMitarbeiter.length;
    document.getElementById('selectedCount').textContent = `${count} ausgewählt`;
}

function filterMitarbeiter() {
    const searchTerm = document.getElementById('mitarbeiterSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredMitarbeiter = [...mitarbeiter];
    } else {
        filteredMitarbeiter = mitarbeiter.filter(m => 
            m.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderMitarbeiterAuswahlGrid();
}

function clearSelection() {
    currentSelectedMitarbeiter = [];
    renderMitarbeiterAuswahlGrid();
}

function saveSchichtAuswahl() {
    if (currentEditingSchicht) {
        const { tag, schicht } = currentEditingSchicht;
        
        // Dienstplan aktualisieren
        dienstplan[tag][schicht] = [...currentSelectedMitarbeiter];
        
        // Nachtschicht automatisch zu Frühdienst des nächsten Tags
        if (schicht === 'Nachtdienst') {
            const nextDay = getNextDay(tag);
            if (nextDay) {
                currentSelectedMitarbeiter.forEach(mitarbeiterId => {
                    if (!dienstplan[nextDay]['Frühdienst'].includes(mitarbeiterId)) {
                        dienstplan[nextDay]['Frühdienst'].push(mitarbeiterId);
                    }
                });
            }
        }
        
        // Grid aktualisieren
        renderDienstplanEditGrid();
        
        // Modal schließen
        closeMitarbeiterAuswahl();
        
        // Success-Message
        showSuccessMessage(`${tag} - ${schicht} wurde aktualisiert (${currentSelectedMitarbeiter.length} Mitarbeiter)`);
    }
}

function closeMitarbeiterAuswahl() {
    document.getElementById('mitarbeiterAuswahlModal').style.display = 'none';
    currentEditingSchicht = null;
    currentSelectedMitarbeiter = [];
    
    // Hervorhebung entfernen
    document.querySelectorAll('.edit-schicht-cell').forEach(cell => {
        cell.classList.remove('editing');
    });
}

function resetDienstplan() {
    if (confirm('Dienstplan wirklich zurücksetzen? Alle Änderungen gehen verloren.')) {
        // Alle Schichten leeren
        Object.keys(dienstplan).forEach(tag => {
            Object.keys(dienstplan[tag]).forEach(schicht => {
                dienstplan[tag][schicht] = [];
            });
        });
        
        renderDienstplanEditGrid();
        showSuccessMessage('Dienstplan wurde zurückgesetzt');
    }
}

function saveDienstplan() {
    saveToStorage();
    
    // Hauptansicht aktualisieren falls geöffnet
    if (window.location.pathname === '/') {
        renderDienstplanGrid();
    }
    
    showSuccessMessage('Dienstplan wurde gespeichert!');
}

// Bestehende getNextDay Funktion...
function getNextDay(currentDay) {
    const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const index = tage.indexOf(currentDay);
    return index === 6 ? 'Montag' : tage[index + 1];
}

// Modal schließen bei Klick außerhalb
window.onclick = function(event) {
    const modal = document.getElementById('mitarbeiterAuswahlModal');
    if (event.target === modal) {
        closeMitarbeiterAuswahl();
    }
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
