/**
 * ELO Rating System for Wrestling Rankings
 * 
 * Similar to chess/UFC rankings:
 * - New wrestlers start at 1000 points
 * - Beating a higher-ranked opponent = more points gained
 * - Losing to a lower-ranked opponent = more points lost
 * - Title matches have higher K-factor (more impact)
 */

// K-factor determines volatility of rankings
const K_FACTOR_NORMAL = 32;      // Regular matches
const K_FACTOR_TITLE = 48;       // Championship matches
const K_FACTOR_MAIN_EVENT = 40;  // Main event matches

const DEFAULT_RATING = 1000;     // Starting rating for new wrestlers
const MIN_RATING = 100;          // Minimum possible rating

interface EloResult {
    winnerNewRating: number;
    loserNewRating: number;
    winnerChange: number;
    loserChange: number;
}

/**
 * Calculate expected score based on ratings
 * @param ratingA - Rating of player A
 * @param ratingB - Rating of player B
 * @returns Expected score for player A (0-1)
 */
function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param winnerRating - Current rating of winner
 * @param loserRating - Current rating of loser
 * @param options - Match options (isForTitle, isMainEvent)
 * @returns New ratings and point changes
 */
export function calculateEloChange(
    winnerRating: number = DEFAULT_RATING,
    loserRating: number = DEFAULT_RATING,
    options: {
        isForTitle?: boolean;
        isMainEvent?: boolean;
    } = {}
): EloResult {
    // Determine K-factor based on match importance
    let kFactor = K_FACTOR_NORMAL;
    if (options.isForTitle) {
        kFactor = K_FACTOR_TITLE;
    } else if (options.isMainEvent) {
        kFactor = K_FACTOR_MAIN_EVENT;
    }

    // Calculate expected scores
    const expectedWinner = expectedScore(winnerRating, loserRating);
    const expectedLoser = expectedScore(loserRating, winnerRating);

    // Winner gets 1 (full win), loser gets 0
    const winnerChange = Math.round(kFactor * (1 - expectedWinner));
    const loserChange = Math.round(kFactor * (0 - expectedLoser));

    // Calculate new ratings
    const winnerNewRating = Math.max(MIN_RATING, winnerRating + winnerChange);
    const loserNewRating = Math.max(MIN_RATING, loserRating + loserChange);

    return {
        winnerNewRating,
        loserNewRating,
        winnerChange,
        loserChange
    };
}

/**
 * Get ranking movement indicator based on point change
 */
export function getRankingMovement(pointChange: number): "up" | "down" | "same" {
    if (pointChange > 0) return "up";
    if (pointChange < 0) return "down";
    return "same";
}

/**
 * Get ranking tier based on rating
 */
export function getRankingTier(rating: number): {
    name: string;
    color: string;
    bgColor: string;
} {
    if (rating >= 1500) return { name: "CAMPEÓN", color: "text-lnl-gold", bgColor: "bg-lnl-gold/20" };
    if (rating >= 1300) return { name: "CONTENDIENTE", color: "text-purple-400", bgColor: "bg-purple-500/20" };
    if (rating >= 1100) return { name: "ESTABLECIDO", color: "text-blue-400", bgColor: "bg-blue-500/20" };
    if (rating >= 900) return { name: "PROMETEDOR", color: "text-green-400", bgColor: "bg-green-500/20" };
    return { name: "NOVATO", color: "text-gray-400", bgColor: "bg-gray-500/20" };
}

/**
 * Format point change for display
 */
export function formatPointChange(change: number): string {
    if (change > 0) return `+${change}`;
    return change.toString();
}

export const DEFAULT_ELO_RATING = DEFAULT_RATING;
