import { createTRPCRouter } from "./create-context";
import { hiProcedure, createPayPalPaymentProcedure, verifyPayPalPaymentProcedure } from "./routes/example/hi/route";
import { submitContactProcedure, getContactSubmissionsProcedure, markContactAsReadProcedure } from "./routes/contact/submit/route";
import { createPaymentIntentProcedure, confirmPaymentProcedure } from "./routes/stripe/create-payment-intent/route";
import { validateAdminPasswordProcedure } from "./routes/admin/auth/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  paypal: createTRPCRouter({
    createPayment: createPayPalPaymentProcedure,
    verifyPayment: verifyPayPalPaymentProcedure,
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
});

export type AppRouter = typeof appRouter;