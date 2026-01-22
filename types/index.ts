export interface Word {
    value: number | string;
    word: string;
    alts?: string[];
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    icon?: string;
    words: Word[];
}
