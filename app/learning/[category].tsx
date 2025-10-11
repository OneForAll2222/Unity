 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app/(tabs)/learning.tsx b/app/(tabs)/learning.tsx
index d18c855b258d88f51ad39a8d959ca338890afd2f..cff782ccaf1fed8716869038fe4e8c4b06483a5b 100644
--- a/app/(tabs)/learning.tsx
+++ b/app/(tabs)/learning.tsx
@@ -1,112 +1,116 @@
 import React, { useState } from "react";
 import {
   StyleSheet,
   Text,
   View,
   ScrollView,
   TouchableOpacity,
   Dimensions,
 } from "react-native";
 import { LinearGradient } from "expo-linear-gradient";
 import { SafeAreaView } from "react-native-safe-area-context";
 import { router } from "expo-router";
 import { learningCategories } from "@/constants/learning";
 import * as Haptics from "expo-haptics";
 import { Platform } from "react-native";
 import { Lock } from "lucide-react-native";
 import { useUser } from "@/providers/UserProvider";
 import { PremiumGate } from "@/components/PremiumGate";
 
 const { width } = Dimensions.get("window");
 const cardWidth = (width - 60) / 2; // Account for padding and margin
 
 export default function LearningScreen() {
-  const { isPremium } = useUser();
+  const { hasUnlimitedAccess } = useUser();
   const [showPremiumGate, setShowPremiumGate] = useState<boolean>(false);
+  // Trial and subscription users also have unlimited access, so reuse the helper.
+  const userHasUnlimitedAccess = hasUnlimitedAccess();
 
   const handleCategoryPress = (categoryId: string) => {
     if (Platform.OS !== 'web') {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
     }
-    
-    if (!isPremium) {
+
+    if (!userHasUnlimitedAccess) {
       setShowPremiumGate(true);
       return;
     }
-    
+
     router.push(`/learning/${categoryId}`);
   };
 
   return (
     <LinearGradient
       colors={["#7C3AED", "#2563EB", "#DB2777"]}
       start={{ x: 0, y: 0 }}
       end={{ x: 1, y: 1 }}
       style={styles.container}
     >
       <SafeAreaView style={styles.safeArea}>
         <View style={styles.header}>
           <Text style={styles.title}>Learning Hub</Text>
           <Text style={styles.subtitle}>Explore Professional Fields</Text>
         </View>
 
         <ScrollView
           contentContainerStyle={styles.scrollContent}
           showsVerticalScrollIndicator={Platform.OS !== 'android'}
           nestedScrollEnabled={true}
           scrollEventThrottle={16}
           removeClippedSubviews={Platform.OS === 'android'}
         >
           <View style={styles.grid}>
             {learningCategories.map((category) => {
               const Icon = category.icon;
               return (
                 <TouchableOpacity
                   key={category.id}
                   style={styles.categoryCard}
                   onPress={() => handleCategoryPress(category.id)}
                   activeOpacity={0.9}
                 >
                   <LinearGradient
                     colors={category.gradient}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                     style={styles.cardGradient}
                   >
                     <View style={styles.cardContent}>
                       <View style={styles.iconContainer}>
                         <Icon size={28} color="#fff" />
                       </View>
                       <View style={styles.textContent}>
                         <View style={styles.categoryTitleContainer}>
                           <Text style={styles.categoryTitle}>{category.title}</Text>
-                          {!isPremium && <Lock size={16} color="rgba(255, 255, 255, 0.8)" />}
+                          {!userHasUnlimitedAccess && (
+                            <Lock size={16} color="rgba(255, 255, 255, 0.8)" />
+                          )}
                         </View>
                         <Text style={styles.categoryDescription}>
                           {category.description}
-                          {!isPremium && ' (Premium)'}
+                          {!userHasUnlimitedAccess && ' (Premium)'}
                         </Text>
                         <View style={styles.statsContainer}>
                           <Text style={styles.lessonCount}>
                             {category.lessonCount} Lessons
                           </Text>
                           <Text style={styles.duration}>{category.duration}</Text>
                         </View>
                       </View>
                     </View>
                   </LinearGradient>
                 </TouchableOpacity>
               );
             })}
           </View>
         </ScrollView>
         
         <PremiumGate
           visible={showPremiumGate}
           onClose={() => setShowPremiumGate(false)}
           feature="Learning Courses"
         />
       </SafeAreaView>
     </LinearGradient>
   );
 } 
EOF
)