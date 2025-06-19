'use server';
import { getUserByClerkId } from "@/services/user.service";

export const getUserRole = async (clerkUserId: string) => {
    const [user, error] = await getUserByClerkId(clerkUserId);
    if (error) {
        throw new Error(`Failed to fetch user role`);
    }
    if (!user || user instanceof Error) {
        throw new Error(`User not found`);
    }

    return user.lmsRole;
};