import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo } from '@/utils/cloudinary';
import { isAuthorized } from '@/utils/requiredRole';


export async function POST(request: NextRequest) {
    const allowed = await isAuthorized(['INSTRUCTOR', 'ADMIN']);

    if (!allowed) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 400 })
        }

        const fileType = file.type.startsWith("video/") ? "video" : "image";
        // add result url to database
        switch (fileType) {
            case 'video': {
                const [result, error] = await uploadVideo(file);
                if (error) {
                    return NextResponse.json({ error: error }, { status: 500 })
                }
                return NextResponse.json({ publicId: result, }, { status: 200 });
            }

            case "image": {

                const [result, error] = await uploadImage(file);

                if (error) {
                    return NextResponse.json({ error: error }, { status: 500 })
                }

                return NextResponse.json({ publicId: result, }, { status: 200 })
            }
            default: {
                return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
            }
        }

    } catch (error) {
        
        return NextResponse.json({ error: "Upload image failed" }, { status: 500 })
    }

}