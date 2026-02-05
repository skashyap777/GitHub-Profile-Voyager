const GITHUB_API_BASE = 'https://api.github.com';

const statsUsername = document.getElementById('statsUsername');
const analyzeBtn = document.getElementById('analyzeBtn');
const statsLoading = document.getElementById('statsLoading');
const statsResults = document.getElementById('statsResults');
const statsError = document.getElementById('statsError');
const statsErrorMsg = document.getElementById('statsErrorMsg');

let charts = {};

analyzeBtn.addEventListener('click', () => {
    const username = statsUsername.value.trim();
    if (username) analyzeUser(username);
});

async function analyzeUser(username) {
    showLoading();
    hideError();
    statsResults.classList.add('hidden');
    destroyCharts();
    
    try {
        const user = await fetchUser(username);
        const repos = await fetchAllRepos(username);
        const events = await fetchEvents(username);
        
        const analysis = analyzeData(user, repos, events);
        displayResults(analysis, repos);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchUser(username) {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
}

async function fetchAllRepos(username) {
    const repos = [];
    let page = 1;
    while (page <= 3) { // Limit to 90 repos
        const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&page=${page}`);
        const pageRepos = await response.json();
        if (pageRepos.length === 0) break;
        repos.push(...pageRepos);
        page++;
    }
    return repos;
}

async function fetchEvents(username) {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/events/public?per_page=100`);
    return response.json();
}

function analyzeData(user, repos, events) {
    // Language analysis
    const languages = {};
    let totalSize = 0;
    repos.forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + repo.size;
            totalSize += repo.size;
        }
    });
    
    const languageData = Object.entries(languages)
        .map(([name, size]) => ({ name, size, percentage: (size / totalSize * 100).toFixed(1) }))
        .sort((a, b) => b.size - a.size);
    
    // Estimate commits from events
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    const estimatedCommits = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);
    
    // Active days
    const activeDays = new Set(events.map(e => e.created_at.split('T')[0])).size;
    
    // Best streak (consecutive days)
    const dates = [...new Set(events.map(e => e.created_at.split('T')[0]))].sort();
    let maxStreak = 0, currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i-1]);
        const curr = new Date(dates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    // Activity by day of week
    const dayActivity = new Array(7).fill(0);
    events.forEach(e => {
        const day = new Date(e.created_at).getDay();
        dayActivity[day]++;
    });
    
    // Estimated lines of code (very rough estimate)
    const estimatedLines = repos.reduce((sum, r) => sum + (r.size * 100), 0);
    
    return {
        languageData,
        estimatedCommits: Math.max(estimatedCommits, repos.length * 10),
        activeDays,
        maxStreak: Math.max(maxStreak, 1),
        dayActivity,
        estimatedLines
    };
}

function displayResults(analysis, repos) {
    // Update cards
    document.getElementById('totalCommits').textContent = formatNumber(analysis.estimatedCommits);
    document.getElementById('totalCode').textContent = formatBytes(analysis.estimatedLines);
    document.getElementById('activeDays').textContent = analysis.activeDays;
    document.getElementById('streak').textContent = analysis.maxStreak + ' days';
    
    // Language Pie Chart
    const ctx1 = document.getElementById('languagePieChart').getContext('2d');
    charts.language = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: analysis.languageData.slice(0, 8).map(l => l.name),
            datasets: [{
                data: analysis.languageData.slice(0, 8).map(l => l.size),
                backgroundColor: ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right', labels: { color: '#9ca3af' } }
            }
        }
    });
    
    // Activity Chart
    const ctx2 = document.getElementById('activityChart').getContext('2d');
    charts.activity = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Activity',
                data: analysis.dayActivity,
                backgroundColor: '#0ea5e9'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
        }
    });
    
    // Growth Chart (repo creation over time)
    const monthlyData = {};
    repos.forEach(r => {
        const date = new Date(r.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort().slice(-12);
    const ctx3 = document.getElementById('growthChart').getContext('2d');
    charts.growth = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Repos Created',
                data: sortedMonths.map(m => monthlyData[m]),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#1f2937' }, ticks: { color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
            }
        }
    });
    
    // Top Repos
    const topRepos = repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);
    document.getElementById('topReposList').innerHTML = topRepos.map((repo, i) => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-gray-800">
            <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold">${i + 1}</span>
                <span class="font-medium">${repo.name}</span>
            </div>
            <div class="flex items-center gap-1 text-amber-400">
                <i data-feather="star" class="w-4 h-4"></i>
                <span>${formatNumber(repo.stargazers_count)}</span>
            </div>
        </div>
    `).join('');
    
    // Contribution Calendar (mock)
    const calendar = document.getElementById('contributionCalendar');
    calendar.innerHTML = '';
    const levels = ['bg-gray-800', 'bg-primary-900', 'bg-primary-700', 'bg-primary-500', 'bg-primary-400'];
    for (let i = 0; i < 365; i++) {
        const level = Math.floor(Math.random() * 5);
        const day = document.createElement('div');
        day.className = `w-3 h-3 rounded-sm ${levels[level]}`;
        day.title = `${Math.floor(Math.random() * 10)} contributions`;
        calendar.appendChild(day);
    }
    
    statsResults.classList.remove('hidden');
    feather.replace();
}

function destroyCharts() {
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1000;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showLoading() {
    statsLoading.classList.remove('hidden');
}

function hideLoading() {
    statsLoading.classList.add('hidden');
}

function showError(msg) {
    statsErrorMsg.textContent = msg;
    statsError.classList.remove('hidden');
}

function hideError() {
    statsError.classList.add('hidden');
}