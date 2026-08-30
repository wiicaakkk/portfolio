// Stackinfolio Interactive Script

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    generateHeatmap();
    fetchGitHubProfile('wiicaakkk');

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArchModal();
        }
    });
});

// ================= SYSTEM ARCHITECTURE DATA & MODAL LOGIC =================
const PROJECT_ARCHITECTURES = {
    'core-banking-engine': {
        title: 'Core Banking Distributed Engine',
        category: 'Enterprise Financial Systems',
        status: 'Production Grade • High Concurrency',
        metrics: [
            { label: 'Latency', value: '< 12ms' },
            { label: 'Concurrency', value: '10,000+ TPS' },
            { label: 'Compliance', value: 'Bank Indonesia EMVCo / SWIFT' }
        ],
        pipeline: [
            {
                step: '1. Ingress & Auth Gateway',
                tech: 'Nginx + Cloudflare Tunnel + JWT / OAuth2 Guard',
                icon: 'fa-shield-halved',
                description: 'Reverse proxy with rate limiting, SSL termination, and token authentication.'
            },
            {
                step: '2. Application Core',
                tech: 'Java 21 Spring Boot 3 (Virtual Threads / Loom)',
                icon: 'fa-cubes',
                description: 'High-throughput payment posting, Daily Interest Accrual worker, and SWIFT MT103 parser.'
            },
            {
                step: '3. Async Messaging',
                tech: 'Apache Kafka Event Bus',
                icon: 'fa-bolt',
                description: 'Decoupled event streams for asynchronous General Ledger (GL) posting and audit trails.'
            },
            {
                step: '4. Memory Caching',
                tech: 'Redis Cluster',
                icon: 'fa-memory',
                description: 'Sub-millisecond balance lookup, idempotency keys, and session cache.'
            },
            {
                step: '5. Enterprise Database',
                tech: 'Oracle DB 19c (Partitioned Tables)',
                icon: 'fa-database',
                description: 'ACID-compliant relational ledger for accounts, daily accrual logs, and balance reconciliation.'
            }
        ]
    },
    'qris-location-tracker': {
        title: 'QRIS Location Tracker System',
        category: 'Fintech Geo-Location & Scanning',
        status: 'Full-Stack Native & Cloud',
        metrics: [
            { label: 'Geospatial Index', value: 'PostGIS Spatial R-Tree' },
            { label: 'Mobile Client', value: 'Flutter Native (Android/iOS)' },
            { label: 'Barcode Parser', value: 'EMVCo QR Standard' }
        ],
        pipeline: [
            {
                step: '1. Mobile App Client',
                tech: 'Flutter + Camera Scanner + GPS Location API',
                icon: 'fa-mobile-screen',
                description: 'Native mobile scanner decoding EMVCo QR payloads with real-time GPS coordinate tagging.'
            },
            {
                step: '2. API Ingress',
                tech: 'Nginx API Gateway',
                icon: 'fa-server',
                description: 'Manages TLS encryption, request throttling, and CORS policies.'
            },
            {
                step: '3. Backend Microservice',
                tech: 'Java 21 Spring Boot 3 + Spring Data JPA',
                icon: 'fa-code',
                description: 'Processes QR validation, merchant location mapping, and transaction history APIs.'
            },
            {
                step: '4. Spatial Database',
                tech: 'PostgreSQL + PostGIS Extension',
                icon: 'fa-location-dot',
                description: 'Stores merchant spatial points, performing fast radius queries for nearest payment points.'
            }
        ]
    },
    'homelab-control-center': {
        title: 'EVA-01 Homelab & CCTV Operations Center',
        category: 'System Operations & Hardware Telemetry',
        status: 'Realtime WebSocket • Multi-Node',
        metrics: [
            { label: 'Nodes Monitored', value: 'Proxmox CT 102 & Host' },
            { label: 'Video Feeds', value: 'USB SunplusIT 720p HD + Tapo' },
            { label: 'Theme', value: 'Glassmorphism NERV EVA-01' }
        ],
        pipeline: [
            {
                step: '1. Edge Hardware & Cameras',
                tech: 'SunplusIT USB Webcam (Port 8086) + TAPO Smart Plugs',
                icon: 'fa-video',
                description: 'Udev rule bound video device streaming MJPEG feeds alongside Tapo power telemetry.'
            },
            {
                step: '2. Proxmox LXC Container',
                tech: 'CT 102 Container (Docker Environment)',
                icon: 'fa-microchip',
                description: 'Hosts homelab_dashboard micro-service running Node.js backend on Port 3000.'
            },
            {
                step: '3. Realtime Telemetry API',
                tech: 'Node.js Express + WebSockets + System Info',
                icon: 'fa-chart-line',
                description: 'Polls CPU, RAM, Disk, and container uptime metrics with 1-second refresh intervals.'
            },
            {
                step: '4. Operations Matrix UI',
                tech: 'Vanilla HTML5 / CSS3 (NERV EVA-01 Theme)',
                icon: 'fa-desktop',
                description: 'High-density operations matrix featuring live CCTV grid and smart plug power toggles.'
            }
        ]
    },
    'troboslink-ads-bypass': {
        title: 'TrobosLink Ad-Skipping Engine',
        category: 'Web Automation & Link Resolver',
        status: 'High Speed • Headless Solver',
        metrics: [
            { label: 'Bypass Speed', value: '< 800ms' },
            { label: 'Ad Skipping', value: '100% Automated' },
            { label: 'Domain', value: 'bypass.wicak.cloud' }
        ],
        pipeline: [
            {
                step: '1. User Request',
                tech: 'Web Client / Bookmarklet / API',
                icon: 'fa-link',
                description: 'Passes obfuscated shortlink URL to bypass engine.'
            },
            {
                step: '2. Resolution Worker',
                tech: 'Node.js Express + Playwright Engine',
                icon: 'fa-gears',
                description: 'Executes headless browser automation, executing JS timers and bypassing interstitial ads.'
            },
            {
                step: '3. Shortlink Cache',
                tech: 'Redis Key-Value Cache',
                icon: 'fa-database',
                description: 'Stores previously resolved links for instant zero-latency responses on repeated queries.'
            }
        ]
    },
    'whatsapp-homelab-bot': {
        title: 'Automated WhatsApp Homelab Bot',
        category: 'ChatOps & Server Monitoring',
        status: 'Active 24/7 • Event Driven',
        metrics: [
            { label: 'Library', value: '@whiskeysockets/baileys' },
            { label: 'Alerting', value: 'Proxmox Server Health' },
            { label: 'Image Engine', value: 'Sharp JS' }
        ],
        pipeline: [
            {
                step: '1. WhatsApp Gateway',
                tech: 'Baileys Multi-Device Web API',
                icon: 'fa-comments',
                description: 'Persistent WebSockets connection listening to incoming chat messages and commands.'
            },
            {
                step: '2. Command Handler',
                tech: 'Node.js + Sharp Image Library',
                icon: 'fa-terminal',
                description: 'Processes sticker commands, converts images, and executes server status scripts.'
            },
            {
                step: '3. Health Checker',
                tech: 'Systemctl & Proxmox Health Checkers',
                icon: 'fa-heart-pulse',
                description: 'Pings server nodes and broadcasts instant alerts if container CPU or RAM exceeds threshold.'
            }
        ]
    },
    'openclaw-ai-gateway': {
        title: 'OpenClaw Multi-Model AI Gateway',
        category: 'LLM Orchestration & Agent Routing',
        status: 'Resilient Multi-Provider Fallback',
        metrics: [
            { label: 'Primary Model', value: 'Gemini 1.5 Flash' },
            { label: 'Fallback Provider', value: 'OpenRouter / DeepSeek' },
            { label: 'Framework', value: 'Python FastAPI' }
        ],
        pipeline: [
            {
                step: '1. Agent Request',
                tech: 'FastAPI REST Endpoint',
                icon: 'fa-robot',
                description: 'Receives prompt payloads from homelab bots and CLI tools.'
            },
            {
                step: '2. Model Router',
                tech: 'Python Async Engine',
                icon: 'fa-diagram-project',
                description: 'Routes prompt to Gemini 1.5 Flash. On rate limit (429) or error, seamlessly fails over to OpenRouter / DeepSeek.'
            },
            {
                step: '3. Formatter',
                tech: 'Markdown & JSON Formatter',
                icon: 'fa-code-branch',
                description: 'Standardizes LLM output schema for downstream consumption.'
            }
        ]
    }
};

