class GithubNav extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                nav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    padding: 1rem 1.5rem;
                    transition: all 0.3s ease;
                }
                
                nav.scrolled {
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(51, 65, 85, 0.5);
                }
                
                .nav-container {
                    max-width: 1280px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: white;
                    font-weight: 700;
                    font-size: 1.25rem;
                }
                
                .logo-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    background: linear-gradient(135deg, #0ea5e9, #d946ef);
                    border-radius: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                
                .nav-link {
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .nav-link:hover {
                    color: white;
                }
                
                .theme-toggle {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 0.75rem;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(51, 65, 85, 0.5);
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .theme-toggle:hover {
                    background: rgba(51, 65, 85, 0.8);
                    color: white;
                }
                
                @media (max-width: 640px) {
                    .nav-links {
                        display: none;
                    }
                }
            </style>
            
            <nav id="navbar">
                <div class="nav-container">
                    <a href="/" class="logo">
                        <div class="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                        </div>
                        <span>GitHub Voyager</span>
                    </a>
                    
                    <div class="nav-links">
                        <a href="https://github.com/trending" target="_blank" class="nav-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            Trending
                        </a>
                        <a href="https://docs.github.com" target="_blank" class="nav-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Docs
                        </a>
                        <button class="theme-toggle" id="themeToggle" title="Toggle theme">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
        `;
        
        this.setupScrollEffect();
        this.setupThemeToggle();
    }
    
    setupScrollEffect() {
        const navbar = this.shadowRoot.getElementById('navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    setupThemeToggle() {
        const toggle = this.shadowRoot.getElementById('themeToggle');
        const html = document.documentElement;
        
        toggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                html.classList.add('light');
            } else {
                html.classList.remove('light');
                html.classList.add('dark');
            }
        });
    }
}

customElements.define('github-nav', GithubNav);