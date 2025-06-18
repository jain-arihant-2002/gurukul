import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}

export const uploadImage = async (file: File) => {
    try {
        const { userId } = await auth()

        if (!userId) {
            return [null, new Error("Unauthorized")]
        }
        const id = userId.split("_")[1]; // Extract the user ID from the Clerk user ID format

        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return [null, new Error("Cloudinary configuration is missing")];
        }


        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: `gurukul/${id}/images` },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return [result.public_id, null];
    } catch (error) {
        return [null, new Error("Upload image failed")];
    }
};

export const uploadVideo = async (file: File) => {
    try {

        const { userId } = await auth()

        if (!userId) {
            return [null, new Error("Unauthorized")]
        }
        const id = userId.split("_")[1]; // Extract the user ID from the Clerk user ID format


        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return [null, new Error("Cloudinary configuration is missing")];
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: `gurukul/${id}/videos`,
                        transformation: [
                            { quality: "auto", fetch_format: "mp4" },
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                )
                uploadStream.end(buffer)
            }
        )
        return [result.public_id, null];
    } catch (error) {
        return [null, new Error("Upload video failed")];
    }
}


export const deleteMediaFromCloudinary = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return ['Success', null];
    } catch (error) {
        return [null, new Error("Delete media failed")];
    }
};

export const deleteVideoFromCloudinary = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        return ['Success', null];
    } catch (error) {
        return [null, new Error("Delete video failed")];

    }
}

