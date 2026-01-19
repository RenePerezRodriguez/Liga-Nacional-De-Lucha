/**
 * Wrestling Statistics Utilities
 * 
 * Handles W-L records, match history, head-to-head, and advanced stats
 */

import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

// Match result stored in 'match_history' collection
export interface MatchRecord {
    id?: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    matchId: string;
    wrestler1Id: string;
    wrestler1Name: string;
    wrestler2Id: string;
    wrestler2Name: string;
    winnerId: string;
    winnerName: string;
    loserId: string;
    loserName: string;
    result: string; // "Pinfall", "Submission", etc.
    isForTitle: boolean;
    championshipId?: string;
    championshipName?: string;
    isMainEvent: boolean;
    // Tag team match support
    isTagMatch?: boolean;
    tagTeam1Id?: string;
    tagTeam2Id?: string;
    createdAt: Timestamp;
}

// Wrestler statistics
export interface WrestlerStats {
    wins: number;
    losses: number;
    draws: number;
    winsByPinfall: number;
    winsBySubmission: number;
    winsByKO: number;
    winsByDQ: number;
    winsOther: number;
    currentStreak: number; // Positive = winning, negative = losing
    bestStreak: number;
    titleDefenses: number;
    titlesWon: number;
    mainEventWins: number;
    lastMatchDate?: string;
    lastOpponent?: string;
    lastResult?: "win" | "loss" | "draw";
}

// Default stats for new wrestlers
export const DEFAULT_WRESTLER_STATS: WrestlerStats = {
    wins: 0,
    losses: 0,
    draws: 0,
    winsByPinfall: 0,
    winsBySubmission: 0,
    winsByKO: 0,
    winsByDQ: 0,
    winsOther: 0,
    currentStreak: 0,
    bestStreak: 0,
    titleDefenses: 0,
    titlesWon: 0,
    mainEventWins: 0
};

/**
 * Categorize win type based on result string
 */
export function categorizeWinType(result: string): keyof Pick<WrestlerStats, 'winsByPinfall' | 'winsBySubmission' | 'winsByKO' | 'winsByDQ' | 'winsOther'> {
    const normalized = result.toLowerCase();
    if (normalized.includes("pinfall") || normalized.includes("pin")) return "winsByPinfall";
    if (normalized.includes("submission") || normalized.includes("rendición")) return "winsBySubmission";
    if (normalized.includes("knockout") || normalized.includes("ko")) return "winsByKO";
    if (normalized.includes("dq") || normalized.includes("descalificación")) return "winsByDQ";
    return "winsOther";
}

/**
 * Calculate updated stats after a match
 */
export function updateStatsAfterMatch(
    currentStats: WrestlerStats,
    isWinner: boolean,
    result: string,
    isMainEvent: boolean,
    isForTitle: boolean,
    isNewChampion: boolean,
    opponentName: string,
    matchDate: string
): WrestlerStats {
    const updated = { ...currentStats };

    if (isWinner) {
        updated.wins += 1;
        updated.currentStreak = updated.currentStreak >= 0 ? updated.currentStreak + 1 : 1;
        updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak);
        updated.lastResult = "win";

        // Categorize win type
        const winType = categorizeWinType(result);
        updated[winType] += 1;

        if (isMainEvent) updated.mainEventWins += 1;
        if (isForTitle && !isNewChampion) updated.titleDefenses += 1;
        if (isNewChampion) updated.titlesWon += 1;
    } else {
        updated.losses += 1;
        updated.currentStreak = updated.currentStreak <= 0 ? updated.currentStreak - 1 : -1;
        updated.lastResult = "loss";
    }

    updated.lastMatchDate = matchDate;
    updated.lastOpponent = opponentName;

    return updated;
}

/**
 * Get match history for a wrestler
 */
export async function getWrestlerMatchHistory(wrestlerId: string, maxResults = 20): Promise<MatchRecord[]> {
    try {
        // Query matches where wrestler was participant
        const q1 = query(
            collection(db, "match_history"),
            where("wrestler1Id", "==", wrestlerId),
            orderBy("createdAt", "desc"),
            limit(maxResults)
        );
        const q2 = query(
            collection(db, "match_history"),
            where("wrestler2Id", "==", wrestlerId),
            orderBy("createdAt", "desc"),
            limit(maxResults)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        const matches: MatchRecord[] = [];
        snap1.forEach(doc => matches.push({ id: doc.id, ...doc.data() } as MatchRecord));
        snap2.forEach(doc => matches.push({ id: doc.id, ...doc.data() } as MatchRecord));

        // Sort by date and deduplicate
        return matches
            .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
            .slice(0, maxResults);
    } catch (error) {
        console.error("Error fetching match history:", error);
        return [];
    }
}

/**
 * Get head-to-head record between two wrestlers
 */
export async function getHeadToHead(wrestler1Id: string, wrestler2Id: string): Promise<{
    wrestler1Wins: number;
    wrestler2Wins: number;
    draws: number;
    matches: MatchRecord[];
}> {
    try {
        // Get all matches between these two
        const matches = await getWrestlerMatchHistory(wrestler1Id, 100);
        const h2hMatches = matches.filter(m =>
            (m.wrestler1Id === wrestler1Id && m.wrestler2Id === wrestler2Id) ||
            (m.wrestler1Id === wrestler2Id && m.wrestler2Id === wrestler1Id)
        );

        let wrestler1Wins = 0;
        let wrestler2Wins = 0;
        let draws = 0;

        h2hMatches.forEach(m => {
            if (m.winnerId === wrestler1Id) wrestler1Wins++;
            else if (m.winnerId === wrestler2Id) wrestler2Wins++;
            else draws++;
        });

        return { wrestler1Wins, wrestler2Wins, draws, matches: h2hMatches };
    } catch (error) {
        console.error("Error fetching head-to-head:", error);
        return { wrestler1Wins: 0, wrestler2Wins: 0, draws: 0, matches: [] };
    }
}

/**
 * Format W-L-D record for display
 */
export function formatRecord(wins: number, losses: number, draws = 0): string {
    if (draws > 0) return `${wins}-${losses}-${draws}`;
    return `${wins}-${losses}`;
}

/**
 * Format streak for display
 */
export function formatStreak(streak: number): { text: string; color: string } {
    if (streak > 0) return { text: `${streak}W`, color: "text-green-500" };
    if (streak < 0) return { text: `${Math.abs(streak)}L`, color: "text-red-500" };
    return { text: "-", color: "text-gray-500" };
}

/**
 * Calculate win percentage
 */
export function calculateWinPercentage(wins: number, losses: number, draws = 0): number {
    const total = wins + losses + draws;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
}
