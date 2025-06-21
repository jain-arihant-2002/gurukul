export interface ServiceError {
  message: string;
  error: any;
}

export interface UserData {
  clerkUserId: string;
  email: string;
  fullName?: string | null;
  lmsRole?: LmsRole;
}
export enum LmsRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export interface User{
    clerkUserId: string;
    email: string;
    fullName: string | null;
    lmsRole: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateCourseFormData {
    instructorClerkId: string
    title: string
    slug: string
    description: string
    coverImage: string
    price: string
    currency: string
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}
export interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}