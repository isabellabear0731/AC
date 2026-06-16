-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "capacity" INTEGER;

-- AlterTable
ALTER TABLE "CourseSession" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "medicalNotes" TEXT;
