import { LitElement, html, css } from 'lit';
import './fox-photo-card.js';
import { SocialPostRepository } from './SocialPostRepository.js';
import { LocalStorageService } from './LocalStorageService.js';
import { SocialInteractionService } from './SocialInteractionService.js';

/**
 * `fox-gallery`
 * Instagram-style photo gallery with social interactions
 * 
 * @demo demo/index.html
 * @element fox-gallery
 * @class FoxGallery
 * @extends LitElement
 * @customElement
 */
export class FoxGallery extends LitElement {
    static styles = css`
        :host {
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .gallery-container {
            max-width: 935px;
            margin: 0 auto;
            padding: 20px;
        }

        .posts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 20px;
        }

        .loading {
            text-align: center;
            padding: 40px 20px;
            color: #8e8e8e;
            font-size: 16px;
        }

        .error {
            text-align: center;
            padding: 40px 20px;
            color: #ed4956;
            font-size: 16px;
            background: #ffeaa7;
            border-radius: 8px;
            margin: 20px;
        }

        .stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
            padding: 20px;
            background: var(--bg-color, #ffffff);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-color, #262626);
        }

        .stat-label {
            font-size: 14px;
            color: var(--secondary-text, #8e8e8e);
            margin-top: 4px;
        }

        .filter-tabs {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        .filter-tab {
            padding: 10px 20px;
            border: 1px solid #dbdbdb;
            background: var(--bg-color, #ffffff);
            color: var(--text-color, #262626);
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        }

        .filter-tab:hover {
            background: #f8f9fa;
        }

        .filter-tab.active {
            background: #ff6b35;
            color: white;
            border-color: #ff6b35;
        }

        @media (max-width: 768px) {
            .gallery-container {
                padding: 10px;
            }
            
            .posts-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .stats {
                flex-direction: column;
                gap: 10px;
            }
            
            .filter-tabs {
                flex-wrap: wrap;
                gap: 5px;
            }
        }

        /* Theme support */
        :host([theme="dark"]) .stats,
        :host([theme="dark"]) .filter-tab {
            background: #1e1e1e;
            border-color: #333;
        }

        :host([theme="dark"]) .stat-number {
            color: #ffffff;
        }

        :host([theme="dark"]) .filter-tab:hover {
            background: #333;
        }
    `;

    static properties = {
        posts: { type: Array },
        loading: { type: Boolean },
        error: { type: String },
        activeFilter: { type: String },
        totalLikes: { type: Number },
        totalDislikes: { type: Number },
        theme: { type: String, reflect: true }
    };

    constructor() {
        super();
        this.posts = [];
        this.loading = true;
        this.error = null;
        this.activeFilter = 'all';
        this.totalLikes = 0;
        this.totalDislikes = 0;
        this.theme = 'light';
        
        // Initialize services with DDD architecture
        this.localStorageService = new LocalStorageService();
        this.socialInteractionService = new SocialInteractionService(this.localStorageService);
        this.socialPostRepository = new SocialPostRepository();
        
        // Bind methods
        this.handleLike = this.handleLike.bind(this);
        this.handleDislike = this.handleDislike.bind(this);
        this.handleShare = this.handleShare.bind(this);
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadPosts();
        this.setupThemeObserver();
    }

