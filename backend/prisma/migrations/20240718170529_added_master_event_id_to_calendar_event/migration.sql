/*
  Warnings:

  - A unique constraint covering the columns `[masterEventId]` on the table `CalendarEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "masterEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_masterEventId_key" ON "CalendarEvent"("masterEventId");
