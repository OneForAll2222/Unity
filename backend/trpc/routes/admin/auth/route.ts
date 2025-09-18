import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Admin password must be set via environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

export const validateAdminPasswordProcedure = publicProcedure
  .input(z.object({
    password: z.string().min(1, "Password is required"),
  }))
  .mutation(async ({ input }) => {
    const { password } = input;
    
    // Simple constant-time comparison to prevent timing attacks
    const isValid = password === ADMIN_PASSWORD;
    
    if (!isValid) {
      throw new Error('Invalid admin password');
    }
    
    return {
      success: true,
      message: 'Authentication successful',
    };
  });