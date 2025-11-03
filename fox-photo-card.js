import { LitElement, html, css } from 'lit';

/**
 * `fox-photo-card`
 * Instagram-style photo card with social interactions and lazy loading
 * 
 * @demo demo/index.html
 * @element fox-photo-card
 * @class FoxPhotoCard
 * @extends LitElement
 * @customElement
 * @fires like - Fired when user likes the photo
 * @fires dislike - Fired when user dislikes the photo  
 * @fires share - Fired when user shares the photo
 */
export class FoxPhotoCard extends LitElement {
    static styles = css`
        :host {
            display: block;
            background: white;
            border: 1px solid #dbdbdb;
            margin-bottom: 20px;
            width: 100%;
            max-width: 600px;
            min-height: 80vh;
            transition: all 0.2s ease;
        }

        :host(:last-child) {
            margin-bottom: 60px;
        }

        .card-header {
            display: flex;
            align-items: center;
            padding: 16px;
            gap: 12px;
        }

        .author-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e0e0e0;
        }

        .author-info {
            flex: 1;
        }

        .author-name {
            font-weight: 600;
            color: #262626;
            margin: 0;
            font-size: 14px;
        }

        .author-details {
            color: #8e8e8e;
            font-size: 12px;
            margin: 2px 0 0 0;
        }

        .photo-container {
            position: relative;
            width: 100%;
            height: 60vh;
            min-height: 400px;
            max-height: 600px;
            overflow: hidden;
            background: #f8f8f8;
        }

        .photo {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: opacity 0.3s ease;
        }

        .photo[data-src] {
            opacity: 0;
        }

        .photo:not([data-src]) {
            opacity: 1;
        }

        .photo-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 14px;
            z-index: 1;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .card-actions {
            padding: 12px 16px;
        }

        .action-buttons {
            display: flex;
            gap: 16px;
            margin-bottom: 8px;
        }

        .action-button {
            border: none;
            background: none;
            cursor: pointer;
            font-size: 20px;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease, transform 0.1s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .action-button:hover {
            background-color: #f5f5f5;
            transform: scale(1.1);
        }

        .action-button:active {
            transform: scale(0.95);
        }

        .like-button.liked {
            color: #e74c3c;
        }

        .dislike-button.disliked {
            color: #8e44ad;
        }

        .share-button {
            color: #3498db;
        }

        .engagement {
            color: #262626;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .photo-title {
            color: #262626;
            font-size: 14px;
            margin: 0;
            word-wrap: break-word;
        }

        .photo-date {
            color: #8e8e8e;
            font-size: 12px;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Dark mode styles */
        :host([data-theme="dark"]) {
            background: #000000;
            border-color: #262626;
            color: #ffffff;
        }

        :host([data-theme="dark"]) .photo-container {
            background: #262626;
        }

        :host([data-theme="dark"]) .author-name,
        :host([data-theme="dark"]) .engagement,
        :host([data-theme="dark"]) .photo-title {
            color: #ffffff;
        }

        :host([data-theme="dark"]) .author-details,
        :host([data-theme="dark"]) .photo-date {
            color: #a0a0a0;
        }

        :host([data-theme="dark"]) .action-button:hover {
            background-color: #404040;
        }

        :host([data-theme="dark"]) .photo-placeholder {
            background: linear-gradient(45deg, #404040 25%, transparent 25%, transparent 75%, #404040 75%, #404040),
                        linear-gradient(45deg, #404040 25%, transparent 25%, transparent 75%, #404040 75%, #404040);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            color: #888;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
            :host {
                min-height: 70vh;
                margin-bottom: 15px;
            }

            .photo-container {
                height: 50vh;
                min-height: 300px;
            }

            .card-header {
                padding: 12px;
            }

            .card-actions {
                padding: 8px 12px;
            }

            .action-buttons {
                gap: 12px;
            }

            .action-button {
                font-size: 18px;
            }

            .author-name {
                font-size: 13px;
            }

            .author-details {
                font-size: 11px;
            }
        }

        @media (max-width: 480px) {
            :host {
                min-height: 65vh;
            }

            .photo-container {
                height: 45vh;
                min-height: 250px;
            }
        }
    `;

    /**
     * Properties for HAX integration
     */
    static properties = {
        /**
         * Photo object containing all metadata for display
         * @type {Object}
         */
        photo: { type: Object }
    };

