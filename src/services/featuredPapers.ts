import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebaseDb';
import type { PaperData } from './upload';
import logger from '../utils/logger';

/**
 * Get featured papers for home page showcase
 * Fetches recently uploaded approved papers with diverse content
 * Prioritizes papers with thumbnails for better visual presentation
 */
export const getFeaturedPapers = async (limitCount: number = 8): Promise<PaperData[]> => {
    try {
        // Fetch more papers than needed to allow for randomization and filtering
        const fetchLimit = limitCount * 3;

        const papersQuery = query(
            collection(db, 'papers'),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc'),
            limit(fetchLimit)
        );

        const querySnapshot = await getDocs(papersQuery);

        const papers: PaperData[] = [];
        querySnapshot.forEach((doc) => {
            papers.push({ id: doc.id, ...doc.data() } as PaperData & { id: string });
        });

        // Prioritize papers with thumbnails
        const papersWithThumbnails = papers.filter(p => p.thumbnailUrl);
        const papersWithoutThumbnails = papers.filter(p => !p.thumbnailUrl);

        // Shuffle both arrays for randomization
        const shuffled = [
            ...papersWithThumbnails.sort(() => Math.random() - 0.5),
            ...papersWithoutThumbnails.sort(() => Math.random() - 0.5)
        ];

        // Try to get diverse content (different colleges/semesters)
        const diverse: PaperData[] = [];
        const seenCombinations = new Set<string>();

        for (const paper of shuffled) {
            const key = `${paper.college}-${paper.semester}`;

            // Add paper if we haven't seen this combination or if we need more papers
            if (!seenCombinations.has(key) || diverse.length < limitCount) {
                diverse.push(paper);
                seenCombinations.add(key);
            }

            if (diverse.length >= limitCount) {
                break;
            }
        }

        // If we still don't have enough diverse papers, fill with remaining papers
        if (diverse.length < limitCount) {
            for (const paper of shuffled) {
                if (!diverse.includes(paper)) {
                    diverse.push(paper);
                    if (diverse.length >= limitCount) {
                        break;
                    }
                }
            }
        }

        return diverse.slice(0, limitCount);
    } catch (error) {
        logger.error('Error fetching featured papers:', error);
        // Return empty array instead of throwing to prevent home page from breaking
        return [];
    }
};
