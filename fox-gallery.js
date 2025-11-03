import { LitElement, html, css } from 'lit';
import './fox-photo-card.js';
import { SocialPostRepository } from './domain/repositories/SocialPostRepository.js';
import { LocalStorageService } from './domain/services/LocalStorageService.js';
import { SocialInteractionService } from './domain/services/SocialInteractionService.js';

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
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            align-items: center;
            flex-wrap: wrap;
        }

        .api-toggle {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .api-toggle label {
            font-weight: 500;
        }

        .api-toggle input[type="radio"] {
            margin-right: 5px;
        }

        .load-button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .load-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .load-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .gallery {
            display: flex;
            flex-direction: column;
            gap: 0;
            margin-top: 20px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: var(--text-secondary, #666);
        }

        .error {
            text-align: center;
            padding: 40px;
            color: #e74c3c;
            background: #ffeaea;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }

        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ff6b35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Dark mode styles */
        :host([data-theme="dark"]) .error {
            background: #2a1f1f;
            color: #ff6b6b;
        }

        :host([data-theme="dark"]) .loading-spinner {
            border: 3px solid #444;
            border-top: 3px solid #ff6b35;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            :host {
                padding: 10px;
            }
            
            .gallery {
                max-width: 100%;
            }
            
            .controls {
                flex-direction: column;
                align-items: stretch;
                margin-bottom: 15px;
            }
            
            .api-toggle {
                justify-content: center;
            }
        }
    `;

    /**
     * Properties for HAX integration
     */
    static properties = {
        /**
         * Array of photo objects to display in the gallery
         * @type {Array}
         */
        foxPhotos: { type: Array },
        /**
         * Loading state indicator for async operations
         * @type {Boolean}
         */
        loading: { type: Boolean },
        /**
         * Error message to display if operations fail
         * @type {String}
         */
        error: { type: String },
        /**
         * API mode: 'random' for fox API or 'custom' for social feed
         * @type {String}
         */
        apiMode: { type: String }
    };

    constructor() {
        super();
        this.foxPhotos = [];
        this.loading = false;
        this.error = '';
        this.apiMode = 'random'; // 'random' or 'custom'
        
        // Initialize domain services (DDD pattern)
        this.localStorageService = new LocalStorageService();
        this.socialPostRepository = new SocialPostRepository();
        this.socialInteractionService = new SocialInteractionService(this.localStorageService);
        
        // Load user preferences
        this.userPreferences = this.localStorageService.getUserPreferences();
        this.apiMode = this.userPreferences.apiMode || 'custom';
    }

    connectedCallback() {
        super.connectedCallback();
        // Update theme when connected
        this.updateTheme();
        // Listen for theme changes
        this.themeListener = () => this.updateTheme();
        document.addEventListener('themechange', this.themeListener);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.themeListener) {
            document.removeEventListener('themechange', this.themeListener);
        }
    }

    updateTheme() {
        const theme = document.body.getAttribute('data-theme');
        this.setAttribute('data-theme', theme);
    }



    async loadRandomFoxPhotos(count = 10) {
        this.loading = true;
        this.error = '';
        this.foxPhotos = [];

        try {
            console.log('Loading random fox photos using DDD repository...');
            
            // Use repository pattern for data access (DDD)
            const foxPosts = await this.socialPostRepository.fetchRandomFoxPosts(count);
            
            // Load interaction data for each post using domain service
            foxPosts.forEach(post => {
                this.socialInteractionService.loadPostInteractions(post);
            });
            
            this.foxPhotos = foxPosts;
            console.log('Final foxPhotos array (DDD):', this.foxPhotos);

        } catch (err) {
            this.error = `Failed to load fox photos: ${err.message}`;
            console.error('Error loading fox photos:', err);
        } finally {
            this.loading = false;
        }
    }

    async loadSocialFeed() {
        this.loading = true;
        this.error = '';
        this.foxPhotos = [];

        try {
            console.log('Loading social feed posts using DDD repository...');
            
            // Use repository pattern for data access (DDD)
            const socialPosts = await this.socialPostRepository.fetchAll();
            
            // Load interaction data for each post using domain service
            socialPosts.forEach(post => {
                this.socialInteractionService.loadPostInteractions(post);
            });
            
            this.foxPhotos = socialPosts;
            console.log('Final social posts array (DDD):', this.foxPhotos);
            
        } catch (err) {
            this.error = `Error loading social feed: ${err.message}`;
            console.error('Detailed error:', err);
        } finally {
            this.loading = false;
        }
    }

    handleApiModeChange(event) {
        this.apiMode = event.target.value;
        this.foxPhotos = []; // Clear existing photos when switching modes
    }

    async handleLoadPhotos() {
        console.log('handleLoadPhotos called, apiMode:', this.apiMode);
        
        if (this.apiMode === 'random') {
            await this.loadRandomFoxPhotos(10);
        } else {
            await this.loadSocialFeed();
        }
        
        console.log('Load complete, foxPhotos.length:', this.foxPhotos.length);
    }

    getLikesFromStorage(photoId) {
        const likes = JSON.parse(localStorage.getItem('fox-gallery-likes') || '{}');
        return likes[photoId] || 0;
    }

    getDislikesFromStorage(photoId) {
        const dislikes = JSON.parse(localStorage.getItem('fox-gallery-dislikes') || '{}');
        return dislikes[photoId] || 0;
    }

    updateLikesInStorage(photoId, likes) {
        const allLikes = JSON.parse(localStorage.getItem('fox-gallery-likes') || '{}');
        allLikes[photoId] = likes;
        localStorage.setItem('fox-gallery-likes', JSON.stringify(allLikes));
    }

    updateDislikesInStorage(photoId, dislikes) {
        const allDislikes = JSON.parse(localStorage.getItem('fox-gallery-dislikes') || '{}');
        allDislikes[photoId] = dislikes;
        localStorage.setItem('fox-gallery-dislikes', JSON.stringify(allDislikes));
    }

    handleLike(photoId) {
        const postIndex = this.foxPhotos.findIndex(p => p.id === photoId);
        if (postIndex !== -1) {
            const post = this.foxPhotos[postIndex];
            // Use domain service for social interactions (DDD)
            const result = this.socialInteractionService.likePost(post);
            
            if (result.success) {
                console.log(result.message);
                // Force Lit to detect the change by creating new array with updated object
                this.foxPhotos = [
                    ...this.foxPhotos.slice(0, postIndex),
                    { ...post }, // Create new object reference
                    ...this.foxPhotos.slice(postIndex + 1)
                ];
            } else {
                console.error('Like failed:', result.message);
            }
        }
    }

    handleDislike(photoId) {
        const postIndex = this.foxPhotos.findIndex(p => p.id === photoId);
        if (postIndex !== -1) {
            const post = this.foxPhotos[postIndex];
            // Use domain service for social interactions (DDD)
            const result = this.socialInteractionService.dislikePost(post);
            
            if (result.success) {
                console.log(result.message);
                // Force Lit to detect the change by creating new array with updated object
                this.foxPhotos = [
                    ...this.foxPhotos.slice(0, postIndex),
                    { ...post }, // Create new object reference
                    ...this.foxPhotos.slice(postIndex + 1)
                ];
            } else {
                console.error('Dislike failed:', result.message);
            }
        }
    }

    async handleShare(photo) {
        // Use domain service for sharing (DDD)
        const result = await this.socialInteractionService.sharePost(photo);
        
        if (result.success) {
            console.log(`Share successful via ${result.method}: ${result.message}`);
            // Show user feedback
            this.showShareFeedback(result.message);
        } else {
            console.error('Share failed:', result.message);
            this.error = result.message;
        }
    }

    showShareFeedback(message) {
        // Simple feedback - could be enhanced with toast notifications
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #4CAF50; color: white; padding: 12px 20px;
            border-radius: 4px; z-index: 1000; font-size: 14px;
        `;
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 3000);
    }



    render() {
        return html`
            <div class="controls">
                <div class="api-toggle">
                    <label>Data Source:</label>
                    <label>
                        <input 
                            type="radio" 
                            name="api-mode" 
                            value="random" 
                            .checked=${this.apiMode === 'random'}
                            @change=${this.handleApiModeChange}
                        />
                        Random Feed 🦊
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="api-mode" 
                            value="custom" 
                            .checked=${this.apiMode === 'custom'}
                            @change=${this.handleApiModeChange}
                        />
                        Social Feed 📱
                    </label>
                </div>
                
                <button 
                    class="load-button"
                    @click=${this.handleLoadPhotos}
                    ?disabled=${this.loading}
                >
                    ${this.loading ? 'Loading...' : 'Load Photos'}
                </button>
            </div>

            ${this.error ? html`
                <div class="error">${this.error}</div>
            ` : ''}

            ${this.loading ? html`
                <div class="loading">🦊 Loading fox photos...</div>
            ` : ''}

            ${this.foxPhotos.length > 0 ? html`
                <div class="gallery">
                    ${this.foxPhotos.map(photo => html`
                        <fox-photo-card 
                            .photo=${photo}
                            @like=${() => this.handleLike(photo.id)}
                            @dislike=${() => this.handleDislike(photo.id)}
                            @share=${() => this.handleShare(photo)}
                        ></fox-photo-card>
                    `)}

                </div>
            ` : ''}
        `;
    }
}

customElements.define('fox-gallery', FoxGallery);