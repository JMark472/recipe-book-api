import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db";
import { recipes, users } from "@/db/schema";
import type { CreateRecipeInput, UpdateRecipeInput } from "@/schema/recipe-schema";

export class RecipeRepository {
  // Admin list: include the owner's name without exposing private account fields.
  async findAllWithOwners() {
    return db
      .select({
        ...getTableColumns(recipes),
        ownerName: users.name,
      })
      .from(recipes)
      .innerJoin(users, eq(recipes.userId, users.id));
  }

  async findAll(userId?: string) {
    // An owner filter returns one user's recipes; omitting it lists all recipes.
    return db.select().from(recipes).where(userId ? eq(recipes.userId, userId) : undefined);
  }

  async findById(id: string, userId?: string) {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.id, id),
          userId ? eq(recipes.userId, userId) : undefined,
        ),
      )
      .limit(1);

    return recipe;
  }

  async create(data: CreateRecipeInput, userId: string) {
    const [recipe] = await db
      .insert(recipes)
      .values({ ...data, userId })
      .returning();

    return recipe;
  }

  async update(id: string, data: UpdateRecipeInput, userId?: string) {
    const [recipe] = await db
      .update(recipes)
      .set(data)
      .where(
        and(
          eq(recipes.id, id),
          userId ? eq(recipes.userId, userId) : undefined,
        ),
      )
      .returning();

    return recipe;
  }

  async delete(id: string, userId?: string) {
    const [recipe] = await db
      .delete(recipes)
      .where(
        and(
          eq(recipes.id, id),
          userId ? eq(recipes.userId, userId) : undefined,
        ),
      )
      .returning();

    return recipe;
  }
}
