/**
 * LocalStorageService - Handles all local storage operations
 * Encapsulates storage logic and provides domain-specific methods
 */
export class LocalStorageService {
    constructor() {
        this.LIKES_KEY = 'mockstagram_likes';
        this.DISLIKES_KEY = 'mockstagram_dislikes';
        this.THEME_KEY = 'mockstagram_theme';
        this.USER_PREFERENCES_KEY = 'mockstagram_user_preferences';
    }

    /**
     * Get likes for a specific post
     */
    getLikes(postId) {
        try {
            const likes = localStorage.getItem(`${this.LIKES_KEY}_${postId}`);
            return likes ? parseInt(likes, 10) : 0;
        } catch (error) {
            console.warn('Error reading likes from localStorage:', error);
            return 0;
        }
    }

    /**
     * Set likes for a specific post
     */
    setLikes(postId, count) {
        try {
            localStorage.setItem(`${this.LIKES_KEY}_${postId}`, count.toString());
            return true;
        } catch (error) {
            console.error('Error saving likes to localStorage:', error);
            return false;
        }
    }

    /**
     * Get dislikes for a specific post
     */
    getDislikes(postId) {
        try {
            const dislikes = localStorage.getItem(`${this.DISLIKES_KEY}_${postId}`);
            return dislikes ? parseInt(dislikes, 10) : 0;
        } catch (error) {
            console.warn('Error reading dislikes from localStorage:', error);
            return 0;
        }
    }

    /**
     * Set dislikes for a specific post
     */
    setDislikes(postId, count) {
        try {
            localStorage.setItem(`${this.DISLIKES_KEY}_${postId}`, count.toString());
            return true;
        } catch (error) {
            console.error('Error saving dislikes to localStorage:', error);
            return false;
        }
    }

    /**
     * Get user theme preference
     */
    getTheme() {
        try {
            return localStorage.getItem(this.THEME_KEY) || 'light';
        } catch (error) {
            console.warn('Error reading theme from localStorage:', error);
            return 'light';
        }
    }

    /**
     * Set user theme preference
     */
    setTheme(theme) {
        try {
            localStorage.setItem(this.THEME_KEY, theme);
            return true;
        } catch (error) {
            console.error('Error saving theme to localStorage:', error);
            return false;
        }
    }

    /**
     * Get user preferences
     */
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem(this.USER_PREFERENCES_KEY);
            return prefs ? JSON.parse(prefs) : {
                apiMode: 'custom',
                autoLoadImages: true,
                enableNotifications: false
            };
        } catch (error) {
            console.warn('Error reading user preferences:', error);
            return {
                apiMode: 'custom',
                autoLoadImages: true,
                enableNotifications: false
            };
        }
    }

    /**
     * Set user preferences
     */
    setUserPreferences(preferences) {
        try {
            localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error saving user preferences:', error);
            return false;
        }
    }

    /**
     * Clear all stored data for a fresh start
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('mockstagram_')) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        try {
            const stats = {
                totalKeys: 0,
                mockstagramKeys: 0,
                estimatedSize: 0
            };

            const keys = Object.keys(localStorage);
            stats.totalKeys = keys.length;

            keys.forEach(key => {
                if (key.startsWith('mockstagram_')) {
                    stats.mockstagramKeys++;
                    stats.estimatedSize += key.length + localStorage.getItem(key).length;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return { totalKeys: 0, mockstagramKeys: 0, estimatedSize: 0 };
        }
    }
}