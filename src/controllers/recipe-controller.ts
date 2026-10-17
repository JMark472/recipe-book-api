import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middlewares/auth-middleware";
import { getRecipesService, getAllRecipesService, getRecipeService, createRecipeService, updateRecipeService, deleteRecipeService } from "@/services/recipes";
import { createRecipeSchema, updateRecipeSchema } from "@/schema/recipe-schema";

export class RecipeController {
  public getAllRecipes = async (_req: Request, res: Response) => {
    const result = await getAllRecipesService();
    return res.status(result.code).json(result);
  };

  public getRecipes = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getRecipesService(userId);
    return res.status(result.code).json(result);
  };

  public getRecipe = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getRecipeService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public createRecipe = async (req: Request, res: Response) => {
    // Use parsed data to strip sample fields such as rating and client-supplied userId.
    const { body } = createRecipeSchema.parse({ body: req.body });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await createRecipeService(body, userId);
    return res.status(result.code).json(result);
  };

  public updateRecipe = async (req: Request, res: Response) => {
    const { body } = updateRecipeSchema.parse({ body: req.body, params: req.params });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await updateRecipeService(req.params.id as string, body, userId);
    return res.status(result.code).json(result);
  };

  public deleteRecipe = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await deleteRecipeService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };
}