function openArchModal(event, projectId) {
    if (event) event.stopPropagation(); // Prevent card link opening

    const data = PROJECT_ARCHITECTURES[projectId];
    if (!data) return;

    // Elements
    const overlay = document.getElementById('archModalOverlay');
    const categoryElem = document.getElementById('archModalCategory');
    const titleElem = document.getElementById('archModalTitle');
    const statusElem = document.getElementById('archModalStatus');
    const metricsGrid = document.getElementById('archMetricsGrid');
    const pipelineContainer = document.getElementById('archPipelineContainer');

    if (!overlay) return;

    // Fill Content
    categoryElem.innerText = data.category;
    titleElem.innerText = data.title;
    statusElem.innerText = data.status;

    // Populate Metrics
    metricsGrid.innerHTML = data.metrics.map(m => `
        <div class="arch-metric-card">
            <span class="arch-metric-label">${m.label}</span>
            <span class="arch-metric-value">${m.value}</span>
        </div>
    `).join('');

    // Populate Pipeline Steps
    pipelineContainer.innerHTML = data.pipeline.map((p, index) => `
        <div class="arch-step-card">
            <div class="arch-step-header">
                <div class="arch-step-icon">
                    <i class="fa-solid ${p.icon}"></i>
                </div>
                <div class="arch-step-title-box">
                    <span class="arch-step-num">${p.step}</span>
                    <span class="arch-step-tech">${p.tech}</span>
                </div>
            </div>
            <p class="arch-step-desc">${p.description}</p>
        </div>
        ${index < data.pipeline.length - 1 ? `
            <div class="arch-pipeline-arrow">
                <i class="fa-solid fa-arrow-down"></i>
            </div>
        ` : ''}
    `).join('');

    // Show Modal
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeArchModal(event) {
    if (event && event.target.id !== 'archModalOverlay' && !event.target.closest('.arch-modal-close') && !event.target.closest('.btn-modal-done')) {
        return;
    }
    const overlay = document.getElementById('archModalOverlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
    document.body.style.overflow = '';
}

// Tab Switcher Logic (Projects vs Work Experience vs Contact)
function switchTab(tabName) {
    const projectsBtn = document.getElementById('tabProjectsBtn');
    const expBtn = document.getElementById('tabExperienceBtn');
    const contactBtn = document.getElementById('tabContactBtn');

    const viewProjects = document.getElementById('viewProjects');
    const viewExp = document.getElementById('viewExperience');
    const viewContact = document.getElementById('viewContact');

    // Reset all tabs & views
    [projectsBtn, expBtn, contactBtn].forEach(btn => btn && btn.classList.remove('active'));
    [viewProjects, viewExp, viewContact].forEach(view => view && view.classList.remove('active'));

    if (tabName === 'projects') {
        if (projectsBtn) projectsBtn.classList.add('active');
        if (viewProjects) viewProjects.classList.add('active');
    } else if (tabName === 'experience') {
        if (expBtn) expBtn.classList.add('active');
        if (viewExp) viewExp.classList.add('active');
    } else if (tabName === 'contact') {
        if (contactBtn) contactBtn.classList.add('active');
        if (viewContact) viewContact.classList.add('active');
    }
}

// Theme Toggle Management
function initTheme() {
    const savedTheme = localStorage.getItem('stackinfolio_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('stackinfolio_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.innerText = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Fetch Real GitHub Profile Data (wiicaakkk)
async function fetchGitHubProfile(username) {
    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) return;
        const data = await res.json();

        // Update Name handle
        const handleElem = document.querySelector('.user-handle');
        if (handleElem) {
            handleElem.innerText = data.name || 'Bagus Wicaksono Nurjayanto';
        }

        // Update Location
        const locElem = document.querySelector('.meta-item span');
        if (locElem) {
            locElem.innerText = 'South Jakarta, Indonesia';
        }

        // Update Joined Date if element exists
        const metaItems = document.querySelectorAll('.meta-item span');
        if (metaItems.length > 1 && data.created_at) {
            const date = new Date(data.created_at);
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            metaItems[1].innerText = `Joined ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
    } catch (err) {
        console.warn('GitHub API fetch deferred:', err);
    }
}

// Follow Button Logic
let isFollowing = false;

function toggleFollow() {
    const btn = document.getElementById('btnFollow');
    const icon = document.getElementById('followIcon');
    const text = document.getElementById('followText');

    isFollowing = !isFollowing;

    if (isFollowing) {
        btn.classList.add('following');
        icon.className = 'fa-solid fa-check';
        text.innerText = 'Following';
    } else {
        btn.classList.remove('following');
        icon.className = 'fa-solid fa-plus';
        text.innerText = 'Follow';
    }
}

// Project Like Button Logic
const likedProjects = new Set();

function likeProject(event, id) {
    event.stopPropagation(); // prevent card click link trigger

    const icon = document.getElementById(`icon_${id}`);
    const countElem = document.getElementById(`count_${id}`);
    const btn = event.currentTarget;

    let currentCount = parseInt(countElem.innerText, 10);

    if (likedProjects.has(id)) {
        likedProjects.delete(id);
        currentCount--;
        btn.classList.remove('liked');
        icon.className = 'fa-regular fa-heart';
    } else {
        likedProjects.add(id);
        currentCount++;
        btn.classList.add('liked');
        icon.className = 'fa-solid fa-heart';
    }

    countElem.innerText = currentCount;
}

// Share Portfolio
function sharePortfolio() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Portfolio URL copied to clipboard!');
    }).catch(() => {
        showToast('Share link ready: ' + url);
    });
}

function showToast(message) {
    const toast = document.getElementById('toastPopup');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ================= GITHUB HEATMAP PAC-MAN ANIMATION =================
let pacPosition = -6;
let pacMouthOpen = true;
let eatenPellets = new Set();
let pacAnimInterval = null;
let heatmapCells = [];

function generateHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;

    grid.innerHTML = '';
    heatmapCells = [];
    const totalCells = 52 * 7; // 364 cells (52 cols x 7 rows)

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell level-0';
        grid.appendChild(cell);
        heatmapCells.push(cell);
    }

    startPacmanAnimation();
}

function startPacmanAnimation() {
    if (pacAnimInterval) clearInterval(pacAnimInterval);

    pacPosition = -6;
    eatenPellets.clear();

    pacAnimInterval = setInterval(() => {
        pacPosition++;
        pacMouthOpen = !pacMouthOpen;

        if (pacPosition > 58) {
            pacPosition = -6;
            eatenPellets.clear();
        }

        renderPacmanFrame();
    }, 150); // Speed of Pac-Man movement (150ms per step)
}

function renderPacmanFrame() {
    // 1. Initialize empty 52x7 frame
    const frame = Array.from({ length: 52 }, () => [0, 0, 0, 0, 0, 0, 0]);

    // 2. Add Pac-Dots / Pellets along middle row (row 3)
    const dotCols = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47];
    dotCols.forEach(col => {
        // If Pac-Man has passed this dot, mark eaten
        if (pacPosition >= col + 2) {
            eatenPellets.add(col);
        }
        if (!eatenPellets.has(col)) {
            frame[col][3] = 2; // Green dot
        }
    });

    // 3. Pac-Man Open Mouth (5x5 matrix)
    const pacOpen = [
        [0, 4, 4, 4, 0],
        [4, 4, 4, 0, 0],
        [4, 4, 0, 0, 0], // Open mouth facing right
        [4, 4, 4, 0, 0],
        [0, 4, 4, 4, 0]
    ];

    // Pac-Man Closed Mouth (5x5 matrix)
    const pacClosed = [
        [0, 4, 4, 4, 0],
        [4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4],
        [0, 4, 4, 4, 0]
    ];

    const pacSprite = pacMouthOpen ? pacOpen : pacClosed;

    // Draw Pac-Man onto frame
    for (let c = 0; c < 5; c++) {
        const targetCol = pacPosition + c;
        if (targetCol >= 0 && targetCol < 52) {
            for (let r = 0; r < 5; r++) {
                const val = pacSprite[r][c];
                if (val > 0) {
                    frame[targetCol][r + 1] = val; // Centered at rows 1..5
                }
            }
        }
    }

    // 4. Draw Ghost (Blinky) Sprite (5x5 matrix, trailing by 10 columns)
    const ghostX = pacPosition - 10;
    const ghostSprite = [
        [0, 3, 3, 3, 0],
        [3, 1, 3, 1, 3], // Eyes (level-1)
        [3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3],
        [3, 0, 3, 0, 3]  // Tentacles
    ];

    for (let c = 0; c < 5; c++) {
        const targetCol = ghostX + c;
        if (targetCol >= 0 && targetCol < 52) {
            for (let r = 0; r < 5; r++) {
                const val = ghostSprite[r][c];
                if (val > 0) {
                    frame[targetCol][r + 1] = val; // Centered at rows 1..5
                }
            }
        }
    }

    // 5. Update HTML Grid Cells
    for (let col = 0; col < 52; col++) {
        for (let row = 0; row < 7; row++) {
            const cellIndex = col * 7 + row;
            const cell = heatmapCells[cellIndex];
            if (cell) {
                const level = frame[col][row];
                cell.className = 'heatmap-cell level-' + level;
            }
        }
    }
}
