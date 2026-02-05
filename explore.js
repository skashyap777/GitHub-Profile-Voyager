const GITHUB_API_BASE = 'https://api.github.com';

const tabTrending = document.getElementById('tabTrending');
const tabAwesome = document.getElementById('tabAwesome');
const tabDevelopers = document.getElementById('tabDevelopers');
const exploreContent = document.getElementById('exploreContent');
const exploreLoading = document.getElementById('exploreLoading');
const trendingFilters = document.getElementById('trendingFilters');
const exploreLoadMore = document.getElementById('exploreLoadMore');

let currentTab = 'trending';
let currentLanguage = 'all';
let currentPage = 1;

const AWESOME_TOPICS = [
    'awesome', 'awesome-list', 'curated-list', 'awesome-python',
    'awesome-javascript', 'awesome-react', 'awesome-go', 'awesome-rust'
];

tabTrending.addEventListener('click', () => switchTab('trending'));
tabAwesome.addEventListener('click', () => switchTab('awesome'));
tabDevelopers.addEventListener('click', () => switchTab('developers'));

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-primary-600', 'text-white'));
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.add('bg-gray-800'));
        e.target.classList.remove('bg-gray-800');
        e.target.classList.add('active', 'bg-primary-600', 'text-white');
        currentLanguage = e.target.dataset.language;
        loadContent();
    });
});

function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;
    
    // Update UI
    [tabTrending, tabAwesome, tabDevelopers].forEach(t => {
        t.classList.remove('bg-primary-600', 'text-white');
        t.classList.add('bg-gray-800', 'text-gray-400');
    });
    
    const activeTab = tab === 'trending' ? tabTrending : tab === 'awesome' ? tabAwesome : tabDevelopers;
    activeTab.classList.remove('bg-gray-800', 'text-gray-400');
    activeTab.classList.add('bg-primary-600', 'text-white');
    
    trendingFilters.style.display = tab === 'trending' ? 'flex' : 'none';
    exploreLoadMore.classList.add('hidden');
    
    loadContent();
}

async function loadContent() {
    showLoading();
    exploreContent.innerHTML = '';
    
    try {
        let items = [];
        
        if (currentTab === 'trending') {
            items = await fetchTrendingRepos();
        } else if (currentTab === 'awesome') {
            items = await fetchAwesomeLists();
        } else {
            items = await fetchTopDevelopers();
        }
        
        renderItems(items);
        hideLoading();
        
        if (items.length === 30) {
            exploreLoadMore.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to load content:', error);
        hideLoading();
        exploreContent.innerHTML = '<p class="text-center text-gray-400 col-span-full">Failed to load content. Please try again.</p>';
    }
}

async function fetchTrendingRepos() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateString = date.toISOString().split('T')[0];
    
    let query = `created:>${dateString} sort:stars-desc`;
    if (currentLanguage !== 'all') {
        query += ` language:${currentLanguage}`;
    }
    
    const response = await fetch(`${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&per_page=30&page=${currentPage}`);
    const data = await response.json();
    return data.items || [];
}

async function fetchAwesomeLists() {
    const query = AWESOME_TOPICS.map(t => `topic:${t}`).join(' OR ');
    const response = await fetch(`${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}+sort:stars&per_page=30&page=${currentPage}`);
    const data = await response.json();
    return data.items || [];
}

