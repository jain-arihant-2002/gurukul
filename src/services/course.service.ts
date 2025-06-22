import { db } from '@/db';
import { coursesTable, enrollmentsTable, lessonsTable, sectionsTable, usersTable } from '@/db/schema';
import { Course, EnrolledCourse, ServiceError } from '@/utils/types';
import { asc, eq } from 'drizzle-orm';


/*
This function retrieves all courses from the courses table in the database.
*/
export async function getAllCourses(): Promise<[Course[] | null, ServiceError | null]> {
    try {
        const courses = await db.select().from(coursesTable);
        return [courses, null];
    }
    catch (error: any) {
        return [null, { message: 'An unexpected error occurred while fetching courses.', error }];
    }
}

export const getAllCoursesWithInstructor = async (): Promise<[Course[] | null, ServiceError | null]> => {
    try {
        const courses = await db
            .select({
                id: coursesTable.id,
                title: coursesTable.title,
                slug: coursesTable.slug,
                description: coursesTable.description,
                coverImageUrl: coursesTable.coverImageUrl,
                price: coursesTable.price,
                currency: coursesTable.currency,
                instructorClerkId: coursesTable.instructorClerkId,
                instructorName: usersTable.fullName,
                status: coursesTable.status,
                detailDescription: coursesTable.detailDescription,
                categories: coursesTable.categories,
            })
            .from(coursesTable).innerJoin(
                usersTable,
                eq(coursesTable.instructorClerkId, usersTable.clerkUserId)
            ).where(
                eq(coursesTable.status, 'PUBLISHED')
            );
        return [courses, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while fetching courses with instructor.', error }];
    }
}
/*
This function takes an instructor ID and return all courses associated with that instructor.
*/
export async function getCoursesByInstructorId(instructorId: string): Promise<[Course[] | null, ServiceError | null]> {
    try {
        const courses = await db
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.instructorClerkId, instructorId))
            .execute();
        return [courses, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while fetching courses by instructor ID.', error }];
    }
}

/*
This function takes a User ID and returns the course associated with that User.
*/
export async function getEnrolledCoursesByUserId(userId: string): Promise<[EnrolledCourse[] | null, ServiceError | null]> {
    try {
        const enrolledCourses = await db
            .select({
                courseId: coursesTable.id,
                title: coursesTable.title,
                slug: coursesTable.slug,
                description: coursesTable.description,
                detailDescription: coursesTable.detailDescription,
                coverImageUrl: coursesTable.coverImageUrl,
                price: coursesTable.price,
                currency: coursesTable.currency,
                enrolledAt: enrollmentsTable.enrolledAt,
                instructorClerkId: coursesTable.instructorClerkId
            })
            .from(enrollmentsTable)
            .innerJoin(
                coursesTable,
                eq(enrollmentsTable.courseId, coursesTable.id)
            )
            .where(eq(enrollmentsTable.userClerkId, userId));

        return [enrolledCourses, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while fetching course by user ID.', error }];
    }

}

/*
This function returns all sections of a course  and all lessons within each section.
It takes a course ID as an argument.
*/
export async function getCourseSectionsAndLessons(courseId: string) {
    try {
        // First, get all sections for the course ordered by their index
        const sections = await db
            .select()
            .from(sectionsTable)
            .where(eq(sectionsTable.courseId, courseId))
            .orderBy(asc(sectionsTable.orderIndex));

        // For each section, get its lessons
        const sectionsWithLessons = await Promise.all(
            sections.map(async (section) => {
                const lessons = await db
                    .select()
                    .from(lessonsTable)
                    .where(eq(lessonsTable.sectionId, section.id))
                    .orderBy(asc(lessonsTable.orderIndex));

                return {
                    ...section,
                    lessons
                };
            })
        );

        return [sectionsWithLessons, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while fetching course sections and lessons.', error }];
    }
}

/* Add Course in database */
export async function addCourse(courseData: Omit<Course, 'id'>): Promise<[Course[] | null, ServiceError | null]> {
    try {
        const course = await db.insert(coursesTable).values(courseData).returning();
        return [course, null];
    } catch (error: any) {
        if (error.code === '23505')  // Unique violation error code
            return [null, { message: 'A course with this Title already exists. Please choose a different title.', error }];

        return [null, { message: 'An unexpected error occurred while adding the course.', error }];
    }
}

/* Add Section in a Course */
export async function addSectionInCourse(sectionData: {
    courseId: string
    title: string
    orderIndex: number
}) {
    try {
        const section = await db.insert(sectionsTable).values(sectionData).returning();
        return [section, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while adding the section.', error }];
    }
}

/* Add Lesson in a Section */
export async function addLessonInSection(lessonData: {
    sectionId: string
    title: string
    contentType: 'TEXT' | 'VIDEO' | 'IMAGE'
    textContent: string
    videoProviderId: string
    videoPlaybackId: string
    videoDurationSeconds: number
    orderIndex: number
    isPreviewAllowed: boolean
}) {
    try {
        const lesson = await db.insert(lessonsTable).values(lessonData).returning();
        return [lesson, null];
    } catch (error: any) {
        return [null, { message: 'An unexpected error occurred while adding the lesson.', error }];
    }
}

/*
getAllCourses
getCoursesByInstructorId
getEnrolledCoursesByUserId
getCourseSectionsAndLessons

add course                                    [X]
add section in course                         [X]
add lesson in section                         [X]
delete course
delete section in course
delete lesson in section
update course
update section in course
update lesson in section
get course by id
get section by id
get lesson by id
get all courses by instructor id
get all sections by course id
get all lessons by section id
get all courses by user id                   [X]
get all sections and lessons by course id    [X]
*/