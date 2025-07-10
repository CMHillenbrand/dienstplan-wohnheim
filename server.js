const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('src'));

// Datenordner erstellen
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const mitarbeiterFile = path.join(dataDir, 'mitarbeiter.json');
const dienstplanFile = path.join(dataDir, 'dienstplan.json');

// Hilfsfunktionen
function loadData(filename, defaultData) {
    try {
        if (fs.existsSync(filename)) {
            const data = fs.readFileSync(filename, 'utf8');
            return JSON.parse(data);
        }
        return defaultData;
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        return defaultData;
    }
}

function saveData(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        return false;
    }
}

// API Routen
app.get('/api/mitarbeiter', (req, res) => {
    const mitarbeiter = loadData(mitarbeiterFile, []);
    res.json(mitarbeiter);
});

app.post('/api/mitarbeiter', (req, res) => {
    const success = saveData(mitarbeiterFile, req.body);
    res.json({ success });
});

app.get('/api/dienstplan', (req, res) => {
    const defaultDienstplan = {
        "Montag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Dienstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Mittwoch": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Donnerstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Freitag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Samstag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] },
        "Sonntag": { "Frühdienst": [], "Spätdienst": [], "Nachtdienst": [] }
    };
    const dienstplan = loadData(dienstplanFile, defaultDienstplan);
    res.json(dienstplan);
});

app.post('/api/dienstplan', (req, res) => {
    const success = saveData(dienstplanFile, req.body);
    res.json({ success });
});

// Alle anderen Routen zu index.html weiterleiten (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
