CREATE TYPE "public"."course_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."lesson_content_type" AS ENUM('TEXT', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."lms_user_role" AS ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "course_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instructor_clerk_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"cover_image_url" varchar(1024),
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "course_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_clerk_id" varchar(255) NOT NULL,
	"course_id" uuid NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content_type" "lesson_content_type" NOT NULL,
	"text_content" text,
	"video_provider_id" varchar(255),
	"video_playback_id" varchar(255),
	"video_duration_seconds" integer,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_preview_allowed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_clerk_id" varchar(255) NOT NULL,
	"course_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "payment_status" NOT NULL,
	"razorpay_order_id" varchar(255),
	"razorpay_signature" varchar(255),
	"provider_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_enrollment_id_unique" UNIQUE("enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"clerk_user_id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"lms_role" "lms_user_role" DEFAULT 'STUDENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_clerk_id_users_clerk_user_id_fk" FOREIGN KEY ("instructor_clerk_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_clerk_id_users_clerk_user_id_fk" FOREIGN KEY ("user_clerk_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_clerk_id_users_clerk_user_id_fk" FOREIGN KEY ("user_clerk_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_progress_enrollment_lesson_unique_idx" ON "course_progress" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
CREATE INDEX "course_progress_enrollment_idx" ON "course_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "courses_instructor_idx" ON "courses" USING btree ("instructor_clerk_id");--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_user_course_unique_idx" ON "enrollments" USING btree ("user_clerk_id","course_id");--> statement-breakpoint
CREATE INDEX "enrollments_user_idx" ON "enrollments" USING btree ("user_clerk_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_section_order_unique_idx" ON "lessons" USING btree ("section_id","order_index");--> statement-breakpoint
CREATE INDEX "lessons_section_idx" ON "lessons" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_clerk_id");--> statement-breakpoint
CREATE INDEX "payments_course_idx" ON "payments" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sections_course_order_unique_idx" ON "sections" USING btree ("course_id","order_index");--> statement-breakpoint
CREATE INDEX "sections_course_idx" ON "sections" USING btree ("course_id");