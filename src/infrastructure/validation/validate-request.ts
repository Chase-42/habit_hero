import { z } from "zod";
import { createValidationErrorResponse } from "../types/error-response";

export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<
  | { success: true; data: T }
  | { success: false; error: ReturnType<typeof createValidationErrorResponse> }
> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: createValidationErrorResponse(error) };
    }
    throw error;
  }
}
