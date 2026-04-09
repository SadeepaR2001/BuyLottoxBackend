/*
  Warnings:

  - You are about to drop the column `mobile` on the `MobileOtp` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `MobileOtp` table. All the data in the column will be lost.
  - Added the required column `code` to the `MobileOtp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNumber` to the `MobileOtp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MobileOtp` DROP COLUMN `mobile`,
    DROP COLUMN `otp`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `mobileNumber` VARCHAR(191) NOT NULL;
