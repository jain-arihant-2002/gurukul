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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // PK derived directly from Clerk's `userId`. Ensures strong FK integrity with our domain data.
  username: varchar('username', { length: 255 }).unique(), // Optional for app-specific display names, can be synced or custom.
  email: varchar('email', { length: 255 }).notNull().unique(), // Critical for communication; synced via Clerk webhooks.
  fullName: varchar('full_name', { length: 255 }), // Display name, typically synced from Clerk.
  role: varchar('role', { length: 50, enum: ['user', 'educator', 'admin'] }).notNull(), // Core ABAC attribute. Managed internally, not by Clerk roles for granularity.
  isActive: boolean('is_active').default(true).notNull(), // Application-level active status, can be influenced by Clerk's user status.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // First sync timestamp.
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(), // Last update timestamp for local record.
});

export const usersRelations = relations(users, ({ many }) => ({
  coursesOwned: many(courses, { relationName: 'courseOwner' }), // 1:N relationship, Educator owns many Courses.
  enrollments: many(enrollments), // M:N bridge for User-Course enrollment.
  progress: many(userContentProgress), // M:N bridge for User-CourseContent progress tracking.
  submissions: many(submissions, { relationName: 'studentSubmissions' }), // 1:N, Student makes many Submissions.
  gradedSubmissions: many(submissions, { relationName: 'graderSubmissions' }), // 1:N, Educator grades many Submissions.
  payments: many(payments), // 1:N, User makes many Payments.
}));


export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // FK to users.id (Educator). CASCADE ensures orphaned courses are removed.
  status: varchar('status', { length: 50, enum: ['draft', 'published', 'archived'] }).default('draft').notNull(), // ABAC attribute for visibility/accessibility.
  thumbnailUrl: varchar('thumbnail_url', { length: 2048 }), // URL for visual representation. Consider CDN integration.
  price: decimal('price', { precision: 10, scale: 2 }), // Financial value. Decimal for precision over float.
  estimatedDurationMinutes: integer('estimated_duration_minutes'), // Aggregated or estimated duration. Can be denormalized or computed.
  isFeatured: boolean('is_featured').default(false).notNull(), // Simple flag for marketing/discovery.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    ownerIdx: index('courses_owner_idx').on(table.ownerId), // Index for efficient lookup of courses by owner.
    statusIdx: index('courses_status_idx').on(table.status), // Index for filtering by publication status.
    isFeaturedIdx: index('courses_is_featured_idx').on(table.isFeatured), // Index for featured course queries.
  };
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  owner: one(users, {
    fields: [courses.ownerId],
    references: [users.id],
    relationName: 'courseOwner' // Explicit relation name for clarity in Drizzle queries.
  }),
  enrollments: many(enrollments), // 1:N to enrollment bridge table.
  sections: many(sections), // 1:N, Course contains many Sections.
  assignments: many(assignments), // 1:N, Course contains many Assignments (top-level, not section-specific).
  payments: many(payments), // 1:N, Course can be subject of many Payments.
}));


export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }), // FK to parent Course.
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: integer('order_index').default(0).notNull(), // For sequential ordering of sections within a course.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    courseIdx: index('sections_course_idx').on(table.courseId), // Index for fetching sections of a specific course.
  };
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  contents: many(courseContents), // 1:N, Section contains many CourseContents.
}));


export const courseContents = pgTable('course_contents', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }), // FK to parent Section.
  title: varchar('title', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 50, enum: ['video', 'text', 'quiz'] }).notNull(), // Extensible type for content.
  videoUrl: varchar('video_url', { length: 2048 }), // Specific field for video content.
  textContent: text('text_content'), // Specific field for text-based content.
  orderIndex: integer('order_index').default(0).notNull(), // For sequential ordering within a section.
  durationMinutes: integer('duration_minutes'), // Useful for calculating estimated course duration.
  isPublic: boolean('is_public').default(false).notNull(), // Critical ABAC attribute for anonymous access.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    sectionIdx: index('course_contents_section_idx').on(table.sectionId), // Index for fetching content of a specific section.
    isPublicIdx: index('course_contents_is_public_idx').on(table.isPublic), // Index for querying public content.
  };
});

