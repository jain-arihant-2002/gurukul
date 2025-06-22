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

export interface User {
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
  detailDescription: string | null
  coverImage: string
  price: string
  currency: string
  categories?: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}
export interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: any
}
export interface Course {
  id: string;
  instructorName?: string | null;
  instructorClerkId: string;
  title: string;
  slug: string;
  description: string | null;
  detailDescription: string | null
  coverImageUrl: string | null;
  price: string;
  currency: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categories: string  | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnrolledCourse {
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  detailDescription: string | null
  coverImageUrl: string | null;
  price: string;
  currency: string;
  enrolledAt: Date;
  instructorClerkId: string;
}