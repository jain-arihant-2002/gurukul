// db/schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- ENUMS ---

export const lmsUserRoleEnum = pgEnum('lms_user_role', ['STUDENT', 'INSTRUCTOR', 'ADMIN']);
export const courseStatusEnum = pgEnum('course_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const lessonContentTypeEnum = pgEnum('lesson_content_type', ['TEXT', 'VIDEO','IMAGE']);
export const paymentStatusEnum = pgEnum('payment_status', ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED']);

// --- TABLES ---

/**
 * Users table to store application-specific data linked to Clerk users.
 */
export const usersTable = pgTable('users', {
  clerkUserId: varchar('clerk_user_id', { length: 255 }).primaryKey(), // From Clerk
  email: varchar('email', { length: 255 }).notNull().unique(), // Synced from Clerk
  fullName: varchar('full_name', { length: 255 }), // Synced from Clerk
  lmsRole: lmsUserRoleEnum('lms_role').notNull().default('STUDENT'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Courses offered on the platform.
 */
export const coursesTable = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  instructorClerkId: varchar('instructor_clerk_id', { length: 255 })
    .notNull()
    .references(() => usersTable.clerkUserId, { onDelete: 'cascade' }), // Instructor who created the course
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  coverImageUrl: varchar('cover_image_url', { length: 1024 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'), // 0.00 for free courses
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: courseStatusEnum('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    instructorIdx: index('courses_instructor_idx').on(table.instructorClerkId),
    statusIdx: index('courses_status_idx').on(table.status),
  };
});

/**
 * Sections within a course, used to organize lessons.
 */
export const sectionsTable = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => coursesTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0), // For ordering sections within a course
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    courseOrderUniqueIdx: uniqueIndex('sections_course_order_unique_idx').on(table.courseId, table.orderIndex),
    courseIdx: index('sections_course_idx').on(table.courseId),
  };
});

/**
 * Individual lessons within a section.
 */
export const lessonsTable = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id')
    .notNull()
    .references(() => sectionsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  contentType: lessonContentTypeEnum('content_type').notNull(),
  textContent: text('text_content'), // For TEXT type lessons
  videoProviderId: varchar('video_provider_id', { length: 255 }), // e.g., Mux Asset ID, Cloudinary Public ID
  videoPlaybackId: varchar('video_playback_id', { length: 255 }), // e.g., Mux Playback ID
  videoDurationSeconds: integer('video_duration_seconds'),
  orderIndex: integer('order_index').notNull().default(0), // For ordering lessons within a section
  isPreviewAllowed: boolean('is_preview_allowed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    sectionOrderUniqueIdx: uniqueIndex('lessons_section_order_unique_idx').on(table.sectionId, table.orderIndex),
    sectionIdx: index('lessons_section_idx').on(table.sectionId),
  };
});

/**
 * Tracks student enrollments in courses.
 */
export const enrollmentsTable = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: varchar('user_clerk_id', { length: 255 })
    .notNull()
    .references(() => usersTable.clerkUserId, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => coursesTable.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  // You might add a status here if enrollments can be cancelled, etc.
}, (table) => {
  return {
    userCourseUniqueIdx: uniqueIndex('enrollments_user_course_unique_idx').on(table.userClerkId, table.courseId),
    userIdx: index('enrollments_user_idx').on(table.userClerkId),
    courseIdx: index('enrollments_course_idx').on(table.courseId),
  };
});

/**
 * Tracks progress of a student through lessons in an enrolled course.
 */
export const courseProgressTable = pgTable('course_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  enrollmentId: uuid('enrollment_id')
    .notNull()
    .references(() => enrollmentsTable.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessonsTable.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }), // Nullable, set when completed
  // lastWatchedTimestampSeconds: integer('last_watched_timestamp_seconds'), // Optional for video resume
}, (table) => {
  return {
    enrollmentLessonUniqueIdx: uniqueIndex('course_progress_enrollment_lesson_unique_idx').on(table.enrollmentId, table.lessonId),
    enrollmentIdx: index('course_progress_enrollment_idx').on(table.enrollmentId),
  };
});

/**
 * Stores payment transaction details.
 */
export const paymentsTable = pgTable('payments', {
  id: varchar('id', { length: 255 }).primaryKey(), // Razorpay Payment ID
  userClerkId: varchar('user_clerk_id', { length: 255 })
    .notNull()
    .references(() => usersTable.clerkUserId, { onDelete: 'set null' }), // Set null if user is deleted, to keep payment record
  courseId: uuid('course_id')
    .notNull()
    .references(() => coursesTable.id, { onDelete: 'set null' }), // Set null if course is deleted
  enrollmentId: uuid('enrollment_id')
    .references(() => enrollmentsTable.id, { onDelete: 'set null' }) // Link to the enrollment created/updated
    .unique(), // One payment per enrollment
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: paymentStatusEnum('status').notNull(),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }),
  razorpaySignature: varchar('razorpay_signature', { length: 255 }), // For webhook verification
  providerData: jsonb('provider_data'), // Store full Razorpay response/event
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('payments_user_idx').on(table.userClerkId),
    courseIdx: index('payments_course_idx').on(table.courseId),
  };
});


// --- RELATIONS ---
// Define how tables relate to each other for easier querying with Drizzle's relational queries.

export const usersRelations = relations(usersTable, ({ many }) => ({
  coursesAuthored: many(coursesTable, { relationName: 'AuthoredCourses' }), // Courses an instructor has created
  enrollments: many(enrollmentsTable),
  payments: many(paymentsTable),
}));

export const coursesRelations = relations(coursesTable, ({ one, many }) => ({
  instructor: one(usersTable, {
    fields: [coursesTable.instructorClerkId],
    references: [usersTable.clerkUserId],
    relationName: 'AuthoredCourses',
  }),
  sections: many(sectionsTable),
  enrollments: many(enrollmentsTable),
  payments: many(paymentsTable),
}));

export const sectionsRelations = relations(sectionsTable, ({ one, many }) => ({
  course: one(coursesTable, {
    fields: [sectionsTable.courseId],
    references: [coursesTable.id],
  }),
  lessons: many(lessonsTable),
}));

export const lessonsRelations = relations(lessonsTable, ({ one, many }) => ({
  section: one(sectionsTable, {
    fields: [lessonsTable.sectionId],
    references: [sectionsTable.id],
  }),
  progressRecords: many(courseProgressTable),
}));

export const enrollmentsRelations = relations(enrollmentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [enrollmentsTable.userClerkId],
    references: [usersTable.clerkUserId],
  }),
  course: one(coursesTable, {
    fields: [enrollmentsTable.courseId],
    references: [coursesTable.id],
  }),
  progressRecords: many(courseProgressTable),
  payment: one(paymentsTable, { // An enrollment might be linked to a payment
    fields: [enrollmentsTable.id],
    references: [paymentsTable.enrollmentId],
  })
}));

export const courseProgressRelations = relations(courseProgressTable, ({ one }) => ({
  enrollment: one(enrollmentsTable, {
    fields: [courseProgressTable.enrollmentId],
    references: [enrollmentsTable.id],
  }),
  lesson: one(lessonsTable, {
    fields: [courseProgressTable.lessonId],
    references: [lessonsTable.id],
  }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [paymentsTable.userClerkId],
    references: [usersTable.clerkUserId],
  }),
  course: one(coursesTable, {
    fields: [paymentsTable.courseId],
    references: [coursesTable.id],
  }),
  enrollment: one(enrollmentsTable, { // A payment is for one enrollment
    fields: [paymentsTable.enrollmentId],
    references: [enrollmentsTable.id],
  }),
}));