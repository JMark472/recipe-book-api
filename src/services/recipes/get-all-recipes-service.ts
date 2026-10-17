import { RecipeRepository } from "@/repositories/recipe-repository";

export async function getAllRecipesService() {
  const recipeRepository = new RecipeRepository();

  try {
    // Get all recipes
    const recipes = await recipeRepository.findAllWithOwners();
    return { code: 200, status: "success", data: { recipes } };
  } catch (error) {
    console.error("getAllRecipesService Error", error);
    return { code: 500, status: "error", message: "Unable to get all recipes" };
  }
}
