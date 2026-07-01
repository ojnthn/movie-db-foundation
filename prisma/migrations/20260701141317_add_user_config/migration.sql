-- AlterTable
ALTER TABLE `users` ADD COLUMN `default_sort_by` VARCHAR(191) NOT NULL DEFAULT 'popularity.desc',
    ADD COLUMN `include_adult` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `items_per_page` INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN `language` VARCHAR(191) NOT NULL DEFAULT 'en-US',
    ADD COLUMN `new_releases_from_favorite_genres` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `region` VARCHAR(191) NOT NULL DEFAULT 'US',
    ADD COLUMN `theme` VARCHAR(191) NOT NULL DEFAULT 'dark',
    ADD COLUMN `watchlist_upcoming_reminders` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `user_favorite_genres` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `genre_id` INTEGER NOT NULL,

    UNIQUE INDEX `user_favorite_genres_user_id_genre_id_key`(`user_id`, `genre_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_streaming_providers` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `provider_id` INTEGER NOT NULL,

    UNIQUE INDEX `user_streaming_providers_user_id_provider_id_key`(`user_id`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_favorite_genres` ADD CONSTRAINT `user_favorite_genres_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_streaming_providers` ADD CONSTRAINT `user_streaming_providers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
