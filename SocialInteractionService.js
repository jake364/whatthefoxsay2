/**
 * SocialInteractionService - Handles social interactions like likes, dislikes, shares
 * Implements business logic for social features
 */
export class SocialInteractionService {
    constructor(localStorageService) {
        this.localStorageService = localStorageService;
    }

    /**
     * Handle like interaction for a post
     */
    likePost(post) {
        try {
            const newLikeCount = post.addLike();
            const saved = this.localStorageService.setLikes(post.id, newLikeCount);
            
            if (saved) {
                console.log(`Post ${post.id} liked. New count: ${newLikeCount}`);
                return {
                    success: true,
                    newCount: newLikeCount,
                    message: 'Post liked successfully!'
                };
            } else {
                // Rollback if storage failed
                post.likes--;
                return {
                    success: false,
                    newCount: post.likes,
                    message: 'Failed to save like preference'
                };
            }
        } catch (error) {
            console.error('Error in likePost:', error);
            return {
                success: false,
                newCount: post.likes,
                message: 'Error processing like'
            };
        }
    }

    /**
     * Handle dislike interaction for a post
     */
    dislikePost(post) {
        try {
            const newDislikeCount = post.addDislike();
            const saved = this.localStorageService.setDislikes(post.id, newDislikeCount);
            
            if (saved) {
                console.log(`Post ${post.id} disliked. New count: ${newDislikeCount}`);
                return {
                    success: true,
                    newCount: newDislikeCount,
                    message: 'Post disliked successfully!'
                };
            } else {
                // Rollback if storage failed
                post.dislikes--;
                return {
                    success: false,
                    newCount: post.dislikes,
                    message: 'Failed to save dislike preference'
                };
            }
        } catch (error) {
            console.error('Error in dislikePost:', error);
            return {
                success: false,
                newCount: post.dislikes,
                message: 'Error processing dislike'
            };
        }
    }

    /**
     * Handle share interaction for a post
     */
    async sharePost(post) {
        try {
            const shareData = post.getShareableContent();

            // Try native Web Share API first
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return {
                    success: true,
                    method: 'native',
                    message: 'Post shared successfully!'
                };
            }
            
            // Fallback to clipboard
            const shareUrl = shareData.url;
            const shareText = `${shareData.title} - ${shareData.text} ${shareUrl}`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareText);
                return {
                    success: true,
                    method: 'clipboard',
                    message: 'Share link copied to clipboard!'
                };
            }

            // Last resort - create temporary text area
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                return {
                    success: true,
                    method: 'execCommand',
                    message: 'Share link copied to clipboard!'
                };
            } else {
                throw new Error('All share methods failed');
            }

        } catch (error) {
            console.error('Error in sharePost:', error);
            return {
                success: false,
                method: 'none',
                message: 'Unable to share at this time'
            };
        }
    }

    /**
     * Load interaction data from storage for a post
     */
    loadPostInteractions(post) {
        const likes = this.localStorageService.getLikes(post.id);
        const dislikes = this.localStorageService.getDislikes(post.id);
        
        post.likes = likes;
        post.dislikes = dislikes;
        
        return {
            likes,
            dislikes,
            totalEngagement: post.getTotalEngagement()
        };
    }

    /**
     * Get engagement statistics across all posts
     */
    getEngagementStats(posts) {
        const stats = {
            totalLikes: 0,
            totalDislikes: 0,
            totalEngagement: 0,
            averageEngagement: 0,
            mostLikedPost: null,
            mostEngagedPost: null
        };

        if (!posts || posts.length === 0) {
            return stats;
        }

        let maxLikes = 0;
        let maxEngagement = 0;

        posts.forEach(post => {
            stats.totalLikes += post.likes;
            stats.totalDislikes += post.dislikes;
            
            const engagement = post.getTotalEngagement();
            stats.totalEngagement += engagement;

            if (post.likes > maxLikes) {
                maxLikes = post.likes;
                stats.mostLikedPost = post;
            }

            if (engagement > maxEngagement) {
                maxEngagement = engagement;
                stats.mostEngagedPost = post;
            }
        });

        stats.averageEngagement = stats.totalEngagement / posts.length;

        return stats;
    }
}