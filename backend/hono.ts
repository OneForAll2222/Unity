import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// Log environment variables for debugging
console.log('Backend Environment Check:', {
  nodeEnv: process.env.NODE_ENV,
  openaiKeyExists: !!process.env.OPENAI_API_KEY,
  geminiKeyExists: !!process.env.GEMINI_API_KEY,
  openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
  openaiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 10) || 'none',
  geminiKeyStart: process.env.GEMINI_API_KEY?.substring(0, 10) || 'none'
});

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Environment debug endpoint
app.get("/debug/env", (c) => {
  return c.json({
    nodeEnv: process.env.NODE_ENV,
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    geminiKeyExists: !!process.env.GEMINI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
    openaiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 15) || 'none',
    geminiKeyStart: process.env.GEMINI_API_KEY?.substring(0, 15) || 'none'
  });
});

export default app;