    constructor() {
        super();
        this.photo = {};
        this.imageLoaded = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateTheme();
        this.themeListener = () => this.updateTheme();
        document.addEventListener('themechange', this.themeListener);
        
        // Set up intersection observer for lazy loading
        this.setupIntersectionObserver();
    }



    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.themeListener) {
            document.removeEventListener('themechange', this.themeListener);
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }

    updateTheme() {
        const theme = document.body.getAttribute('data-theme');
        this.setAttribute('data-theme', theme);
    }

    handleLike() {
        // Just notify parent - let domain service handle the increment
        this.dispatchEvent(new CustomEvent('like', {
            bubbles: true,
            detail: { photoId: this.photo.id }
        }));
    }

    handleDislike() {
        // Just notify parent - let domain service handle the increment  
        this.dispatchEvent(new CustomEvent('dislike', {
            bubbles: true,
            detail: { photoId: this.photo.id }
        }));
    }

    handleShare() {
        this.dispatchEvent(new CustomEvent('share', {
            bubbles: true,
            detail: { photo: this.photo }
        }));
    }

    handleImageError(event) {
        console.error('Image failed to load:', event.target.src);
        const img = event.target;
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.textContent = 'Failed to load image';
        }
    }

    handleImageLoad(event) {
        console.log('Image loaded successfully:', event.target.src);
        const img = event.target;
        const placeholder = this.shadowRoot.querySelector('.photo-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        this.requestUpdate();
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        
        // Start observing when photo data is available
        if (changedProperties.has('photo') && this.photo && this.photo.source && !this.imageLoaded) {
            this.observeImageLoading();
        }
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.imageLoaded) {
                        console.log('Loading photo:', this.photo?.title, this.photo?.source);
                        this.imageLoaded = true;
                        this.requestUpdate();
                        this.intersectionObserver?.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before the image enters viewport
                threshold: 0.1
            }
        );
    }

    observeImageLoading() {
        if (this.intersectionObserver && this.shadowRoot) {
            // Observe the photo container for visibility
            const photoContainer = this.shadowRoot.querySelector('.photo-container');
            if (photoContainer) {
                this.intersectionObserver.observe(photoContainer);
            }
        }
    }

    render() {
        if (!this.photo || !this.photo.id) {
            return html`<div>Loading photo...</div>`;
        }

        const totalEngagement = (this.photo.likes || 0) + (this.photo.dislikes || 0);

        return html`
            <div class="card-header">
                <img 
                    class="author-avatar" 
                    src="${this.photo.author?.image || 'https://via.placeholder.com/40x40/ddd/999?text=?'}" 
                    alt="${this.photo.author?.name || 'Author'}"
                    @error=${(e) => e.target.src = 'https://via.placeholder.com/40x40/ddd/999?text=?'}
                />
                <div class="author-info">
                    <p class="author-name">${this.photo.author?.name || 'Unknown Author'}</p>
                    <p class="author-details">
                        ${this.photo.author?.channel || 'Photo Channel'} • 
                        User since ${this.photo.author?.userSince || 'Unknown'}
                    </p>
                </div>
            </div>

            <div class="photo-container">
                ${this.imageLoaded ? html`
                    <img 
                        class="photo" 
                        src="${this.photo.source || ''}"
                        alt="${this.photo.title}"
                        @error=${this.handleImageError}
                        @load=${this.handleImageLoad}
                    />
                ` : html`
                    <div class="photo-placeholder">
                        <div class="loading-spinner"></div>
                        <p>Loading image...</p>
                    </div>
                `}
            </div>

            <div class="card-actions">
                <div class="action-buttons">
                    <button 
                        class="action-button like-button ${this.photo.likes > 0 ? 'liked' : ''}"
                        @click=${this.handleLike}
                        title="Like this photo"
                    >
                        ❤️ <span>${this.photo.likes || 0}</span>
                    </button>
                    
                    <button 
                        class="action-button dislike-button ${this.photo.dislikes > 0 ? 'disliked' : ''}"
                        @click=${this.handleDislike}
                        title="Dislike this photo"
                    >
                        👎 <span>${this.photo.dislikes || 0}</span>
                    </button>
                    
                    <button 
                        class="action-button share-button"
                        @click=${this.handleShare}
                        title="Share this photo"
                    >
                        📤 Share
                    </button>
                </div>

                ${totalEngagement > 0 ? html`
                    <div class="engagement">
                        ${totalEngagement} ${totalEngagement === 1 ? 'interaction' : 'interactions'}
                    </div>
                ` : ''}

                <p class="photo-title">${this.photo.title}</p>
                <p class="photo-date">${this.photo.date}</p>
            </div>
        `;
    }
}

customElements.define('fox-photo-card', FoxPhotoCard);