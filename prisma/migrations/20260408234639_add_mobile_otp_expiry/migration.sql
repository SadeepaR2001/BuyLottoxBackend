/*
  Warnings:

  - You are about to drop the column `code` on the `MobileOtp` table. All the data in the column will be lost.
  - You are about to drop the column `mobileNumber` on the `MobileOtp` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `MobileOtp` table. All the data in the column will be lost.
  - Added the required column `mobile` to the `MobileOtp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `MobileOtp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MobileOtp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MobileOtp` DROP COLUMN `code`,
    DROP COLUMN `mobileNumber`,
    DROP COLUMN `verified`,
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mobile` VARCHAR(191) NOT NULL,
    ADD COLUMN `otp` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
