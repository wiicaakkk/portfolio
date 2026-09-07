let currentLat = -6.200000;
let currentLng = 106.816666;
let map = null;
let markers = [];
let html5QrCode = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGPS();
    initMap();
    initQrScanner();
    loadHistory();

    // Toggle Manual Form Panel
    const toggleManualBtn = document.getElementById('toggle-manual-btn');
    if (toggleManualBtn) {
        toggleManualBtn.addEventListener('click', () => {
            document.getElementById('manual-form').classList.toggle('hidden');
        });
    }

    // Parse Manual Button
    const btnParseManual = document.getElementById('btn-parse-manual');
    if (btnParseManual) {
        btnParseManual.addEventListener('click', () => {
            const raw = document.getElementById('raw-qris-input').value.trim();
            if (raw) {
                processQrisPayload(raw);
            } else {
                alert('Silakan masukkan string QRIS terlebih dahulu.');
            }
        });
    }

    // Close result card
    const closeResultBtn = document.getElementById('close-result-btn');
    if (closeResultBtn) {
        closeResultBtn.addEventListener('click', () => {
            document.getElementById('scan-result-card').classList.add('hidden');
        });
    }

    // Clear history
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            if (confirm('Bersihkan seluruh riwayat pemindaian QRIS?')) {
                try {
                    await fetch('/api/v1/qris/clear', { method: 'DELETE' });
                    loadHistory();
                } catch (err) {
                    console.error('Error clearing history:', err);
                }
            }
        });
    }
});

// Navigation Screen Switcher
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
            const targetScreen = document.getElementById(targetId);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }

            if (targetId === 'screen-map' && map) {
                setTimeout(() => map.invalidateSize(), 300);
            }
        });
    });
}

// Geolocation GPS
function initGPS() {
    const status = document.getElementById('gps-status');
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentLat = pos.coords.latitude;
                currentLng = pos.coords.longitude;
                if (status) {
                    status.innerHTML = `<span class="dot-beacon"></span><span class="status-text">GPS Locked</span>`;
                }
                if (map) map.setView([currentLat, currentLng], 13);
            },
            (err) => {
                console.warn('GPS Warning:', err.message);
                if (status) {
                    status.innerHTML = `<span style="color:#ef4444;">⚠️ GPS Standby</span>`;
                }
            },
            { enableHighAccuracy: true }
        );
    }
}

// Leaflet Map Setup
function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    map = L.map('map').setView([currentLat, currentLng], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

// QR Code Scanner Setup
function initQrScanner() {
    const readerEl = document.getElementById('reader');
    if (!readerEl) return;

    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 220, height: 220 } };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (qrCodeMessage) => {
            processQrisPayload(qrCodeMessage);
        },
        () => {
            // Ignore frame scan errors
        }
    ).catch(err => {
        console.log("Kamera tidak aktif atau akses ditolak:", err);
    });
}

// Send payload to Spring Boot API & render TLV
async function processQrisPayload(rawPayload) {
    try {
        const res = await fetch('/api/v1/qris/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rawPayload: rawPayload,
                latitude: currentLat,
                longitude: currentLng,
                address: `Lat: ${currentLat.toFixed(4)}, Lng: ${currentLng.toFixed(4)}`
            })
        });

        const data = await res.json();
        displayScanResult(data, rawPayload);
        loadHistory();
    } catch (e) {
        alert('Gagal memproses QRIS: ' + e.message);
    }
}

// Display Scan Result Card & Render TLV Chips
function displayScanResult(data, rawPayload) {
    const merchantNameEl = document.getElementById('res-merchant-name');
    const merchantCityEl = document.getElementById('res-merchant-city');
    const acquirerEl = document.getElementById('res-acquirer');
    const amountEl = document.getElementById('res-amount');
    const postalEl = document.getElementById('res-postal');
    const gpsEl = document.getElementById('res-gps');

    if (merchantNameEl) merchantNameEl.innerText = data.merchantName || '-';
    if (merchantCityEl) merchantCityEl.innerText = (data.merchantCity || '-') + (data.postalCode && data.postalCode !== '-' ? ` (${data.postalCode})` : '');
    if (acquirerEl) acquirerEl.innerText = data.acquirer || '-';
    if (amountEl) amountEl.innerText = data.amount || 'Rp 0';
    if (postalEl) postalEl.innerText = data.postalCode || '-';
    if (gpsEl) gpsEl.innerText = `${data.latitude ? data.latitude.toFixed(4) : currentLat.toFixed(4)}, ${data.longitude ? data.longitude.toFixed(4) : currentLng.toFixed(4)}`;

    // Render EMVCo TLV Chips
    renderEMVCoTLV(rawPayload || data.rawPayload || '');

    const resultCard = document.getElementById('scan-result-card');
    if (resultCard) resultCard.classList.remove('hidden');
}

