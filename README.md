# dienstplan-wohnheim zur Nutzung mit Raspberry Pi 3b
Digitaler Dienstplan für das Wohnheim

# Raspberry Pi 3b Setup für Dienstplan-System

## 1. Raspberry Pi OS Installation

### Schritt 1: SD-Karte vorbereiten
- Lade **Raspberry Pi Imager** herunter
- Verwende eine **32GB+ SD-Karte**
- Wähle **"Raspberry Pi OS Lite (64-bit)"** (ohne Desktop)
- **Erweiterte Optionen** (Zahnrad-Symbol):
  - SSH aktivieren
  - Benutzername: `pi`
  - Passwort: `dein-passwort`
  - WLAN konfigurieren (falls verfügbar)
- Schreibe auf SD-Karte

### Schritt 2: Erste Verbindung
```bash
# Per SSH verbinden (falls WLAN funktioniert)
ssh pi@192.168.1.XXX

# Oder direkt mit Tastatur/Monitor
```

## 2. System aktualisieren und Docker installieren

### Schritt 3: Grundsetup
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Benötigte Pakete installieren
sudo apt install -y git curl vim hostapd dnsmasq iptables-persistent

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker pi

# Docker Compose installieren
sudo apt install -y docker-compose

# Neustart
sudo reboot
```

## 3. Dein Projekt installieren

### Schritt 4: Repository klonen
```bash
# Nach Neustart wieder einloggen
cd /home/pi
git clone https://github.com/DEIN-USERNAME/dienstplan-wohnheim.git
cd dienstplan-wohnheim

# Test starten
docker-compose up -d
```

## 4. WLAN Access Point einrichten

### Schritt 5: Hostapd konfigurieren
```bash
# Hostapd Konfiguration
sudo nano /etc/hostapd/hostapd.conf
```

**Inhalt:**
```
interface=wlan0
driver=nl80211
ssid=Dienstplan-Wohnheim
hw_mode=g
channel=7
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=Wohnheim123!
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
```

### Schritt 6: DHCP Server (dnsmasq) konfigurieren
```bash
# Backup erstellen
sudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.backup

# Neue Konfiguration
sudo nano /etc/dnsmasq.conf
```

**Inhalt hinzufügen:**
```
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
```

### Schritt 7: Netzwerk-Interfaces konfigurieren
```bash
sudo nano /etc/dhcpcd.conf
```

**Am Ende hinzufügen:**
```
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
```

### Schritt 8: IP-Forwarding und Firewall
```bash
# IP-Forwarding aktivieren
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf

# Firewall-Regeln (falls Internet-Sharing gewünscht)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT

# Regeln speichern
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"
```

### Schritt 9: Services aktivieren
```bash
# Hostapd und dnsmasq aktivieren
sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl enable dnsmasq

# Hostapd Konfiguration setzen
echo 'DAEMON_CONF="/etc/hostapd/hostapd.conf"' | sudo tee -a /etc/default/hostapd
```

## 5. Autostart und Auto-Update einrichten

### Schritt 10: Systemd Service erstellen
```bash
sudo nano /etc/systemd/system/dienstplan.service
```

**Inhalt:**
```ini
[Unit]
Description=Dienstplan Wohnheim
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/dienstplan-wohnheim
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### Schritt 11: Auto-Update Script
```bash
nano /home/pi/update-dienstplan.sh
```

**Inhalt:**
```bash
#!/bin/bash
cd /home/pi/dienstplan-wohnheim
git pull origin main
docker-compose down
docker-compose up -d --build
```

**Ausführbar machen:**
```bash
chmod +x /home/pi/update-dienstplan.sh
```

### Schritt 12: Cronjob für Auto-Update
```bash
crontab -e
```

**Hinzufügen:**
```
# Jeden Tag um 3:00 Uhr updaten
0 3 * * * /home/pi/update-dienstplan.sh >> /home/pi/update.log 2>&1

# Alle 5 Minuten Dienstplan-Seite neu laden (Browser refresh)
*/5 * * * * DISPLAY=:0 xdotool key F5 2>/dev/null
```

## 6. TV-Display und Kiosk-Mode

### Schritt 13: Desktop für TV installieren
```bash
# Minimaler Desktop installieren
sudo apt install -y xserver-xorg xinit chromium-browser unclutter xdotool

# Autostart-Ordner erstellen
mkdir -p /home/pi/.config/autostart
```

### Schritt 14: Kiosk-Mode Script
```bash
nano /home/pi/kiosk.sh
```

**Inhalt:**
```bash
#!/bin/bash
# Cursor verstecken
unclutter -display :0 -noevents -grab &

# Bildschirmschoner deaktivieren
xset s off
xset -dpms
xset s noblank

# Browser im Vollbild starten
chromium-browser --kiosk --disable-infobars --disable-session-crashed-bubble --disable-restore-session-state --no-first-run --disable-web-security --disable-features=VizDisplayCompositor --start-fullscreen http://localhost:3000
```

**Ausführbar machen:**
```bash
chmod +x /home/pi/kiosk.sh
```

### Schritt 15: Autostart konfigurieren
```bash
# Autostart für X11
echo 'startx' >> /home/pi/.bashrc

# X11 Autostart
nano /home/pi/.xinitrc
```

**Inhalt:**
```bash
#!/bin/bash
/home/pi/kiosk.sh
```

## 7. Services aktivieren und starten

### Schritt 16: Alles aktivieren
```bash
# Dienstplan Service aktivieren
sudo systemctl enable dienstplan.service

# Beim Boot automatisch einloggen
sudo systemctl edit getty@tty1
```

**Inhalt:**
```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM
```

## 8. Finaler Test und Inbetriebnahme

### Schritt 17: Neustart und Test
```bash
sudo reboot
```

**Nach dem Neustart sollte:**
- WLAN "Dienstplan-Wohnheim" verfügbar sein
- Passwort: "Wohnheim123!"
- Handy verbinden → http://192.168.4.1:3000
- TV zeigt automatisch den Dienstplan

### Schritt 18: Mobile Optimierung
Füge in deine `index.html` ein:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

## 9. Backup-Strategie

### Schritt 19: Backup erstellen
```bash
# Komplette SD-Karte-Image erstellen
sudo dd if=/dev/mmcblk0 of=/home/pi/backup-$(date +%Y%m%d).img bs=4M

# Nur wichtige Daten
tar -czf /home/pi/dienstplan-backup-$(date +%Y%m%d).tar.gz /home/pi/dienstplan-wohnheim
```

## Zugriff im Wohnheim:
- **WLAN:** "Dienstplan-Wohnheim"
- **Passwort:** "Wohnheim123!"
- **Handy-Zugriff:** http://192.168.4.1:3000
- **TV zeigt:** Dienstplan automatisch im Vollbild
