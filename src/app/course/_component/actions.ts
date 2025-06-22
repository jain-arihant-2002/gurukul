'use server'

import { addCourse } from "@/services/course.service";
import { uploadImage } from "@/utils/cloudinary";
import { auth } from "@clerk/nextjs/server";

export async function createCourse(data: any) {
    const { userId } = await auth();

    if (!userId) {
        return { error: "Unauthorized" };
    }

    let slug = data.title as string;
    slug = slug.toLowerCase().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

    let coverImage = data.coverImage[0] as File;;

    let coverImageUrl: string = '';
    console.log("Cover Image URL:", coverImage);
    if (coverImage) {
        const [publicId, error] = await uploadImage(coverImage);
        if (error || typeof publicId !== "string") {
            return { error };
        }
        coverImageUrl = publicId;
    }
    const courseData = {
        instructorClerkId: userId,
        title: data.title as string,
        slug: slug as string,
        description: data.description as string,
        detailDescription: data.detailDescription as string || "",
        categories: data.categories ? (data.categories as string).split(',').map((cat: string) => cat.trim()).join(',') : null,
        coverImageUrl: coverImageUrl as string,
        price: (data.price as string) || "0",
        currency: (data?.currency as string) || 'INR',
        status: data.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" ||"DRAFT",
    }
    if (!courseData)
        return { success: false, error: "Invalid form data" };

    const [course, error] = await addCourse(courseData);

    if (error) {
        return { success: false, message: "Failed to create course" , error };
    }
    return { success: true, data: course };
}