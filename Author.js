/**
 * Author Entity - Domain model for user/author information
 */
export class Author {
    constructor(name, image, userSince, channel) {
        this.name = name;
        this.image = image;
        this.userSince = userSince;
        this.channel = channel;
    }

    /**
     * Get author display name with fallback
     */
    getDisplayName() {
        return this.name || 'Unknown Author';
    }

    /**
     * Get author image with fallback
     */
    getImageUrl() {
        return this.image || 'https://via.placeholder.com/50x50/ddd/999?text=?';
    }

    /**
     * Get years since joining
     */
    getYearsSinceJoining() {
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(this.userSince);
    }

    /**
     * Validate author data
     */
    isValid() {
        return this.name && this.name.trim().length > 0;
    }
}