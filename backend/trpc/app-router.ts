import { createTRPCRouter, publicProcedure } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { submitContactProcedure, getContactSubmissionsProcedure, markContactAsReadProcedure } from "./routes/contact/submit/route";
import { createPaymentIntentProcedure, confirmPaymentProcedure } from "./routes/stripe/create-payment-intent/route";
import { validateAdminPasswordProcedure } from "./routes/admin/auth/route";
import { chatProcedure, testApiKeysProcedure } from "./routes/openai/chat/route";
import { z } from "zod";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),

  contact: createTRPCRouter({
    submit: submitContactProcedure,
    getSubmissions: getContactSubmissionsProcedure,
    markAsRead: markContactAsReadProcedure,
  }),
  stripe: createTRPCRouter({
    createPaymentIntent: createPaymentIntentProcedure,
    confirmPayment: confirmPaymentProcedure,
  }),
  admin: createTRPCRouter({
    validatePassword: validateAdminPasswordProcedure,
  }),
  openai: createTRPCRouter({
    chat: chatProcedure,
    testApiKeys: testApiKeysProcedure,
  }),
  music: createTRPCRouter({
    generateMusic: publicProcedure
      .input(z.object({
        prompt: z.string(),
      }))
      .mutation(async ({ input }) => {
        console.log(`Generating music for prompt: ${input.prompt}`);
        return {
          success: true,
          message: `Placeholder music generated for prompt: ${input.prompt}`
        };
      }),
    generateLyrics: publicProcedure
      .input(z.object({
        prompt: z.string(),
      }))
      .mutation(async ({ input }) => {
        console.log(`Generating lyrics for prompt: ${input.prompt}`);
        return {
          success: true,
          lyrics: `[Verse 1]\nPlaceholder lyrics for: ${input.prompt}\n\n[Chorus]\nThis is a placeholder song\nGenerated from your prompt\n\n[Verse 2]\nMore placeholder content\nWill be replaced with AI`
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;