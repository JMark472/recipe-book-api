import { RecipeRepository } from "@/repositories/recipe-repository";
import { UserRepository } from "@/repositories/user-repository";
import type { UpdateRecipeInput } from "@/schema/recipe-schema";

export async function updateRecipeService(id: string, data: UpdateRecipeInput, userId: string) {
  const recipeRepository = new RecipeRepository();
  const userRepository = new UserRepository();

  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) return { code: 401, status: "error", message: "Authentication required" };

    // Check if recipe exists and belongs to the user
    const ownerId = user.id;
    if (!await recipeRepository.findById(id, ownerId)) return { code: 404, status: "error", message: "Recipe not found" };

    // Update recipe
    const recipe = await recipeRepository.update(id, data, ownerId);
    if (!recipe) return { code: 404, status: "error", message: "Recipe not found" };
    
    return { code: 200, status: "success", data: { recipe } };
  } catch (error) {
    console.error("updateRecipeService Error", error);
    return { code: 500, status: "error", message: "Unable to update recipe" };
  }
}
