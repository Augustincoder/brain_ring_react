import { z } from "zod";

export const brainRingSchema = z.array(
  z.object({
    questionText: z.string(),
    correctAnswer: z.string(),
    explanation: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.union([z.string(), z.number()]).optional()
  })
).nonempty("Provide a non-empty JSON array of questions.");
