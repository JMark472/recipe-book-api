import { RecipeRepository } from "@/repositories/recipe-repository";
import { UserRepository } from "@/repositories/user-repository";

export async function deleteRecipeService(id: string, userId: string) {
  const recipeRepository = new RecipeRepository();
  const userRepository = new UserRepository();

  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) return { code: 401, status: "error", message: "Authentication required" };

    // Check if recipe exists and belongs to the user
    const ownerId = user.id;
    const recipe = await recipeRepository.findById(id, ownerId);
    if (!recipe) return { code: 404, status: "error", message: "Recipe not found" };

    // Delete recipe
    await recipeRepository.delete(id, ownerId);
    return { code: 200, status: "success", message: "Recipe deleted", data: { recipe } };
  } catch (error) {
    console.error("deleteRecipeService Error", error);
    return { code: 500, status: "error", message: "Unable to delete recipe" };
  }
}
