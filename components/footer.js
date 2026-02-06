class GithubFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-top: auto;
                }
                
                footer {
                    padding: 3rem 1.5rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.5);
                    background: rgba(15, 23, 42, 0.5);
                }
                
                .footer-container {
                    max-width: 1280px;
                    margin: 0 auto;
                }
                
                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .footer-section h4 {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                }
                
                .footer-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .footer-link {
                    color: #64748b;
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .footer-link:hover {
                    color: #0ea5e9;
                }
                
                .footer-bottom {
                    padding-top: 2rem;
                    border-top: 1px solid rgba(51, 65, 85, 0.3);
                    display: flex;
                    flex-direction: column;
                    sm:flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: white;
                    font-weight: 600;
                }
                
                .footer-brand-icon {
                    width: 2rem;
                    height: 2rem;
                    background: linear-gradient(135deg, #0ea5e9, #d946ef);
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .footer-copyright {
                    color: #64748b;
                    font-size: 0.875rem;
                }
                
                .footer-social {
                    display: flex;
                    gap: 1rem;
                }
                
                .social-link {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 0.75rem;
                    background: rgba(30, 41, 59, 0.8);
                    border: 1px solid rgba(51, 65, 85, 0.5);
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                
                .social-link:hover {
                    background: rgba(51, 65, 85, 0.8);
                    color: white;
                    transform: translateY(-2px);
                }
                
                @media (min-width: 640px) {
                    .footer-bottom {
                        flex-direction: row;
                    }
                }
            </style>
            
            <footer>
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-section">
                            <h4>Product</h4>
                            <div class="footer-links">
                                <a href="#" class="footer-link">Features</a>
                                <a href="#" class="footer-link">Security</a>
                                <a href="#" class="footer-link">Team</a>
                                <a href="#" class="footer-link">Enterprise</a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Platform</h4>
                            <div class="footer-links">
                                <a href="https://developer.github.com" target="_blank" class="footer-link">Developer API</a>
                                <a href="https://partner.github.com" target="_blank" class="footer-link">Partners</a>
                                <a href="https://electronjs.org" target="_blank" class="footer-link">Electron</a>
                                <a href="https://desktop.github.com" target="_blank" class="footer-link">GitHub Desktop</a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Support</h4>
                            <div class="footer-links">
                                <a href="https://docs.github.com" target="_blank" class="footer-link">Documentation</a>
                                <a href="https://community.github.com" target="_blank" class="footer-link">Community Forum</a>
                                <a href="https://services.github.com" target="_blank" class="footer-link">Professional Services</a>
                                <a href="https://status.github.com" target="_blank" class="footer-link">Status</a>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Company</h4>
                            <div class="footer-links">
                                <a href="https://github.com/about" target="_blank" class="footer-link">About</a>
                                <a href="https://github.blog" target="_blank" class="footer-link">Blog</a>
                                <a href="https://github.com/about/careers" target="_blank" class="footer-link">Careers</a>
                                <a href="https://github.com/about/press" target="_blank" class="footer-link">Press</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-brand">
                            <div class="footer-brand-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </div>
                            <span>@Samudra Kashyap Developer</span>
                        </div>
                        
                        <div class="footer-social">
                            <a href="https://www.instagram.com/samudra666_?igsh=MTd6eHcwcDBlNjM4OA==" target="_blank" class="social-link" title="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="https://github.com/skashyap777" target="_blank" class="social-link" title="GitHub">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/samudra-kashyap-bb3920234" target="_blank" class="social-link" title="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect x="2" y="9" width="4" height="12"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('github-footer', GithubFooter);