export const courseContentsRelations = relations(courseContents, ({ one, many }) => ({
  section: one(sections, {
    fields: [courseContents.sectionId],
    references: [sections.id],
  }),
  userProgress: many(userContentProgress), // 1:N to userContentProgress bridge table.
}));


export const enrollments = pgTable('enrollments', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // FK to User.
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }), // FK to Course.
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }), // Marks full course completion for this user.
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.courseId] }), // Composite PK ensuring unique enrollment per user per course.
    userCourseIdx: uniqueIndex('enrollments_user_course_idx').on(table.userId, table.courseId), // Redundant index if PK is already composite, but explicitly names the unique constraint.
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


export const userContentProgress = pgTable('user_content_progress', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // FK to User.
  contentId: uuid('content_id').notNull().references(() => courseContents.id, { onDelete: 'cascade' }), // FK to CourseContent.
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp of completion.
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }), // Optional: track partial viewing for resuming.
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.contentId] }), // Composite PK for unique progress per user per content item.
    userContentIdx: uniqueIndex('user_content_progress_user_content_idx').on(table.userId, table.contentId),
  };
});

export const userContentProgressRelations = relations(userContentProgress, ({ one }) => ({
  user: one(users, {
    fields: [userContentProgress.userId],
    references: [users.id],
  }),
  content: one(courseContents, { // Corrected: This should reference courseContents, not courses.
    fields: [userContentProgress.contentId],
    references: [courseContents.id],
  }),
}));


export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }), // FK to parent Course.
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }), // Optional: for assignment deadlines.
  maxPoints: integer('max_points'), // Maximum points an assignment is worth.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    courseIdx: index('assignments_course_idx').on(table.courseId), // Index for fetching assignments of a specific course.
  };
});

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  submissions: many(submissions) // 1:N, Assignment receives many Submissions.
}));


export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }), // FK to the Assignment.
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // FK to the Student who submitted.
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  contentUrl: varchar('content_url', { length: 2048 }), // URL to submitted file (e.g., S3 link).
  contentText: text('content_text'), // Text content of submission (e.g., essay).
  grade: integer('grade'), // Score given. Consider `decimal` for partial points.
  feedback: text('feedback'), // Text feedback from grader.
  gradedAt: timestamp('graded_at', { withTimezone: true }), // When the submission was graded.
  graderId: uuid('grader_id').references(() => users.id, { onDelete: 'set null' }), // FK to the Educator who graded. `set null` ensures grade persists if grader leaves.
}, (table) => {
  return {
    assignmentStudentIdx: uniqueIndex('submissions_assignment_student_idx').on(table.assignmentId, table.studentId), // Ensures one submission per student per assignment.
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
    relationName: 'studentSubmissions' // Explicit relation name for the student side.
  }),
  grader: one(users, {
    fields: [submissions.graderId],
    references: [users.id],
    relationName: 'graderSubmissions' // Explicit relation name for the grader side.
  }),
}));


export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // FK to the User who made the payment.
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }), // FK to the Course that was paid for.
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // Actual amount transacted.
  currency: varchar('currency', { length: 3 }).notNull(), // ISO 4217 code (e.g., 'USD').
  status: varchar('status', { length: 50, enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull(), // Payment lifecycle state. Critical for reliable enrollment.
  transactionId: varchar('transaction_id', { length: 255 }).unique(), // Unique ID from payment gateway (e.g., Stripe's charge ID). Vital for reconciliation.
  paymentMethod: varchar('payment_method', { length: 50 }), // e.g., 'credit_card', 'paypal'.
  paymentGatewayResponse: text('payment_gateway_response'), // Raw JSON response from gateway. Useful for debugging and audit.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('payments_user_idx').on(table.userId), // Index for fetching a user's payment history.
    courseIdx: index('payments_course_idx').on(table.courseId), // Index for fetching payments for a specific course.
    statusIdx: index('payments_status_idx').on(table.status), // Index for filtering payments by status.
    transactionIdIdx: uniqueIndex('payments_transaction_id_idx').on(table.transactionId), // Ensures `transactionId` is unique.
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