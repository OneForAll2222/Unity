import { Tabs } from "expo-router";
import { Home, BookOpen, User, MessageSquare } from "lucide-react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { View, StyleSheet, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_GRADIENT } from "@/constants/colors";
import * as Haptics from "expo-haptics";

// Enhanced animated tab icon component with haptic feedback
const AnimatedTabIcon = React.memo(({ IconComponent, color, focused, size = 24 }: {
  IconComponent: any;
  color: string;
  focused: boolean;
  size?: number;
}) => {
  const scaleValue = React.useRef(new Animated.Value(focused ? 1.15 : 1)).current;
  const opacityValue = React.useRef(new Animated.Value(focused ? 1 : 0.7)).current;
  const bounceValue = React.useRef(new Animated.Value(0)).current;
  const pulseAnimation = React.useRef<Animated.CompositeAnimation | null>(null);
  const prevFocused = React.useRef(focused);

  React.useEffect(() => {
    // Trigger haptic feedback when tab becomes focused
    if (focused && !prevFocused.current) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    prevFocused.current = focused;

    if (focused) {
      // Bounce effect when becoming active
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1.25,
            useNativeDriver: true,
            tension: 400,
            friction: 8,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleValue, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
      
      // Subtle pulse animation for active state
      pulseAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.current.start();
    } else {
      // Properly stop the loop animation
      pulseAnimation.current?.stop();
      bounceValue.setValue(0);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 12,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  const pulseScale = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            transform: [
              { scale: scaleValue },
              { scale: focused ? pulseScale : 1 }
            ],
            opacity: opacityValue,
          },
          focused && Platform.select({
            ios: {
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            },
            android: {
              elevation: 8,
            },
            web: {
              boxShadow: `0 4px 12px ${color}40`,
            },
          }),
        ]}
      >
        <IconComponent 
          size={focused ? size + 3 : size} 
          color={color}
          strokeWidth={focused ? 2.5 : 2}
        />
      </Animated.View>
      {focused && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            opacity: opacityValue,
          }}
        />
      )}
    </View>
  );
});

// Tab configuration array for cleaner mapping
const TAB_CONFIG = [
  {
    name: "specialists" as const,
    title: "Specialists",
    icon: Home,
  },
  {
    name: "assistant" as const,
    title: "Assistant",
    icon: MessageSquare,
  },
  {
    name: "learning" as const,
    title: "Learning",
    icon: BookOpen,
  },
  {
    name: "profile" as const,
    title: "Profile",
    icon: User,
  },
] as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 70;
  
  const tabGradientColors = [
    TAB_GRADIENT[0] + '80',
    TAB_GRADIENT[1] + '80',
    TAB_GRADIENT[2] + '80'
  ] as const;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 10,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 24,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            },
            android: {
              elevation: 12,
            },
            web: {
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)',
            },
          }),
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFillObject}>
            <BlurView 
              intensity={50} 
              tint="dark" 
              style={StyleSheet.absoluteFillObject} 
            />
            <LinearGradient
              colors={tabGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ),
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon
                IconComponent={tab.icon}
                color={color}
                focused={focused}
                size={24}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}