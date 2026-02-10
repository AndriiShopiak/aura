export const authService = {
    async verifyAdminKey(adminKey: string): Promise<{ success: boolean; error?: string }> {
        try {
            const res = await fetch(`/api/auth/verify?adminKey=${adminKey}`);
            return await res.json();
        } catch (err) {
            return { success: false, error: "Connection error. Please try again." };
        }
    },
};