    setupThemeObserver() {
        // Watch for theme changes on document body
        const observer = new MutationObserver(() => {
            const bodyTheme = document.body.getAttribute('data-theme');
            if (bodyTheme && bodyTheme !== this.theme) {
                this.theme = bodyTheme;
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // Set initial theme
        const initialTheme = document.body.getAttribute('data-theme') || 'light';
        this.theme = initialTheme;
    }

    async loadPosts() {
        try {
            this.loading = true;
            this.error = null;
            
            const posts = await this.socialPostRepository.getAllPosts();
            
            // Load saved interactions from localStorage
            const savedInteractions = this.localStorageService.getItem('social_interactions') || {};
            
            // Apply saved interactions to posts
            this.posts = posts.map(post => {
                const postId = post.id.toString();
                const savedData = savedInteractions[postId];
                
                if (savedData) {
                    return {
                        ...post,
                        likes: savedData.likes || post.likes,
                        dislikes: savedData.dislikes || post.dislikes,
                        userHasLiked: savedData.userHasLiked || false,
                        userHasDisliked: savedData.userHasDisliked || false
                    };
                }
                
                return {
                    ...post,
                    userHasLiked: false,
                    userHasDisliked: false
                };
            });
            
            this.calculateTotalStats();
            this.loading = false;
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.error = `Failed to load posts: ${error.message}`;
            this.loading = false;
        }
    }

    calculateTotalStats() {
        this.totalLikes = this.posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        this.totalDislikes = this.posts.reduce((sum, post) => sum + (post.dislikes || 0), 0);
    }

    handleLike(event) {
        const { postId } = event.detail;
        const result = this.socialInteractionService.handleLike(postId, this.posts);
        
        if (result.success) {
            // Create new array to trigger Lit reactivity
            this.posts = [...result.updatedPosts];
            this.calculateTotalStats();
            
            // Save to localStorage
            this.saveInteractionState();
        }
    }

    handleDislike(event) {
        const { postId } = event.detail;
        const result = this.socialInteractionService.handleDislike(postId, this.posts);
        
        if (result.success) {
            // Create new array to trigger Lit reactivity  
            this.posts = [...result.updatedPosts];
            this.calculateTotalStats();
            
            // Save to localStorage
            this.saveInteractionState();
        }
    }

    handleShare(event) {
        const { postId, post } = event.detail;
        this.socialInteractionService.handleShare(postId, post);
    }

    saveInteractionState() {
        const interactions = {};
        
        this.posts.forEach(post => {
            interactions[post.id.toString()] = {
                likes: post.likes,
                dislikes: post.dislikes,
                userHasLiked: post.userHasLiked,
                userHasDisliked: post.userHasDisliked
            };
        });
        
        this.localStorageService.setItem('social_interactions', interactions);
    }

    setFilter(filter) {
        this.activeFilter = filter;
    }

    get filteredPosts() {
        if (this.activeFilter === 'all') {
            return this.posts;
        }
        
        if (this.activeFilter === 'liked') {
            return this.posts.filter(post => post.userHasLiked);
        }
        
        if (this.activeFilter === 'popular') {
            return this.posts.filter(post => post.likes > 50);
        }
        
        return this.posts;
    }

    render() {
        if (this.loading) {
            return html`
                <div class="gallery-container">
                    <div class="loading">Loading amazing photos...</div>
                </div>
            `;
        }

        if (this.error) {
            return html`
                <div class="gallery-container">
                    <div class="error">${this.error}</div>
                </div>
            `;
        }

        return html`
            <div class="gallery-container">
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">${this.posts.length}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.totalLikes}</div>
                        <div class="stat-label">Total Likes</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.totalDislikes}</div>
                        <div class="stat-label">Total Dislikes</div>
                    </div>
                </div>

                <div class="filter-tabs">
                    <button 
                        class="filter-tab ${this.activeFilter === 'all' ? 'active' : ''}"
                        @click=${() => this.setFilter('all')}
                    >
                        All Posts
                    </button>
                    <button 
                        class="filter-tab ${this.activeFilter === 'popular' ? 'active' : ''}"
                        @click=${() => this.setFilter('popular')}
                    >
                        Popular
                    </button>
                    <button 
                        class="filter-tab ${this.activeFilter === 'liked' ? 'active' : ''}"
                        @click=${() => this.setFilter('liked')}
                    >
                        Liked by You
                    </button>
                </div>

                <div class="posts-grid">
                    ${this.filteredPosts.map(post => html`
                        <fox-photo-card
                            .post=${post}
                            @like=${this.handleLike}
                            @dislike=${this.handleDislike}
                            @share=${this.handleShare}
                        ></fox-photo-card>
                    `)}
                </div>

                ${this.filteredPosts.length === 0 ? html`
                    <div class="loading">
                        No posts match the current filter.
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Register the custom element
customElements.define('fox-gallery', FoxGallery);