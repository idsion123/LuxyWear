CREATE TABLE "addresses" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"label" varchar(100),
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"street" varchar(500) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'CN' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"size" varchar(50),
	"color" varchar(50),
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(500),
	"parent_id" varchar(128),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"order_id" varchar(128) NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"size" varchar(50),
	"color" varchar(50),
	"image" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"shipping_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"address_id" varchar(128) NOT NULL,
	"note" text,
	"paid_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" varchar(128) NOT NULL,
	"category_id" varchar(128) NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'CUSTOMER' NOT NULL,
	"phone" varchar(20),
	"avatar" varchar(500),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "idx_address_user" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_cart_user_product" ON "cart_items" USING btree ("user_id","product_id","size","color");--> statement-breakpoint
CREATE INDEX "idx_cart_user" ON "cart_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_category_parent" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_fav_user_product" ON "favorites" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_fav_user" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_item_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_user" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_number" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_order_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pc_category" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_product_slug" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_product_featured" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email");