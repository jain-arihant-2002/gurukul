import { NextRequest, NextResponse } from 'next/server';
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary } from '@/utils/cloudinary';
import { auth } from '@clerk/nextjs/server';
import { isAuthorized } from '@/utils/requiredRole';


export async function POST(request: NextRequest) {
    // Check if the user is logged in
    // and get the userId from Clerk
    const { userId } = await auth();

    const allowed = await isAuthorized(['INSTRUCTOR', 'ADMIN']);
    if (!userId || !allowed) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check if owner of the media
    if (id.split('/')[1] !== userId.split("_")[1]) {
        return NextResponse.json({ error: "Unauthorized to delete this media" }, { status: 403 });
    }
    // delete result url to database
    try {
        switch (body.type) {
            case 'image': {
                const [result, error] = await deleteMediaFromCloudinary(id);
                if (error) {
                    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
                }
                return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
            }
            case 'video': {
                const [result, error] = await deleteVideoFromCloudinary(id);
                if (error) {
                    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
                }
                return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
            }
            default:
                return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
        }
    } catch (error) {
        
        return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
    }
}