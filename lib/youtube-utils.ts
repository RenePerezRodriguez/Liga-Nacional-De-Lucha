/**
 * YouTube Metadata Utilities
 * 
 * Fetches video metadata using YouTube oEmbed API and noembed service
 */

export interface YouTubeMetadata {
    title: string;
    thumbnail: string;
    duration?: string;
    author?: string;
    uploadDate?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYoutubeThumbnail(url: string): string | null {
    const id = extractYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

/**
 * Fetch video metadata from YouTube using noembed service
 * This is a free service that doesn't require API keys
 */
export async function fetchYoutubeMetadata(url: string): Promise<YouTubeMetadata | null> {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;

    try {
        // Use noembed.com - a free oEmbed proxy that returns more data
        const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch metadata');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            title: data.title || '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            author: data.author_name || '',
            uploadDate: data.upload_date || undefined
        };
    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);

        // Fallback: return just the thumbnail if we can't get other data
        return {
            title: '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
    }
}

/**
 * Format view count for display
 */
export function formatViews(views: number): string {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M vistas`;
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}k vistas`;
    }
    return `${views} vistas`;
}

/**
 * Format duration from seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format relative date (e.g., "Hace 2 semanas")
 */
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    }
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} año${years > 1 ? 's' : ''}`;
}
