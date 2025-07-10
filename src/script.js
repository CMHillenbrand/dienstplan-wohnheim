// Beispiel-Daten
let mitarbeiter = [
    { id: 1, name: "Anna Müller", bild: "https://via.placeholder.com/60" },
    { id: 2, name: "Max Mustermann", bild: "https://via.placeholder.com/60" },
    { id: 3, name: "Lisa Schmidt", bild: "https://via.placeholder.com/60" }
];

let dienstplan = {
    "Montag": {
        "Frühdienst": [1, 2],
        "Spätdienst": [3],
        "Nachtdienst": [1]
    },
    "Dienstag": {
        "Frühdienst": [1, 3],
        "Spätdienst": [2],
        "Nachtdienst": [3]
    }
    // Weitere Tage...
};

function ladeDienstplan() {
    const container = document.getElementById('dienstplan');
    const wochentage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    
    container.innerHTML = '';
    
    wochentage.forEach(tag => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag';
        tagDiv.innerHTML = `<h3>${tag}</h3>`;
        
        const schichten = ['Frühdienst', 'Spätdienst', 'Nachtdienst'];
        schichten.forEach(schicht => {
            const schichtDiv = document.createElement('div');
            schichtDiv.className = 'schicht';
            schichtDiv.innerHTML = `<h4>${schicht}</h4>`;
            
            // Mitarbeiter für diese Schicht anzeigen
            if (dienstplan[tag] && dienstplan[tag][schicht]) {
                dienstplan[tag][schicht].forEach(mitarbeiterId => {
                    const mitarbeiterObj = mitarbeiter.find(m => m.id === mitarbeiterId);
                    if (mitarbeiterObj) {
                        const mitarbeiterDiv = document.createElement('div');
                        mitarbeiterDiv.className = 'mitarbeiter';
                        mitarbeiterDiv.innerHTML = `
                            <img src="${mitarbeiterObj.bild}" alt="${mitarbeiterObj.name}">
                            <span class="mitarbeiter-name">${mitarbeiterObj.name}</span>
                        `;
                        schichtDiv.appendChild(mitarbeiterDiv);
                    }
                });
            }
            
            tagDiv.appendChild(schichtDiv);
        });
        
        container.appendChild(tagDiv);
    });
}

function showMitarbeiterVerwaltung() {
    alert('Mitarbeiterverwaltung wird noch implementiert');
}

function showDienstplanBearbeiten() {
    alert('Dienstplan-Bearbeitung wird noch implementiert');
}

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', ladeDienstplan);
