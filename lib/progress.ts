export interface LessonProgress {
    completed: boolean;
    stars: number;
    score: number;
}

export interface UserProgress {
    totalStars: number;
    lessons: Record<string, LessonProgress>;
}

const STORAGE_KEY = 'aura_user_progress';

export const getProgress = (): UserProgress => {
    if (typeof window === 'undefined') return { totalStars: 0, lessons: {} };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { totalStars: 0, lessons: {} };

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse progress', e);
        return { totalStars: 0, lessons: {} };
    }
};

export const saveLessonProgress = (lessonId: string, score: number, stars: number) => {
    if (typeof window === 'undefined') return;

    const current = getProgress();
    const previousStars = current.lessons[lessonId]?.stars || 0;

    // Only update if current stars are better or same but higher score
    if (stars > previousStars || (stars === previousStars && score > (current.lessons[lessonId]?.score || 0))) {
        const updatedLessons = {
            ...current.lessons,
            [lessonId]: {
                completed: true,
                stars,
                score
            }
        };

        // Recalculate total stars
        const totalStars = Object.values(updatedLessons).reduce((sum, lesson) => sum + lesson.stars, 0);

        const updatedProgress: UserProgress = {
            totalStars,
            lessons: updatedLessons
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
    }
};

export const calculateStars = (score: number, maxPossibleScore: number): number => {
    if (maxPossibleScore === 0) return 0;
    const percentage = (score / maxPossibleScore) * 100;

    if (percentage >= 90) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 30) return 1;
    return 0;
};
