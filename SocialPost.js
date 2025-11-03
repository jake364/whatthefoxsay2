import { Author } from './Author.js';

/**
 * SocialPost Entity - Domain model for social media posts
 */
export class SocialPost {
    constructor(id, source, thumbnail, title, date, authorData, likes = 0, dislikes = 0) {
        this.id = id;
        this.source = source;
        this.thumbnail = thumbnail;
        this.title = title;
        this.date = date;
        this.author = new Author(
            authorData.name,
            authorData.image,
            authorData.userSince,
            authorData.channel
        );
        this.likes = likes;
        this.dislikes = dislikes;
        this.createdAt = new Date();
    }

    /**
     * Get total engagement (likes + dislikes)
     */
    getTotalEngagement() {
        return this.likes + this.dislikes;
    }

    /**
     * Get engagement ratio (likes / total engagement)
     */
    getEngagementRatio() {
        const total = this.getTotalEngagement();
        return total > 0 ? this.likes / total : 0;
    }

    /**
     * Add a like to this post
     */
    addLike() {
        this.likes++;
        return this.likes;
    }

    /**
     * Add a dislike to this post
     */
    addDislike() {
        this.dislikes++;
        return this.dislikes;
    }

    /**
     * Get formatted date string
     */
    getFormattedDate() {
        return new Date(this.date).toLocaleDateString();
    }

    /**
     * Get time since posted
     */
    getTimeSincePosted() {
        const now = new Date();
        const postDate = new Date(this.date);
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    /**
     * Check if post is valid
     */
    isValid() {
        return this.id && 
               this.source && 
               this.title && 
               this.date && 
               this.author.isValid();
    }

    /**
     * Get shareable content
     */
    getShareableContent() {
        return {
            title: this.title,
            text: `Check out this post by ${this.author.getDisplayName()}!`,
            url: window.location.href + '#' + this.id
        };
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            source: this.source,
            thumbnail: this.thumbnail,
            title: this.title,
            date: this.date,
            author: {
                name: this.author.name,
                image: this.author.image,
                userSince: this.author.userSince,
                channel: this.author.channel
            },
            likes: this.likes,
            dislikes: this.dislikes
        };
    }
}