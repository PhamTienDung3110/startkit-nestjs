-- CreateTable
CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `periodType` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    `trackingType` ENUM('checkbox', 'value', 'progress') NOT NULL DEFAULT 'checkbox',
    `targetValue` DECIMAL(18, 2) NULL,
    `currentValue` DECIMAL(18, 2) NULL DEFAULT 0,
    `unit` VARCHAR(191) NULL,
    `parentGoalId` VARCHAR(191) NULL,
    `autoCalculate` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `category` ENUM('personal', 'finance', 'health', 'education', 'career') NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `month` INTEGER NULL,
    `year` INTEGER NULL,
    `recurringConfig` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Goal_userId_periodType_idx`(`userId`, `periodType`),
    INDEX `Goal_userId_periodType_status_idx`(`userId`, `periodType`, `status`),
    INDEX `Goal_userId_periodType_year_month_idx`(`userId`, `periodType`, `year`, `month`),
    INDEX `Goal_userId_parentGoalId_idx`(`userId`, `parentGoalId`),
    INDEX `Goal_userId_year_idx`(`userId`, `year`),
    INDEX `Goal_userId_month_year_idx`(`userId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Milestone` (
    `id` VARCHAR(191) NOT NULL,
    `goalId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `targetValue` DECIMAL(18, 2) NULL,
    `currentValue` DECIMAL(18, 2) NULL DEFAULT 0,
    `targetDate` DATETIME(3) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Milestone_goalId_order_idx`(`goalId`, `order`),
    INDEX `Milestone_goalId_isCompleted_idx`(`goalId`, `isCompleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_parentGoalId_fkey` FOREIGN KEY (`parentGoalId`) REFERENCES `Goal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Milestone` ADD CONSTRAINT `Milestone_goalId_fkey` FOREIGN KEY (`goalId`) REFERENCES `Goal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
