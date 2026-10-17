import { z } from "zod";

const text = z.string().trim().min(1);

const recipeBody = z.object({
  name: text,
  cuisine: text,
  mealType: z.array(text).min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  cookTimeMinutes: z.number().int().nonnegative().max(2147483647),
  tags: z.array(text),
  image: z.url().refine((url) => /^https?:\/\//i.test(url), "Use an HTTP or HTTPS image URL"),
  ingredients: z.array(text).min(1),
  instructions: z.array(text).min(1),
});

const recipeParams = z.object({ id: z.uuid("Invalid recipe ID") });

export const createRecipeSchema = z.object({ body: recipeBody });
export const recipeIdSchema = z.object({ params: recipeParams });
export const updateRecipeSchema = z.object({
  params: recipeParams,
  body: recipeBody.partial().refine((body) => Object.keys(body).length > 0, "Provide at least one recipe field"),
});

export type CreateRecipeInput = z.infer<typeof recipeBody>;
export type UpdateRecipeInput = Partial<CreateRecipeInput>;
