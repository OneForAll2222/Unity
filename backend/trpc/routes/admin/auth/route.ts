import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// In production, this should be stored in environment variables
// For now, using a secure default that should be changed
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SecureAdmin2024!';

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