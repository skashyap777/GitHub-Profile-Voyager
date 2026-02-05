// GitHub API Configuration
const GITHUB_API_BASE = 'https://api.github.com';
const PER_PAGE = 30;

// State Management
let currentUser = null;
let currentRepos = [];
let currentPage = 1;
let sortMethod = 'stars';

// DOM Elements
const searchForm = document.getElementById('searchForm');
const usernameInput = document.getElementById('usernameInput');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

// Statistics (stored in memory for demo)
let globalStats = {
    usersSearched: parseInt(localStorage.getItem('usersSearched') || '0'),
    reposFound: parseInt(localStorage.getItem('reposFound') || '0'),
    totalStars: parseInt(localStorage.getItem('totalStars') || '0'),
    languages: new Set(JSON.parse(localStorage.getItem('languages') || '[]'))
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateGlobalStats();
    setupEventListeners();
    
    // Check for URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
        usernameInput.value = username;
        searchUser(username);
    }
});

function setupEventListeners() {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            searchUser(username);
        }
    });

    document.getElementById('sortStars').addEventListener('click', () => {
        sortMethod = 'stars';
        updateSortButtons();
        sortAndDisplayRepos();
    });

    document.getElementById('sortUpdated').addEventListener('click', () => {
        sortMethod = 'updated';
        updateSortButtons();
        sortAndDisplayRepos();
    });

    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreRepos);
}

function updateSortButtons() {
    document.querySelectorAll('#sortStars, #sortUpdated').forEach(btn => {
        btn.classList.remove('bg-primary-600', 'text-white');
        btn.classList.add('bg-gray-800');
    });
    
    const activeBtn = sortMethod === 'stars' ? document.getElementById('sortStars') : document.getElementById('sortUpdated');
    activeBtn.classList.remove('bg-gray-800');
    activeBtn.classList.add('bg-primary-600', 'text-white');
}

async function searchUser(username) {
    showLoading();
    
    try {
        // Fetch user profile
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${username}`);
        
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error('User not found');
            } else if (userResponse.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error('Failed to fetch user data');
            }
        }
        
        currentUser = await userResponse.json();
        
        // Update global stats
        globalStats.usersSearched++;
        saveGlobalStats();
        updateGlobalStats();
        
        // Fetch repositories
        await fetchRepositories(username);
        
        // Display results
        displayProfile();
        displayLanguages();
        sortAndDisplayRepos();
        
        hideLoading();
        showResults();
        
        // Update URL
        window.history.pushState({}, '', `?user=${username}`);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchRepositories(username, page = 1) {
    const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?per_page=${PER_PAGE}&page=${page}&sort=updated`
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch repositories');
    }
    
    const repos = await response.json();
    currentRepos = page === 1 ? repos : [...currentRepos, ...repos];
    currentPage = page;
    
    // Update stats
    globalStats.reposFound += repos.length;
    repos.forEach(repo => {
        globalStats.totalStars += repo.stargazers_count;
        if (repo.language) {
            globalStats.languages.add(repo.language);
        }
    });
    saveGlobalStats();
    updateGlobalStats();
    
    // Show/hide load more button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (repos.length === PER_PAGE) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }
}

