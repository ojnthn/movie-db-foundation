-- CreateTable
CREATE TABLE `user_movie_review` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `movie_id` INTEGER NOT NULL,
    `rate` DECIMAL(2, 1) NOT NULL,
    `loved` BOOLEAN NOT NULL,
    `review` TEXT NULL,
    `log_date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_movie_review` ADD CONSTRAINT `user_movie_review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
