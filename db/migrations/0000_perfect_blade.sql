CREATE TABLE `addresses` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`label` varchar(100),
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`street` varchar(500) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`zip_code` varchar(20) NOT NULL,
	`country` varchar(100) NOT NULL DEFAULT 'CN',
	`is_default` boolean NOT NULL DEFAULT false,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`product_id` varchar(128) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`size` varchar(50),
	`color` varchar(50),
	`created_at` datetime NOT NULL,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_cart_user_product` UNIQUE(`user_id`,`product_id`,`size`,`color`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`image` varchar(500),
	`parent_id` varchar(128),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(128) NOT NULL,
	`order_id` varchar(128) NOT NULL,
	`product_id` varchar(128) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	`size` varchar(50),
	`color` varchar(50),
	`image` varchar(500),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(128) NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'PENDING',
	`total_amount` decimal(10,2) NOT NULL,
	`shipping_fee` decimal(10,2) NOT NULL DEFAULT '0',
	`address_id` varchar(128) NOT NULL,
	`note` text,
	`paid_at` datetime,
	`shipped_at` datetime,
	`delivered_at` datetime,
	`cancelled_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` varchar(128) NOT NULL,
	`category_id` varchar(128) NOT NULL,
	CONSTRAINT `product_categories_product_id_category_id_pk` PRIMARY KEY(`product_id`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`compare_at_price` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`images` json NOT NULL DEFAULT ('[]'),
	`sizes` json NOT NULL DEFAULT ('[]'),
	`colors` json NOT NULL DEFAULT ('[]'),
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_published` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'CUSTOMER',
	`phone` varchar(20),
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_address_user` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_cart_user` ON `cart_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_category_parent` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_order_item_order` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_user` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_order_number` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_order_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pc_category` ON `product_categories` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_product_slug` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_product_featured` ON `products` (`is_featured`);--> statement-breakpoint
CREATE INDEX `idx_user_email` ON `users` (`email`);