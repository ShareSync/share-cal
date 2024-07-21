/*
  Warnings:

  - You are about to drop the `SharedEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SharedEvent" DROP CONSTRAINT "SharedEvent_eventId_fkey";

-- DropForeignKey
ALTER TABLE "SharedEvent" DROP CONSTRAINT "SharedEvent_participantId_fkey";

-- DropIndex
DROP INDEX "CalendarEvent_masterEventId_key";

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'personal',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredEndTime" INTEGER NOT NULL DEFAULT 36,
ADD COLUMN     "preferredStartTime" INTEGER NOT NULL DEFAULT 17;

-- DropTable
DROP TABLE "SharedEvent";
