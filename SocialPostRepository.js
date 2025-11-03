import { SocialPost } from '../entities/SocialPost.js';

/**
 * SocialPostRepository - Handles data access for social posts
 * Implements Repository pattern for data abstraction
 */
export class SocialPostRepository {
    constructor() {
        this.dataSource = './data/social-posts.json';
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Fetch all social posts from data source
     */
    async fetchAll() {
        try {
            // Check cache first
            if (this.isCacheValid()) {
                console.log('Returning cached social posts');
                return this.cache;
            }

            console.log('Fetching social posts from:', this.dataSource);
            const response = await fetch(this.dataSource);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.photos || !Array.isArray(data.photos)) {
                throw new Error('Invalid data format: photos array not found');
            }

            // Convert raw data to domain entities
            const posts = data.photos.map(photoData => 
                new SocialPost(
                    photoData.id,
                    photoData.source,
                    photoData.thumbnail,
                    photoData.title,
                    photoData.date,
                    photoData.author,
                    photoData.likes || 0,
                    photoData.dislikes || 0
                )
            );

            // Update cache
            this.cache = posts;
            this.cacheTimestamp = Date.now();

            return posts;
        } catch (error) {
            console.error('Error in SocialPostRepository.fetchAll:', error);
            throw new Error(`Failed to fetch social posts: ${error.message}`);
        }
    }

    /**
     * Fetch random fox posts from external API
     */
    async fetchRandomFoxPosts(count = 10) {
        try {
            const posts = [];
            
            for (let i = 0; i < count; i++) {
                const response = await fetch('https://randomfox.ca/floof/');
                
                if (!response.ok) {
                    console.warn(`Failed to fetch fox ${i + 1}, skipping...`);
                    continue;
                }

                const foxData = await response.json();
                
                // Create social post from fox data
                const post = new SocialPost(
                    `fox-${Date.now()}-${i}`,
                    foxData.image,
                    foxData.image,
                    `Random Fox Photo #${i + 1} 🦊`,
                    new Date().toISOString().split('T')[0],
                    {
                        name: 'RandomFox API',
                        image: 'https://randomfox.ca/images/randomfox-logo.png',
                        userSince: '2020',
                        channel: 'Fox Photos'
                    }
                );

                posts.push(post);
            }

            return posts;
        } catch (error) {
            console.error('Error in SocialPostRepository.fetchRandomFoxPosts:', error);
            throw new Error(`Failed to fetch random fox posts: ${error.message}`);
        }
    }

    /**
     * Get a single post by ID
     */
    async findById(id) {
        const posts = await this.fetchAll();
        return posts.find(post => post.id === id);
    }

    /**
     * Get posts by author
     */
    async findByAuthor(authorName) {
        const posts = await this.fetchAll();
        return posts.filter(post => 
            post.author.name.toLowerCase().includes(authorName.toLowerCase())
        );
    }

    /**
     * Get posts by channel
     */
    async findByChannel(channelName) {
        const posts = await this.fetchAll();
        return posts.filter(post => 
            post.author.channel.toLowerCase().includes(channelName.toLowerCase())
        );
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        return this.cache && 
               this.cacheTimestamp && 
               (Date.now() - this.cacheTimestamp) < this.cacheExpiry;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }
}