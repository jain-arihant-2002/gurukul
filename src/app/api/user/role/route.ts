import { getUserByClerkId } from "@/services/user.service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return '';
    }
    const [user, error] = await getUserByClerkId(userId);
    if (error) {
        throw new Error(`Failed to fetch user role`);
    }
    if (!user || user instanceof Error) {
        throw new Error(`User not found`);
    }
    return NextResponse.json({
        role: user.lmsRole || null,
    });
}