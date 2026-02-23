import { supabase } from "@/lib/supabase";

export const storageService = {
    async uploadLessonImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `words/${fileName}`;

        const { data, error } = await supabase.storage
            .from('lesson-images')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('lesson-images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async deleteImage(url: string): Promise<void> {
        const path = this.getPathFromUrl(url);
        if (!path) return;

        const { error } = await supabase.storage
            .from('lesson-images')
            .remove([path]);

        if (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    },

    getPathFromUrl(url: string): string | null {
        // Expected format: .../storage/v1/object/public/lesson-images/words/filename.ext
        const parts = url.split('/lesson-images/');
        if (parts.length < 2) return null;
        return parts[1];
    }
};
