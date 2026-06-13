import {
  pgTable,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("CUSTOMER"),
    phone: varchar("phone", { length: 20 }),
    avatar: varchar("avatar", { length: 500 }),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
    updatedAt: timestamp("updated_at").notNull().$defaultFn(now).$onUpdateFn(now),
  },
  (table) => [index("idx_user_email").on(table.email)]
);

export const addresses = pgTable(
  "addresses",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    userId: varchar("user_id", { length: 128 }).notNull(),
    label: varchar("label", { length: 100 }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    street: varchar("street", { length: 500 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    zipCode: varchar("zip_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull().default("CN"),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [index("idx_address_user").on(table.userId)]
);

export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image: varchar("image", { length: 500 }),
    parentId: varchar("parent_id", { length: 128 }),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
    updatedAt: timestamp("updated_at").notNull().$defaultFn(now).$onUpdateFn(now),
  },
  (table) => [index("idx_category_parent").on(table.parentId)]
);

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    images: jsonb("images").notNull().$type<string[]>().default([]),
    sizes: jsonb("sizes").notNull().$type<string[]>().default([]),
    colors: jsonb("colors").notNull().$type<{ name: string; hex: string }[]>().default([]),
    isFeatured: boolean("is_featured").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
    updatedAt: timestamp("updated_at").notNull().$defaultFn(now).$onUpdateFn(now),
  },
  (table) => [
    index("idx_product_slug").on(table.slug),
    index("idx_product_featured").on(table.isFeatured),
  ]
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: varchar("product_id", { length: 128 }).notNull(),
    categoryId: varchar("category_id", { length: 128 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index("idx_pc_category").on(table.categoryId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    userId: varchar("user_id", { length: 128 }).notNull(),
    productId: varchar("product_id", { length: 128 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    uniqueIndex("uq_cart_user_product").on(table.userId, table.productId, table.size, table.color),
    index("idx_cart_user").on(table.userId),
  ]
);

export const favorites = pgTable(
  "favorites",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    userId: varchar("user_id", { length: 128 }).notNull(),
    productId: varchar("product_id", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    uniqueIndex("uq_fav_user_product").on(table.userId, table.productId),
    index("idx_fav_user").on(table.userId),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull().default("0"),
    addressId: varchar("address_id", { length: 128 }).notNull(),
    note: text("note"),
    paidAt: timestamp("paid_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().$defaultFn(now),
    updatedAt: timestamp("updated_at").notNull().$defaultFn(now).$onUpdateFn(now),
  },
  (table) => [
    index("idx_order_user").on(table.userId),
    index("idx_order_number").on(table.orderNumber),
    index("idx_order_status").on(table.status),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(cuid),
    orderId: varchar("order_id", { length: 128 }).notNull(),
    productId: varchar("product_id", { length: 128 }).notNull(),
    productName: varchar("product_name", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    image: varchar("image", { length: 500 }),
  },
  (table) => [index("idx_order_item_order").on(table.orderId)]
);

function cuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${random}`;
}

function now(): Date {
  return new Date();
}
