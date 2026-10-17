/**
 * Seed script
 * -----------
 * Creates demo accounts and sample recipes so the deployed app has data to
 * show during evaluation. It is safe to run more than once: every insert is
 * guarded by an existence check.
 *
 * Run with:  npm run db:seed
 *
 * NOTE: This script only writes table *records*. It never changes the table
 * structure. Structure changes must always go through the Drizzle schema and
 * `npm run db:plan` / `npm run db:migrate`.
 */
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { recipes, users } from "@/db/schema";

type DemoAccount = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

const demoAccounts: DemoAccount[] = [
  { name: "Recipe Admin", email: "admin@recipebook.dev", password: "Admin1234", role: "ADMIN" },
  { name: "Chef Camille", email: "chef@recipebook.dev", password: "Chef12345", role: "USER" },
];

const sampleRecipes = [
  {
    name: "Classic Margherita Pizza",
    cuisine: "Italian",
    mealType: ["Dinner"],
    difficulty: "Easy",
    cookTimeMinutes: 25,
    tags: ["Pizza", "Italian", "Vegetarian"],
    image: "https://cdn.dummyjson.com/recipe-images/1.webp",
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil leaves", "Olive oil"],
    instructions: ["Preheat the oven to 250°C.", "Spread tomato sauce over the dough.", "Add mozzarella and bake for 12 minutes.", "Finish with fresh basil."],
  },
  {
    name: "Creamy Mushroom Risotto",
    cuisine: "Italian",
    mealType: ["Dinner"],
    difficulty: "Medium",
    cookTimeMinutes: 45,
    tags: ["Risotto", "Comfort food"],
    image: "https://cdn.dummyjson.com/recipe-images/2.webp",
    ingredients: ["Arborio rice", "Mushrooms", "Vegetable stock", "Parmesan", "Butter", "Onion"],
    instructions: ["Sauté the onion and mushrooms.", "Add rice and toast for 2 minutes.", "Add stock one ladle at a time.", "Stir in parmesan and butter."],
  },
  {
    name: "Berry Yogurt Breakfast Bowl",
    cuisine: "American",
    mealType: ["Breakfast"],
    difficulty: "Easy",
    cookTimeMinutes: 10,
    tags: ["Healthy", "Quick", "Breakfast"],
    image: "https://cdn.dummyjson.com/recipe-images/3.webp",
    ingredients: ["Greek yogurt", "Mixed berries", "Granola", "Honey", "Chia seeds"],
    instructions: ["Spoon yogurt into a bowl.", "Top with berries and granola.", "Drizzle with honey.", "Sprinkle chia seeds."],
  },
];

async function seedAccount(account: DemoAccount) {
  const existing = await db.select().from(users).where(eq(users.email, account.email)).limit(1);
  if (existing.length > 0) {
    console.log(`• Account already exists: ${account.email}`);
    return existing[0];
  }

  const [created] = await db
    .insert(users)
    .values({
      name: account.name,
      email: account.email,
      password: await bcrypt.hash(account.password, 10),
      role: account.role,
      emailVerified: new Date().toISOString(),
    })
    .returning();

  console.log(`✓ Created ${account.role} account: ${account.email} / ${account.password}`);
  return created;
}

async function main() {
  console.log("Seeding database...");

  const chef = await seedAccount(demoAccounts[1]);
  await seedAccount(demoAccounts[0]);

  const ownedRecipes = await db.select().from(recipes).where(eq(recipes.userId, chef.id)).limit(1);
  if (ownedRecipes.length > 0) {
    console.log("• Sample recipes already exist, skipping.");
  } else {
    await db.insert(recipes).values(sampleRecipes.map((recipe) => ({ ...recipe, userId: chef.id })));
    console.log(`✓ Created ${sampleRecipes.length} sample recipes for ${chef.email}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