// EMVCo TLV Parser Engine
function parseEMVCoTLV(payload) {
    const tags = [];
    if (!payload || payload.length < 4) return tags;

    let index = 0;
    while (index < payload.length) {
        if (index + 4 > payload.length) break;
        const tag = payload.substring(index, index + 2);
        const lengthStr = payload.substring(index + 2, index + 4);
        const length = parseInt(lengthStr, 10);
        if (isNaN(length) || index + 4 + length > payload.length) break;

        const value = payload.substring(index + 4, index + 4 + length);
        tags.push({ tag, length, value });
        index += 4 + length;
    }
    return tags;
}

// Render EMVCo TLV Chips
function renderEMVCoTLV(payload) {
    const container = document.getElementById('tlv-chips-box');
    if (!container) return;

    container.innerHTML = '';
    const tags = parseEMVCoTLV(payload);

    if (tags.length === 0) {
        container.innerHTML = `<span class="tlv-chip"><span class="tlv-val">Raw Payload Format Ready</span></span>`;
        return;
    }

    const tagLabels = {
        '00': 'Payload Ver',
        '01': 'Initiation',
        '26': 'Acquirer/NMIN',
        '51': 'Acquirer/ID',
        '52': 'MCC',
        '53': 'Currency',
        '54': 'Amount',
        '58': 'Country',
        '59': 'Merchant Name',
        '60': 'City',
        '61': 'Postal Code',
        '62': 'Additional Data',
        '63': 'CRC'
    };

    tags.forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'tlv-chip';
        const labelName = tagLabels[t.tag] ? `${tagLabels[t.tag]}` : `Tag ${t.tag}`;
        chip.title = `Tag ${t.tag} (${t.length} bytes): ${t.value}`;
        chip.innerHTML = `<span class="tlv-tag">T${t.tag}</span> <span class="tlv-val">${labelName}: ${t.value.length > 20 ? t.value.substring(0, 18) + '...' : t.value}</span>`;
        container.appendChild(chip);
    });
}

// Load History & Map Markers
async function loadHistory() {
    try {
        const res = await fetch('/api/v1/qris/history');
        const history = await res.json();

        const container = document.getElementById('history-list');
        if (!container) return;
        container.innerHTML = '';

        if (!Array.isArray(history) || history.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:24px 12px; font-size:0.85rem;">Belum ada riwayat pemindaian QRIS.</div>';
            return;
        }

        // Clear existing markers
        markers.forEach(m => map && map.removeLayer(m));
        markers = [];

        history.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card-item';
            
            const formattedTime = item.scannedAt ? new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';

            card.innerHTML = `
                <div>
                    <h4>${item.merchantName || 'Unknown Merchant'}</h4>
                    <p>📍 ${item.merchantCity || '-'} • ${item.amount || 'Rp 0'}</p>
                </div>
                <div class="history-right">
                    <span class="acquirer-badge">${item.acquirer || 'QRIS'}</span>
                    <p class="scan-time">${formattedTime}</p>
                </div>
            `;
            container.appendChild(card);

            // Add Leaflet Marker
            if (map && item.latitude && item.longitude) {
                const marker = L.marker([item.latitude, item.longitude]).addTo(map)
                    .bindPopup(`
                        <div style="font-family:sans-serif; color:#0f172a; padding:4px;">
                            <b style="font-size:0.95rem;">${item.merchantName}</b><br>
                            <span style="font-size:0.8rem; color:#475569;">${item.merchantCity} (${item.acquirer})</span><br>
                            <span style="font-size:0.85rem; font-weight:bold; color:#059669;">${item.amount}</span>
                        </div>
                    `);
                markers.push(marker);
            }
        });

        const countEl = document.getElementById('map-marker-count');
        if (countEl) {
            countEl.innerText = `${history.length} Lokasi`;
        }
    } catch (e) {
        console.error('Error loading history:', e);
    }
}
