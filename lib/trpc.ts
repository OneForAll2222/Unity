import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { APP_CONFIG } from "@/constants/config";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  return APP_CONFIG.API_BASE_URL;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, options);
          return response;
        } catch (error) {
          console.warn('tRPC request failed:', error);
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    }),
  ],
});