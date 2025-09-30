import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AIProvider } from "@/providers/AIProvider";
import { UserProvider } from "@/providers/UserProvider";
import { PaymentProvider } from "@/providers/PaymentProvider";
import { StripeWrapper } from "@/components/StripeWrapper";
import { STRIPE_CONFIG } from "@/constants/stripe";
import { trpc, trpcClient } from "@/lib/trpc";
import { validateConfig } from "@/constants/config";
import { LinearGradient } from "expo-linear-gradient";
import { MAIN_GRADIENT, COLORS } from "@/constants/colors";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerTransparent: true,
      headerTintColor: COLORS.TEXT_PRIMARY,
      gestureEnabled: true,
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="chat/[specialistId]" 
        options={{ 
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="learning/[category]" 
        options={{ 
          headerShown: true,
          title: 'Learning',
        }} 
      />
      <Stack.Screen 
        name="music/production" 
        options={{ 
          headerShown: true,
          title: 'Music Production',
        }} 
      />
      <Stack.Screen 
        name="payments" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="payment-history" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="support" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="admin" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="api-test" 
        options={{ 
          headerShown: true,
          title: 'API Diagnostics',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        
        // Validate configuration
        validateConfig();
        
        // Pre-load fonts, make any API calls you need to do here
        // For now, just wait a bit to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Tell the application to render
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  const AppContent = () => {
    try {
      return (
        <StripeWrapper publishableKey={STRIPE_CONFIG.publishableKey}>
          <UserProvider>
            <PaymentProvider>
              <AIProvider>
                <RootLayoutNav />
              </AIProvider>
            </PaymentProvider>
          </UserProvider>
        </StripeWrapper>
      );
    } catch (error) {
      console.error('Error rendering app content:', error);
      // Return a minimal fallback UI
      return <RootLayoutNav />;
    }
  };

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={MAIN_GRADIENT as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', inset: 0 }}
            />
            <AppContent />
          </View>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}