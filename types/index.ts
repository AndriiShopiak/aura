export interface Word {
    id?: string;
    value: number | string;
    word: string;
    alts?: string[];
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    icon?: string;
    responseTimer: number;
    words: Word[];
}