async function loadMoreRepos() {
    const btn = document.getElementById('loadMoreBtn');
    btn.disabled = true;
    btn.innerHTML = '<i data-feather="loader" class="w-5 h-5 animate-spin inline mr-2"></i>Loading...';
    feather.replace();
    
    try {
        await fetchRepositories(currentUser.login, currentPage + 1);
        sortAndDisplayRepos();
    } catch (error) {
        console.error('Failed to load more repos:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Load More Repositories';
    }
}

function displayProfile() {
    // Avatar
    document.getElementById('profileAvatar').src = currentUser.avatar_url;
    
    // Name and login
    const nameEl = document.getElementById('profileName');
    nameEl.textContent = currentUser.name || currentUser.login;
    
    // Bio
    const bioEl = document.getElementById('profileBio');
    bioEl.textContent = currentUser.bio || 'No bio available';
    
    // Link
    const linkEl = document.getElementById('profileLink');
    linkEl.href = currentUser.html_url;
    
    // Hireable badge
    const hireableEl = document.getElementById('hireableBadge');
    if (currentUser.hireable) {
        hireableEl.classList.remove('hidden');
    } else {
        hireableEl.classList.add('hidden');
    }
    
    // Location
    const locationEl = document.getElementById('profileLocation');
    if (currentUser.location) {
        locationEl.classList.remove('hidden');
        locationEl.querySelector('span').textContent = currentUser.location;
    } else {
        locationEl.classList.add('hidden');
    }
    
    // Company
    const companyEl = document.getElementById('profileCompany');
    if (currentUser.company) {
        companyEl.classList.remove('hidden');
        companyEl.querySelector('span').textContent = currentUser.company;
    } else {
        companyEl.classList.add('hidden');
    }
    
    // Blog
    const blogEl = document.getElementById('profileBlog');
    if (currentUser.blog) {
        blogEl.classList.remove('hidden');
        const blogLink = blogEl.querySelector('a');
        let blogUrl = currentUser.blog;
        if (!blogUrl.startsWith('http')) {
            blogUrl = 'https://' + blogUrl;
        }
        blogLink.href = blogUrl;
        blogLink.textContent = currentUser.blog;
    } else {
        blogEl.classList.add('hidden');
    }
    
    // Joined date
    const joinedDate = new Date(currentUser.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('profileJoined').querySelector('span').textContent = `Joined ${joinedDate}`;
    
    // Stats
    document.getElementById('statPublicRepos').textContent = formatNumber(currentUser.public_repos);
    document.getElementById('statFollowers').textContent = formatNumber(currentUser.followers);
    document.getElementById('statFollowing').textContent = formatNumber(currentUser.following);
    document.getElementById('statGists').textContent = formatNumber(currentUser.public_gists);
}

function displayLanguages() {
    const languageCount = {};
    let totalBytes = 0;
    
    currentRepos.forEach(repo => {
        if (repo.language) {
            // Estimate based on stars as proxy for size if no language data
            const bytes = repo.size || 1000;
            languageCount[repo.language] = (languageCount[repo.language] || 0) + bytes;
            totalBytes += bytes;
        }
    });
    
    const sortedLanguages = Object.entries(languageCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const container = document.getElementById('languageTags');
    container.innerHTML = '';
    
    const colors = {
        JavaScript: '#f7df1e',
        TypeScript: '#3178c6',
        Python: '#3776ab',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Go: '#00add8',
        Rust: '#dea584',
        Ruby: '#701516',
        PHP: '#4F5D95',
        Swift: '#ffac45',
        Kotlin: '#A97BFF',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Vue: '#41b883',
        React: '#61dafb'
    };
    
    sortedLanguages.forEach(([lang, bytes]) => {
        const percentage = ((bytes / totalBytes) * 100).toFixed(1);
        const color = colors[lang] || '#8b949e';
        
        const tag = document.createElement('div');
        tag.className = 'flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors';
        tag.innerHTML = `
            <span class="w-3 h-3 rounded-full" style="background-color: ${color}"></span>
            <span class="font-medium text-sm">${lang}</span>
            <span class="text-xs text-gray-500">${percentage}%</span>
        `;
        container.appendChild(tag);
    });
}

function sortAndDisplayRepos() {
    let sorted = [...currentRepos];
    
    if (sortMethod === 'stars') {
        sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else {
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    
    displayRepositories(sorted);
}
function displayRepositories(repos) {
    const grid = document.getElementById('reposGrid');
    grid.innerHTML = '';
    
    repos.forEach((repo, index) => {
        const card = createRepoCard(repo, index);
        grid.appendChild(card);
    });
    
    // Add click handlers for repo cards
    document.querySelectorAll('.repo-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                const link = card.querySelector('a[href*="github.com"]');
                if (link) window.open(link.href, '_blank');
            }
        });
    });
    
    feather.replace();
}
function createRepoCard(repo, index) {
    const div = document.createElement('div');
    div.className = 'repo-card p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 group cursor-pointer';
    div.style.animationDelay = `${index * 50}ms`;
    
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const languageColors = {
        JavaScript: '#f7df1e',
        TypeScript: '#3178c6',
        Python: '#3776ab',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Go: '#00add8',
        Rust: '#dea584',
        Ruby: '#701516',
        PHP: '#4F5D95',
        Swift: '#ffac45',
        Kotlin: '#A97BFF',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Vue: '#41b883',
        React: '#61dafb'
    };
    
    const langColor = languageColors[repo.language] || '#8b949e';
    
    // Calculate repo score (popularity metric)
    const score = repo.stargazers_count + (repo.forks_count * 2);
    let scoreBadge = '';
    if (score > 1000) {
        scoreBadge = '<span class="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">🔥 Hot</span>';
    } else if (score > 500) {
        scoreBadge = '<span class="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">⭐ Popular</span>';
    }
    
    div.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
                <i data-feather="book" class="w-5 h-5 text-primary-400"></i>
                <h4 class="font-semibold text-lg truncate max-w-[180px]" title="${repo.name}">${repo.name}</h4>
            </div>
            <div class="flex gap-2">
                ${scoreBadge}
                ${repo.archived ? '<span class="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">Archived</span>' : ''}
                ${repo.fork ? '<span class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">Fork</span>' : ''}
            </div>
        </div>
        
        <p class="text-gray-400 text-sm mb-4 line-clamp-2 h-10">${repo.description || 'No description available'}</p>
        
        <div class="flex items-center gap-4 text-sm flex-wrap">
            ${repo.language ? `
                <span class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${langColor}"></span>
                    <span class="text-gray-400">${repo.language}</span>
                </span>
            ` : ''}
            <span class="flex items-center gap-1.5 text-amber-400">
                <i data-feather="star" class="w-4 h-4 star-icon"></i>
                <span>${formatNumber(repo.stargazers_count)}</span>
            </span>
            ${repo.forks_count > 0 ? `
                <span class="flex items-center gap-1.5 text-gray-400">
                    <i data-feather="git-branch" class="w-4 h-4"></i>
                    <span>${formatNumber(repo.forks_count)}</span>
                </span>
            ` : ''}
            ${repo.open_issues_count > 0 ? `
                <span class="flex items-center gap-1.5 text-red-400" title="Open issues">
                    <i data-feather="alert-circle" class="w-4 h-4"></i>
                    <span>${formatNumber(repo.open_issues_count)}</span>
                </span>
            ` : ''}
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span class="text-xs text-gray-500">Updated ${updatedDate}</span>
            <a href="${repo.html_url}" target="_blank" onclick="event.stopPropagation()" class="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
                View <i data-feather="arrow-up-right" class="w-3 h-3"></i>
            </a>
        </div>
    `;
    
    return div;
}

// Add quick compare feature
function quickCompare() {
    if (!currentUser) return;
    const username = prompt('Enter username to compare with:');
    if (username) {
        window.location.href = `compare.html?user1=${currentUser.login}&user2=${username}`;
    }
}
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function updateGlobalStats() {
    document.getElementById('statUsers').textContent = formatNumber(globalStats.usersSearched);
    document.getElementById('statRepos').textContent = formatNumber(globalStats.reposFound);
    document.getElementById('statStars').textContent = formatNumber(globalStats.totalStars);
    document.getElementById('statLanguages').textContent = globalStats.languages.size;
}

function saveGlobalStats() {
    localStorage.setItem('usersSearched', globalStats.usersSearched);
    localStorage.setItem('reposFound', globalStats.reposFound);
    localStorage.setItem('totalStars', globalStats.totalStars);
    localStorage.setItem('languages', JSON.stringify([...globalStats.languages]));
}

function showLoading() {
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

function hideError() {
    errorState.classList.add('hidden');
    usernameInput.focus();
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username) {
        usernameInput.value = username;
        searchUser(username);
    } else {
        resultsSection.classList.add('hidden');
    }
});