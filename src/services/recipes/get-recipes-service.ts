import { RecipeRepository } from "@/repositories/recipe-repository";
import { UserRepository } from "@/repositories/user-repository";

export async function getRecipesService(userId: string) {
  const recipeRepository = new RecipeRepository();
  const userRepository = new UserRepository();

  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) return { code: 401, status: "error", message: "Authentication required" };

    // Get all recipes for the user
    const recipes = await recipeRepository.findAll(user.id);
    return { code: 200, status: "success", data: { recipes } };
  } catch (error) {
    console.error("getRecipesService Error", error);
    return { code: 500, status: "error", message: "Unable to get recipes" };
  }
}
