import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  primaryKey,
  index,
  uniqueIndex,
  // serial, // Not using serial for users.id as it's Clerk's UUID
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- USERS Table (UPDATED: passwordHash removed, id stores Clerk ID) ---
export const users = pgTable('users', {
  // `id` will store the Clerk User ID (e.g., 'user_xxxxxxxxx').
  // This is the primary key and our application's unique identifier for the user.
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique(), // Optional: if you have app-specific usernames
  email: varchar('email', { length: 255 }).notNull().unique(), // Synced from Clerk
  // passwordHash: varchar('password_hash', { length: 255 }).notNull(), // <-- REMOVED: Handled by Clerk
  fullName: varchar('full_name', { length: 255 }), // Synced from Clerk
  role: varchar('role', { length: 50, enum: ['user', 'educator', 'admin'] }).notNull(), // Managed by your app
  isActive: boolean('is_active').default(true).notNull(), // Managed by your app, or synced from Clerk status
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // When user first synced
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(), // Last sync/update
});

export const usersRelations = relations(users, ({ many }) => ({
  coursesOwned: many(courses, { relationName: 'courseOwner' }),
  enrollments: many(enrollments),
  progress: many(userContentProgress),
  submissions: many(submissions, { relationName: 'studentSubmissions' }),
  gradedSubmissions: many(submissions, { relationName: 'graderSubmissions' }),
  payments: many(payments),
}));


// --- COURSES Table (No structural changes) ---
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50, enum: ['draft', 'published', 'archived'] }).default('draft').notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 2048 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  estimatedDurationMinutes: integer('estimated_duration_minutes'),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    ownerIdx: index('courses_owner_idx').on(table.ownerId),
    statusIdx: index('courses_status_idx').on(table.status),
    isFeaturedIdx: index('courses_is_featured_idx').on(table.isFeatured),
  };
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  owner: one(users, {
    fields: [courses.ownerId],
    references: [users.id],
    relationName: 'courseOwner'
  }),
  enrollments: many(enrollments),
  sections: many(sections),
  assignments: many(assignments),
  payments: many(payments),
}));


// --- SECTIONS Table (No structural changes) ---
export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    courseIdx: index('sections_course_idx').on(table.courseId),
  };
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  contents: many(courseContents),
}));


// --- COURSE CONTENTS Table (No structural changes) ---
export const courseContents = pgTable('course_contents', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 50, enum: ['video', 'text', 'quiz'] }).notNull(),
  videoUrl: varchar('video_url', { length: 2048 }),
  textContent: text('text_content'),
  orderIndex: integer('order_index').default(0).notNull(),
  durationMinutes: integer('duration_minutes'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    sectionIdx: index('course_contents_section_idx').on(table.sectionId),
    isPublicIdx: index('course_contents_is_public_idx').on(table.isPublic),
  };
});

export const courseContentsRelations = relations(courseContents, ({ one, many }) => ({
  section: one(sections, {
    fields: [courseContents.sectionId],
    references: [sections.id],
  }),
  userProgress: many(userContentProgress),
}));


// --- ENROLLMENTS Table (No structural changes) ---
export const enrollments = pgTable('enrollments', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.courseId] }),
    userCourseIdx: uniqueIndex('enrollments_user_course_idx').on(table.userId, table.courseId),
  };
});

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));


// --- USER CONTENT PROGRESS Table (No structural changes) ---
export const userContentProgress = pgTable('user_content_progress', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: uuid('content_id').notNull().references(() => courseContents.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.contentId] }),
    userContentIdx: uniqueIndex('user_content_progress_user_content_idx').on(table.userId, table.contentId),
  };
});

export const userContentProgressRelations = relations(userContentProgress, ({ one }) => ({
  user: one(users, {
    fields: [userContentProgress.userId],
    references: [users.id],
  }),
  content: one(courseContents, {
    fields: [userContentProgress.contentId],
    references: [courseContents.id],
  }),
}));


// --- ASSIGNMENTS Table (No structural changes) ---
export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  maxPoints: integer('max_points'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    courseIdx: index('assignments_course_idx').on(table.courseId),
  };
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(submissions)
}));

// --- SUBMISSIONS Table (No structural changes) ---
export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  contentUrl: varchar('content_url', { length: 2048 }),
  contentText: text('content_text'),
  grade: integer('grade'),
  feedback: text('feedback'),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
  graderId: uuid('grader_id').references(() => users.id, { onDelete: 'set null' }),
}, (table) => {
  return {
    assignmentStudentIdx: uniqueIndex('submissions_assignment_student_idx').on(table.assignmentId, table.studentId),
  };
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
    relationName: 'studentSubmissions'
  }),
  grader: one(users, {
    fields: [submissions.graderId],
    references: [users.id],
    relationName: 'graderSubmissions'
  }),
}));


// --- PAYMENTS Table (No structural changes) ---
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: varchar('status', { length: 50, enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull(),
  transactionId: varchar('transaction_id', { length: 255 }).unique(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentGatewayResponse: text('payment_gateway_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('payments_user_idx').on(table.userId),
    courseIdx: index('payments_course_idx').on(table.courseId),
    statusIdx: index('payments_status_idx').on(table.status),
    transactionIdIdx: uniqueIndex('payments_transaction_id_idx').on(table.transactionId),
  };
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
}));