import { db } from "@/lib/db";
import { users, categories, products, productCategories, cartItems, orders, orderItems, addresses } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

// ── Product names ──
const DRESS_NAMES = ["吊带碎花连衣裙","法式桔梗裙","方领泡泡袖短裙","收腰A字连衣裙","复古波点连衣裙","蕾丝鱼尾连衣裙","背带连衣裙","系带田园风连衣裙","针织修身连衣裙","缎面吊带裙","荷叶边雪纺裙","格纹衬衫裙","宽松T恤连衣裙","海军领连衣裙","蝴蝶结系带连衣裙","镂空针织连衣裙","拼接连衣裙","印花真丝连衣裙","灯笼袖连衣裙","层叠蛋糕裙","抹胸连衣裙","挂脖连衣裙","高开叉连衣裙","娃娃裙","蕾丝打底连衣裙","牛仔衬衫裙","茶歇碎花裙","一字肩荷叶裙","收腰鱼尾裙","丝绒吊带裙"];
const TOP_NAMES = ["基础圆领T恤","条纹长袖T恤","印花宽松T恤","法式条纹衫","V领针织衫","圆领羊毛衫","高领打底衫","堆堆领针织衫","镂空钩花毛衣","绞花厚毛衣","短款修身针织","蝙蝠袖针织衫","荷叶边上衣","蝴蝶结衬衫","飘带雪纺衫","蕾丝打底衫","丝绒上衣","针织开衫短款","娃娃领衬衫","娃娃衫","一字领上衣","方领泡泡袖","灯笼袖衬衫","机车皮衣夹克","牛仔衬衫","格子衬衫","真丝衬衫","法式宫廷衬衫","蕾丝上衣","缎面吊带","针织披肩","连帽卫衣","基础款卫衣","棒球服T恤","撸猫针织衫"];
const OUTER_NAMES = ["长款羊毛大衣","牛角扣大衣","短款羽绒服","长款羽绒服","派克大衣","工装夹克","休闲西装","格纹西装","针织开衫长款","短款夹克","皮毛一体外套","摇粒绒外套","运动风外套","连帽卫衣外套","牛仔外套","风衣","斗篷外套","小香风短外套","皮草马甲","棒球服","飞行员夹克","机车皮衣","茧型大衣","双排扣大衣","浴袍风衣","系带大衣","西装领大衣","连帽大衣","毛呢短外套","棉马甲","羽绒马甲","针织开衫","拉链卫衣","冲锋衣","牛仔长外套"];
const BOTTOM_NAMES = ["高腰紧身牛仔裤","阔腿牛仔裤","破洞牛仔裤","老爹裤","西装直筒裤","九分烟管裤","拖地阔腿裤","运动卫裤","针织打底裤","瑜伽裤","高腰短裤","百慕大短裤","牛仔A字裙","包臀开叉裙","伞裙","直筒半身裙","针织半身裙","皮质短裙","格子短裙","褶皱连衣裙式半裙","丝绒半身裙","蕾丝半身裙","牛仔半身裙","运动短裙","高腰阔腿短裤","背带短裤","连体短裤","西装马裤","纸袋短裤","运动骑行裤","蕾丝打底短裤","棉麻阔腿裤","拖地牛仔裤","微喇牛仔裤","直筒开叉裙"];
const ACC_NAMES = ["简约手表","皮质手链","帆布双肩包","链条斜挎包","迷你手提包","卡包","钱夹","手提购物袋","丝绒口红盒","化妆包","首饰收纳盒","丝巾发带","针织帽","棒球帽","报童帽","渔夫帽","墨镜","阅读镜","手套触屏款","保暖耳罩","围巾","羊绒披肩","腰带编织款","锁骨链","手链","戒指","胸针","袖口","丝袜","连裤袜","过膝袜","短袜","拖鞋","凉鞋","帆布鞋","运动鞋","乐福鞋","马丁靴","过膝靴","雪地靴","小白鞋","穆勒鞋","玛丽珍鞋","芭蕾平底鞋","猫跟鞋","粗跟短靴","袜靴","尖头平底鞋","方头凉鞋","一字带凉鞋"];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function randPrice(min: number, max: number): string {
  return (Math.round((Math.random() * (max - min) + min) / 10) * 10).toFixed(2);
}

function randSizes(): string[] {
  return SIZES.slice(0, 3 + Math.floor(Math.random() * 4));
}

