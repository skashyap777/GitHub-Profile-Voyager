const GITHUB_API_BASE = 'https://api.github.com';

const user1Input = document.getElementById('user1Input');
const user2Input = document.getElementById('user2Input');
const compareBtn = document.getElementById('compareBtn');
const compareLoading = document.getElementById('compareLoading');
const compareResults = document.getElementById('compareResults');
const compareError = document.getElementById('compareError');
const compareErrorMsg = document.getElementById('compareErrorMsg');

let user1Data = null;
let user2Data = null;

compareBtn.addEventListener('click', async () => {
    const username1 = user1Input.value.trim();
    const username2 = user2Input.value.trim();
    
    if (!username1 || !username2) {
        showError('Please enter both usernames');
        return;
    }
    
    await compareUsers(username1, username2);
});

async function compareUsers(username1, username2) {
    showLoading();
    hideError();
    compareResults.classList.add('hidden');
    
    try {
        const [user1, user2] = await Promise.all([
            fetchUser(username1),
            fetchUser(username2)
        ]);
        
        const [repos1, repos2] = await Promise.all([
            fetchRepos(username1),
            fetchRepos(username2)
        ]);
        
        user1Data = { ...user1, repos: repos1 };
        user2Data = { ...user2, repos: repos2 };
        
        displayComparison();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchUser(username) {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    if (!response.ok) throw new Error(`User "${username}" not found`);
    return response.json();
}

async function fetchRepos(username) {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
}

function displayComparison() {
    // Update avatars and names
    document.getElementById('avatar1').src = user1Data.avatar_url;
    document.getElementById('name1').textContent = user1Data.login;
    document.getElementById('avatar2').src = user2Data.avatar_url;
    document.getElementById('name2').textContent = user2Data.login;
    
    // Calculate stats
    const stats1 = calculateStats(user1Data);
    const stats2 = calculateStats(user2Data);
    
    // Render stat comparisons
    document.getElementById('user1Stats').innerHTML = renderStatsColumn(stats1, stats1, stats2, 'primary');
    document.getElementById('user2Stats').innerHTML = renderStatsColumn(stats2, stats1, stats2, 'secondary');
    
    // Determine winner
    const winner = determineWinner(stats1, stats2);
    if (winner) {
        document.getElementById('winnerBanner').classList.remove('hidden');
        document.getElementById('winnerText').textContent = winner === 'tie' 
            ? "It's a tie! Both developers are equally impressive!" 
            : `${winner} wins!`;
    }
    
    compareResults.classList.remove('hidden');
    feather.replace();
}

function calculateStats(user) {
    const totalStars = user.repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = user.repos.reduce((sum, r) => sum + r.forks_count, 0);
    const languages = [...new Set(user.repos.map(r => r.language).filter(Boolean))];
    const avgStars = user.repos.length > 0 ? (totalStars / user.repos.length).toFixed(1) : 0;
    
    return {
        followers: user.followers,
        following: user.following,
        repos: user.public_repos,
        gists: user.public_gists,
        totalStars,
        totalForks,
        languages: languages.length,
        avgStars
    };
}

function renderStatsColumn(stats, stats1, stats2, color) {
    const isPrimary = color === 'primary';
    const comparisons = [
        { key: 'followers', label: 'Followers', icon: 'users' },
        { key: 'following', label: 'Following', icon: 'heart' },
        { key: 'repos', label: 'Repositories', icon: 'folder' },
        { key: 'gists', label: 'Gists', icon: 'file-text' },
        { key: 'totalStars', label: 'Total Stars', icon: 'star' },
        { key: 'totalForks', label: 'Total Forks', icon: 'git-branch' },
        { key: 'languages', label: 'Languages', icon: 'code' },
        { key: 'avgStars', label: 'Avg Stars/Repo', icon: 'award' }
    ];
    
    return comparisons.map(({ key, label, icon }) => {
        const value = stats[key];
        const otherValue = isPrimary ? stats2[key] : stats1[key];
        const isWinning = value > otherValue;
        const isTie = value === otherValue;
        
        const barWidth = Math.max(stats1[key], stats2[key]) > 0 
            ? (value / Math.max(stats1[key], stats2[key]) * 100) 
            : 0;
        
        return `
            <div class="p-4 rounded-xl bg-gray-900 border border-gray-800">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 text-gray-400">
                        <i data-feather="${icon}" class="w-4 h-4"></i>
                        <span class="text-sm">${label}</span>
                    </div>
                    <span class="text-lg font-bold ${isWinning ? `text-${color}-400` : isTie ? 'text-gray-400' : 'text-gray-500'}">
                        ${formatNumber(value)}
                        ${isWinning ? '👑' : ''}
                    </span>
                </div>
                <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-1000" style="width: ${barWidth}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function determineWinner(stats1, stats2) {
    let score1 = 0, score2 = 0;
    const keys = ['followers', 'repos', 'totalStars', 'totalForks', 'languages', 'avgStars'];
    
    keys.forEach(key => {
        if (stats1[key] > stats2[key]) score1++;
        else if (stats2[key] > stats1[key]) score2++;
    });
    
    if (score1 === score2) return 'tie';
    return score1 > score2 ? user1Data.login : user2Data.login;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function showLoading() {
    compareLoading.classList.remove('hidden');
}

function hideLoading() {
    compareLoading.classList.add('hidden');
}

function showError(msg) {
    compareErrorMsg.textContent = msg;
    compareError.classList.remove('hidden');
}

function hideError() {
    compareError.classList.add('hidden');
}