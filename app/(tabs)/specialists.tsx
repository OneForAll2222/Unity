 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/constants/specialists.ts b/constants/specialists.ts
index 2d99e96e91bbc1f0331a7ab00be0c5527326a43f..1f7e3eef409b00fdcba336ae78b36efea418eea9 100644
--- a/constants/specialists.ts
+++ b/constants/specialists.ts
@@ -149,55 +149,55 @@ export const specialists = [
     tier: "premium",
   },
   {
     id: "travel-planner",
     name: "Travel Planner",
     description: "Trip planning, destinations & travel tips",
     icon: MapPin,
     gradient: PRIMARY_BUTTON_GRADIENT,
     chatGradient: AI_MESSAGE_GRADIENT,
     welcomeMessage: "Bon voyage! ✈️ I'm your Travel Planner specialist. I can help you plan amazing trips, suggest destinations, find the best deals, create itineraries, provide travel tips, recommend accommodations, and help you navigate travel requirements. Where would you like to explore next?",
     tier: "premium",
   },
   {
     id: "fitness-coach",
     name: "Fitness Coach",
     description: "Workout plans, nutrition & wellness guidance",
     icon: Dumbbell,
     gradient: ["#ff9a9e", "#fecfef"] as const,
     chatGradient: ["#ff9a9e", "#fecfef", "#ffecd2"] as const,
     welcomeMessage: "Hey there, fitness enthusiast! 💪 I'm your Fitness Coach specialist. I can help you create workout plans, provide nutrition guidance, set fitness goals, track progress, suggest exercises, and motivate you on your wellness journey. Remember: consult healthcare professionals for medical advice. Ready to get fit?",
     tier: "premium",
   },
   {
     id: "gardening",
     name: "Gardening Expert",
-    description: "Plant care, garden planning & growing tips",
+    description: "Premium all-purpose assistant for complex tasks",
     icon: Flower2,
     gradient: ["#43e97b", "#38f9d7"] as const,
     chatGradient: ["#43e97b", "#38f9d7", "#667eea"] as const,
-    welcomeMessage: "Welcome to the Gardening Expert. This specialist has moved to premium access. Please upgrade to continue with gardening assistance.",
+    welcomeMessage: "Welcome to your premium General Assistant. This versatile AI can help with deep research, long-form writing, strategic planning, detailed explanations, and creative problem-solving across domains. Please upgrade to keep working with these advanced capabilities.",
     tier: "premium",
   },
   {
     id: "coding",
     name: "Coding Expert",
     description: "Debug, optimize, and learn programming",
     icon: Code,
     gradient: PRIMARY_BUTTON_GRADIENT,
     chatGradient: AI_MESSAGE_GRADIENT,
     welcomeMessage: "Hello! I'm your coding expert powered by ChatGPT-5. I can help you debug code, suggest optimizations, explain programming concepts, and review your code for best practices. Share your code or ask me anything about programming!",
     isFree: true,
   },
   {
     id: "medical",
     name: "Medical Advisor",
     description: "Health guidance and medical information",
     icon: Heart,
     gradient: ["#f093fb", "#f5576c"] as const,
     chatGradient: ["#f093fb", "#f5576c", "#4facfe"] as const,
     welcomeMessage: "Welcome! I'm your medical advisor. I can provide general health information, explain medical conditions, and offer wellness tips. Remember, I'm here for educational purposes only - always consult a healthcare professional for personal medical advice.",
     tier: "premium",
   },
   {
     id: "music",
     name: "Music Producer",
 
EOF
)