function randColors(): { name: string; hex: string }[] {
  const pool = [
    { name: "黑色", hex: "#2d2a24" }, { name: "白色", hex: "#ffffff" },
    { name: "米色", hex: "#f5f0eb" }, { name: "驼色", hex: "#a8825a" },
    { name: "灰色", hex: "#8b8b8b" }, { name: "藏青色", hex: "#1b2a4a" },
    { name: "酒红色", hex: "#6e2b3b" }, { name: "墨绿色", hex: "#2d5a3d" },
    { name: "雾霾蓝", hex: "#8ba3c7" }, { name: "裸粉色", hex: "#e8c4c4" },
    { name: "香槟金", hex: "#c9a96e" }, { name: "藕粉色", hex: "#d4bcbc" },
  ];
  return pool.slice(0, 2 + Math.floor(Math.random() * 3));
}

async function seedProducts(
  categoryId: string,
  names: string[],
  count: number,
  priceRange: [number, number],
) {
  const batch: (typeof products.$inferInsert)[] = [];
  const rels: { productId: string; categoryId: string }[] = [];

  for (let i = 1; i <= count; i++) {
    const name = names[(i - 1) % names.length] + (i > names.length ? ` ${Math.ceil(i / names.length)}` : "");
    batch.push({
      name,
      slug: `seed-${categoryId.slice(-6)}-${i}`,
      description: `高品质${name}，精致剪裁，尽显轻奢优雅气质。`,
      price: randPrice(priceRange[0], priceRange[1]),
      stock: 20 + Math.floor(Math.random() * 80),
      images: [],
      sizes: randSizes(),
      colors: randColors(),
      isFeatured: i <= 3,
      isPublished: true,
    });
  }

  for (let i = 0; i < batch.length; i += 10) {
    const chunk = batch.slice(i, i + 10);
    const inserted = await db.insert(products).values(chunk).$returningId();
    await db.insert(productCategories).values(
      inserted.map((p) => ({ productId: p.id, categoryId })),
    );
    console.log(`  ${i + chunk.length}/${batch.length}`);
  }
}

async function seed() {
  console.log("Seeding database...");

  // Clean existing data (reverse dependency order)
  console.log("Cleaning existing data...");
  await db.delete(productCategories);
  await db.delete(cartItems);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(addresses);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(users);

  // ── Users ──
  const adminPw = await hashPassword("admin123456");
  await db.insert(users).values({
    email: "admin@fashion.com",
    name: "Admin",
    password: adminPw,
    role: "ADMIN",
  });
  console.log("Admin user created: admin@fashion.com / admin123456");

  const customerPw = await hashPassword("customer123");
  await db.insert(users).values({
    email: "customer@test.com",
    name: "Test Customer",
    password: customerPw,
    role: "CUSTOMER",
  });
  console.log("Customer created: customer@test.com / customer123");

  // ── Categories ──
  const womenswear = await db.insert(categories).values({
    name: "女装", slug: "womenswear", description: "时尚女装系列",
    image: "/images/woman_wear.png",
  }).$returningId();

  const dresses = await db.insert(categories).values({
    name: "连衣裙", slug: "dresses", description: "优雅连衣裙",
    image: "/images/dress.png",
    parentId: womenswear[0].id,
  }).$returningId();

  const tops = await db.insert(categories).values({
    name: "上衣", slug: "tops", description: "衬衫、T恤、针织衫",
    image: "/images/tops.png",
    parentId: womenswear[0].id,
  }).$returningId();

  const outerwear = await db.insert(categories).values({
    name: "外套", slug: "outerwear", description: "大衣、风衣、夹克",
    image: "/images/coat.png",
    parentId: womenswear[0].id,
  }).$returningId();

  const bottoms = await db.insert(categories).values({
    name: "下装", slug: "bottoms", description: "裤子、半身裙",
    image: "/images/bottom_wear.png",
    parentId: womenswear[0].id,
  }).$returningId();

  const accessories = await db.insert(categories).values({
    name: "配饰", slug: "accessories", description: "首饰、包包、围巾",
    image: "/images/accessories.png",
  }).$returningId();

  console.log("Categories created");

  // ── Products ──
  console.log("Seeding dresses...");
  await seedProducts(dresses[0].id, DRESS_NAMES, 30, [199, 899]);

  console.log("Seeding tops...");
  await seedProducts(tops[0].id, TOP_NAMES, 35, [129, 699]);

  console.log("Seeding outerwear...");
  await seedProducts(outerwear[0].id, OUTER_NAMES, 35, [299, 1999]);

  console.log("Seeding bottoms...");
  await seedProducts(bottoms[0].id, BOTTOM_NAMES, 30, [159, 699]);

  console.log("Seeding accessories...");
  await seedProducts(accessories[0].id, ACC_NAMES, 45, [49, 599]);

  console.log("Seed complete!");
}

seed().catch(console.error);
