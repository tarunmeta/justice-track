-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PUBLIC', 'LAWYER', 'LEGAL_EXPERT', 'MODERATOR', 'ADMIN', 'JUDGE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('ACCIDENT', 'ASSAULT', 'CORRUPTION', 'PUBLIC_SAFETY', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('PENDING_REVIEW', 'UNDER_INVESTIGATION', 'VERIFIED', 'COURT_HEARING', 'RESOLVED', 'CLOSED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('SUPPORT', 'OPPOSE');

-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('SUBMISSION', 'REVIEW', 'VERIFICATION', 'HEARING', 'RESOLUTION', 'STATUS_CHANGE', 'GENERAL');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('APPROVE_CASE', 'REJECT_CASE', 'FLAG_CASE', 'VERIFY_CASE', 'EDIT_CASE', 'SUSPEND_USER', 'BAN_USER', 'UNSUSPEND_USER', 'DELETE_COMMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PUBLIC',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "verification_documents" TEXT,
    "refresh_token" TEXT,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "source_url" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "CaseStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "ground_status" TEXT,
    "support_count" INTEGER NOT NULL DEFAULT 0,
    "oppose_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_updates" (
    "id" TEXT NOT NULL,
    "update_text" TEXT NOT NULL,
    "update_type" "UpdateType" NOT NULL,
    "case_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_comments" (
    "id" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "lawyer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lawyer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "action_type" "ModerationAction" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_case_id_key" ON "votes"("user_id", "case_id");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_updates" ADD CONSTRAINT "case_updates_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_updates" ADD CONSTRAINT "case_updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_comments" ADD CONSTRAINT "lawyer_comments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_comments" ADD CONSTRAINT "lawyer_comments_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
