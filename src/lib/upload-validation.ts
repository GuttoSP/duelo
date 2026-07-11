import { z } from "zod";

export const uploadSchema = z.object({
  title: z.string().trim().min(2).max(80),
  imageUrl: z.string().trim().url(),
  categoryId: z.string().trim().min(1),
  orientation: z.enum(["PORTRAIT", "LANDSCAPE", "SQUARE"]),
});
