import { RecipeRepository } from "@/repositories/recipe-repository";
import { UserRepository } from "@/repositories/user-repository";
import type { CreateRecipeInput } from "@/schema/recipe-schema";

export async function createRecipeService(data: CreateRecipeInput, userId: string) {
  const recipeRepository = new RecipeRepository();
  const userRepository = new UserRepository();

  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) return { code: 401, status: "error", message: "Authentication required" };

    // Create recipe
    const recipe = await recipeRepository.create(data, user.id);
    return { code: 201, status: "success", data: { recipe } };
  } catch (error) {
    console.error("createRecipeService Error", error);
    return { code: 500, status: "error", message: "Unable to create recipe" };
  }
}
