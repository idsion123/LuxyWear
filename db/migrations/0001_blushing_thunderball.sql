CREATE TABLE "category_images" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"category_id" varchar(128) NOT NULL,
	"url" varchar(500) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_ci_category" ON "category_images" USING btree ("category_id");