async function fetchTopDevelopers() {
    // Search for developers with high follower count
    const response = await fetch(`${GITHUB_API_BASE}/search/users?q=followers:>1000+sort:followers&per_page=30&page=${currentPage}`);
    const data = await response.json();
    
    // Fetch detailed info for each user
    const users = await Promise.all(data.items.map(async (user) => {
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${user.login}`);
        return userResponse.json();
    }));
    
    return users;
}

function renderItems(items) {
    if (items.length === 0) {
        exploreContent.innerHTML = '<p class="text-center text-gray-400 col-span-full">No results found.</p>';
        return;
    }
    
    exploreContent.innerHTML = items.map((item, index) => {
        if (currentTab === 'developers') {
            return renderDeveloperCard(item, index);
        }
        return renderRepoCard(item, index);
    }).join('');
    
    feather.replace();
}

function renderRepoCard(repo, index) {
    const color = getLanguageColor(repo.language);
    const stars = formatNumber(repo.stargazers_count);
    const forks = formatNumber(repo.forks_count);
    
    return `
        <div class="repo-card p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 group" style="animation-delay: ${index * 50}ms">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <img src="${repo.owner.avatar_url}" alt="" class="w-10 h-10 rounded-lg">
                    <div>
                        <h4 class="font-semibold text-lg line-clamp-1">${repo.name}</h4>
                        <p class="text-sm text-gray-500">@${repo.owner.login}</p>
                    </div>
                </div>
                ${repo.fork ? '<span class="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">Fork</span>' : ''}
            </div>
            
            <p class="text-gray-400 text-sm mb-4 line-clamp-2 h-10">${repo.description || 'No description available'}</p>
            
            <div class="flex items-center gap-4 text-sm mb-4">
                ${repo.language ? `
                    <span class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
                        <span class="text-gray-400">${repo.language}</span>
                    </span>
                ` : ''}
                <span class="flex items-center gap-1.5 text-amber-400">
                    <i data-feather="star" class="w-4 h-4"></i>
                    <span>${stars}</span>
                </span>
                <span class="flex items-center gap-1.5 text-gray-400">
                    <i data-feather="git-branch" class="w-4 h-4"></i>
                    <span>${forks}</span>
                </span>
            </div>
            
            <a href="${repo.html_url}" target="_blank" class="block w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center text-sm font-medium transition-colors">
                View Repository
            </a>
        </div>
    `;
}

function renderDeveloperCard(user, index) {
    return `
        <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-secondary-500/30 transition-all duration-300 hover:-translate-y-1 group" style="animation-delay: ${index * 50}ms">
            <div class="flex items-center gap-4 mb-4">
                <img src="${user.avatar_url}" alt="" class="w-16 h-16 rounded-xl border-2 border-secondary-500/30">
                <div class="flex-1">
                    <h4 class="font-semibold text-lg">${user.name || user.login}</h4>
                    <p class="text-sm text-gray-500">@${user.login}</p>
                </div>
            </div>
            
            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${user.bio || 'No bio available'}</p>
            
            <div class="grid grid-cols-3 gap-2 mb-4 text-center">
                <div class="p-2 rounded-lg bg-gray-800">
                    <div class="text-lg font-bold text-primary-400">${formatNumber(user.public_repos)}</div>
                    <div class="text-xs text-gray-500">Repos</div>
                </div>
                <div class="p-2 rounded-lg bg-gray-800">
                    <div class="text-lg font-bold text-secondary-400">${formatNumber(user.followers)}</div>
                    <div class="text-xs text-gray-500">Followers</div>
                </div>
                <div class="p-2 rounded-lg bg-gray-800">
                    <div class="text-lg font-bold text-emerald-400">${formatNumber(user.following)}</div>
                    <div class="text-xs text-gray-500">Following</div>
                </div>
            </div>
            
            <a href="index.html?user=${user.login}" class="block w-full py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 rounded-lg text-center text-sm font-medium transition-all">
                View Profile
            </a>
        </div>
    `;
}

function getLanguageColor(lang) {
    const colors = {
        JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab',
        Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
        Go: '#00add8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
        Swift: '#ffac45', Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c'
    };
    return colors[lang] || '#8b949e';
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function showLoading() {
    exploreLoading.classList.remove('hidden');
}

function hideLoading() {
    exploreLoading.classList.add('hidden');
}

// Initialize
document.getElementById('loadMoreExplore').addEventListener('click', async () => {
    currentPage++;
    await loadContent();
});

loadContent();