// Stackinfolio Interactive Script

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    generateHeatmap();
    fetchGitHubProfile('wiicaakkk');
});

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

// ================= GITHUB HEATMAP ONE CAT MATRIX (52 WEEKS x 7 DAYS) =================
const CAT_HEATMAP_DATA = [
    // Left Sparse Activity (Cols 0..14)
    [0,0,0,0,0,0,0], [0,1,0,0,0,0,0], [0,0,0,0,1,0,0], [0,0,0,0,0,0,0], [0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0], [0,0,0,1,0,0,0], [0,0,0,0,0,0,0], [0,1,0,0,0,0,0], [0,0,0,0,0,1,0],
    [0,0,0,0,0,0,0], [0,0,1,0,0,0,0], [0,0,0,0,0,0,0], [0,1,0,0,0,0,0], [0,0,0,0,0,0,0],

    // 🐱 THE ONE CAT (Cols 15..36)
    [0,0,0,0,0,0,4], // Col 15: Tail tip
    [0,0,0,0,0,4,4], // Col 16: Tail curve
    [0,0,0,0,3,4,0], // Col 17: Tail base
    [0,0,0,4,4,4,4], // Col 18: Rear body & leg
    [0,0,4,4,4,4,0], // Col 19: Rear leg
    [0,4,4,4,4,4,4], // Col 20: Body
    [0,4,4,4,4,4,4], // Col 21: Body
    [0,4,4,4,4,4,0], // Col 22: Belly
    [0,4,4,4,4,4,4], // Col 23: Front shoulder
    [0,4,4,4,4,4,4], // Col 24: Front leg
    [4,4,4,4,4,4,0], // Col 25: Neck & chest
    [4,4,0,0,0,0,0], // Col 26: Left Whisker
    [4,4,4,4,0,0,0], // Col 27: Ear L tip
    [3,4,4,4,4,0,0], // Col 28: Ear L base
    [2,4,4,4,4,4,0], // Col 29: Head L
    [2,4,1,4,4,4,0], // Col 30: Eye L (level-1)
    [3,4,4,2,4,4,4], // Col 31: Nose & Muzzle
    [2,4,1,4,4,4,0], // Col 32: Eye R (level-1)
    [2,4,4,4,4,4,0], // Col 33: Head R
    [3,4,4,4,4,0,0], // Col 34: Ear R base
    [4,4,4,4,0,0,0], // Col 35: Ear R tip
    [4,4,0,0,0,0,0], // Col 36: Right Whisker

    // Right Sparse Activity (Cols 37..51)
    [0,0,0,0,0,0,0], [0,0,0,1,0,0,0], [0,0,0,0,0,0,0], [0,1,0,0,0,0,0], [0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0], [0,0,1,0,0,0,0], [0,0,0,0,0,0,0], [0,0,0,0,0,1,0], [0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0], [0,0,0,1,0,0,0], [0,0,0,0,0,0,0], [0,0,1,0,0,0,0], [0,0,0,0,0,0,0]
];

let heatmapCells = [];
let catAnimInterval = null;

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

    renderCatHeatmap(false);
    startCatBlinkAnimation();
}

function renderCatHeatmap(isBlinking = false) {
    for (let col = 0; col < 52; col++) {
        const colData = CAT_HEATMAP_DATA[col] || [0,0,0,0,0,0,0];

        for (let row = 0; row < 7; row++) {
            const cellIndex = col * 7 + row; // grid-auto-flow: column
            const cell = heatmapCells[cellIndex];
            if (!cell) continue;

            let level = colData[row];

            // Subtle Eye Blink effect: level-1 (light green eye) turns to level-4 when blinking
            if (isBlinking && level === 1) {
                level = 4;
            }

            cell.className = 'heatmap-cell level-' + level;
        }
    }
}

function startCatBlinkAnimation() {
    if (catAnimInterval) clearInterval(catAnimInterval);

    catAnimInterval = setInterval(() => {
        // Blink eyes closed/open
        renderCatHeatmap(true);
        setTimeout(() => {
            renderCatHeatmap(false);
        }, 180);
    }, 3200); // Blinks every 3.2 seconds
}
