export interface Word {
    id?: string;
    value: number | string;
    word: string;
    alts?: string[];
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    icon?: string;
}

export interface Lesson {
    id: string;
    quest_id: string;
    title: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    responseTimer: number;
    words: Word[];
}

export interface LessonProgress {
    completed: boolean;
    stars: number;
    score: number;
}

export interface UserProgress {
    totalStars: number;
    lessons: Record<string, LessonProgress>;
}
