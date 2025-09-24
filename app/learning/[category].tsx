import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack } from "expo-router";
import { learningCategories, lessons } from "@/constants/learning";
import { PlayCircle, CheckCircle, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function CategoryScreen() {
  const { category: categoryId } = useLocalSearchParams();
  const category = learningCategories.find((c) => c.id === categoryId);
  const categoryLessons = lessons[categoryId as string] || [];
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const handleLessonPress = (lessonId: string, isLocked: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isLocked) {
      Alert.alert(
        "Lesson Locked",
        "Complete previous lessons to unlock this one."
      );
      return;
    }

    const lesson = categoryLessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (completedLessons.includes(lessonId)) {
      Alert.alert(
        "Lesson Completed ✅", 
        `You've already completed "${lesson.title}"!\n\nWould you like to review the lesson content again?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Review", onPress: () => showLessonContent(lesson) }
        ]
      );
    } else {
      showLessonContent(lesson);
    }
  };

  const showLessonContent = (lesson: any) => {
    const lessonContent = getLessonContent(lesson.id, categoryId as string);
    
    Alert.alert(
      `📚 ${lesson.title}`,
      lessonContent,
      [
        { text: "Close", style: "cancel" },
        {
          text: "Schedule 1-on-1 Session",
          onPress: () => {
            Alert.alert(
              "🎓 1-on-1 Tutoring Available!", 
              `Book a personalized tutoring session for "${lesson.title}" with our AI specialist.\n\n✨ What you'll get:\n• Personalized explanation of concepts\n• Interactive Q&A session\n• Custom practice exercises\n• Progress tracking\n\nWould you like to schedule a session?`,
              [
                { text: "Maybe Later", style: "cancel" },
                { text: "Book Session", onPress: () => {
                  Alert.alert("📅 Session Booked!", "Your 1-on-1 tutoring session has been scheduled. You'll receive a confirmation shortly.");
                }}
              ]
            );
          },
        },
        {
          text: completedLessons.includes(lesson.id) ? "Mark as Reviewed" : "Complete Lesson",
          onPress: () => {
            if (!completedLessons.includes(lesson.id)) {
              setCompletedLessons([...completedLessons, lesson.id]);
              Alert.alert(
                "🎉 Congratulations!", 
                `You've completed "${lesson.title}"!\n\n🎓 Want to go deeper? Book a 1-on-1 tutoring session to master this topic with personalized guidance!`,
                [
                  { text: "Continue Learning", style: "cancel" },
                  { text: "Book 1-on-1 Session", onPress: () => {
                    Alert.alert("📅 Session Booked!", "Your personalized tutoring session has been scheduled!");
                  }}
                ]
              );
            } else {
              Alert.alert("📖 Lesson Reviewed", "Great job reviewing the material! Consider booking a 1-on-1 session for advanced topics.");
            }
          },
        },
      ]
    );
  };

  const getLessonContent = (lessonId: string, categoryId: string): string => {
    const lessonContents: Record<string, Record<string, string>> = {
      programming: {
        "prog-1": "🖥️ Introduction to Programming\n\n• Programming is giving instructions to computers\n• Computers follow instructions step by step\n• Programming languages help us communicate with computers\n• Popular languages: Python, JavaScript, Java, C++\n\n💡 Key Concepts:\n- Algorithms: Step-by-step problem solving\n- Syntax: Rules of the programming language\n- Debugging: Finding and fixing errors\n\n🎯 Practice: Try writing your first 'Hello World' program!",
        "prog-2": "📊 Variables and Data Types\n\n• Variables store information in memory\n• Different types of data need different storage\n\n🔢 Common Data Types:\n- Numbers: integers (1, 2, 3) and decimals (1.5, 2.7)\n- Text: strings ('Hello', 'World')\n- True/False: booleans (true, false)\n- Lists: collections of items [1, 2, 3]\n\n💡 Best Practices:\n- Use descriptive variable names\n- Choose appropriate data types\n- Initialize variables before using them",
        "prog-3": "🔄 Control Flow and Logic\n\n• Control flow determines program execution order\n• Make decisions and repeat actions\n\n🎯 Key Concepts:\n- If/Else: Make decisions based on conditions\n- Loops: Repeat code multiple times\n- For loops: When you know how many times\n- While loops: When you don't know how many times\n\n🧠 Logical Operators:\n- AND (&&): Both conditions must be true\n- OR (||): At least one condition must be true\n- NOT (!): Opposite of the condition",
        "prog-4": "🔧 Functions and Modules\n\n• Functions are reusable blocks of code\n• Modules organize related functions together\n\n📦 Function Benefits:\n- Avoid repeating code\n- Make code easier to read\n- Easier to test and debug\n- Can be used multiple times\n\n🏗️ Function Structure:\n- Name: What the function does\n- Parameters: Input values\n- Return value: Output result\n- Body: The actual code\n\n💡 Tip: Write functions that do one thing well!",
        "prog-5": "🏛️ Object-Oriented Programming\n\n• OOP organizes code around objects and classes\n• Objects represent real-world things\n\n🎯 Core Concepts:\n- Classes: Blueprints for objects\n- Objects: Instances of classes\n- Properties: What an object has\n- Methods: What an object can do\n\n🔑 OOP Principles:\n- Encapsulation: Keep data safe\n- Inheritance: Share common features\n- Polymorphism: Same interface, different behavior\n\n💡 Example: A Car class with properties (color, model) and methods (start, stop)"
      },
      health: {
        "health-1": "🥗 Nutrition Basics\n\n• Good nutrition fuels your body and mind\n• Balance is key to healthy eating\n\n🍎 Macronutrients:\n- Carbohydrates: Body's main energy source\n- Proteins: Build and repair tissues\n- Fats: Essential for brain and hormone function\n\n🌟 Micronutrients:\n- Vitamins: Support immune system and energy\n- Minerals: Build strong bones and teeth\n\n💡 Healthy Plate:\n- 1/2 vegetables and fruits\n- 1/4 lean proteins\n- 1/4 whole grains\n- Drink plenty of water!",
        "health-2": "💪 Exercise and Fitness\n\n• Regular exercise improves physical and mental health\n• Find activities you enjoy for long-term success\n\n🏃‍♂️ Types of Exercise:\n- Cardio: Strengthens heart and lungs\n- Strength: Builds muscle and bone density\n- Flexibility: Improves range of motion\n- Balance: Prevents falls and injuries\n\n⏰ Weekly Goals:\n- 150 minutes moderate cardio\n- 2 days strength training\n- Daily stretching\n\n💡 Start small: Even 10 minutes of movement counts!",
        "health-3": "🧠 Mental Health Awareness\n\n• Mental health is just as important as physical health\n• It's normal to have ups and downs\n\n🚨 Warning Signs:\n- Persistent sadness or anxiety\n- Changes in sleep or appetite\n- Loss of interest in activities\n- Difficulty concentrating\n\n🛠️ Coping Strategies:\n- Talk to trusted friends or family\n- Practice relaxation techniques\n- Maintain regular routines\n- Seek professional help when needed\n\n💚 Remember: Asking for help is a sign of strength!",
        "health-4": "😴 Sleep Science\n\n• Quality sleep is essential for health and performance\n• Adults need 7-9 hours per night\n\n🌙 Sleep Stages:\n- Light sleep: Transition to deeper sleep\n- Deep sleep: Physical restoration\n- REM sleep: Memory consolidation and dreams\n\n💤 Sleep Hygiene Tips:\n- Keep consistent sleep schedule\n- Create cool, dark, quiet environment\n- Avoid screens 1 hour before bed\n- No caffeine 6 hours before sleep\n\n⚡ Benefits: Better mood, memory, immune function, and energy!"
      },
      music: {
        "music-1": "🎵 Music Theory Fundamentals\n\n• Music theory helps you understand how music works\n• Learn the building blocks of all music\n\n🎹 Basic Elements:\n- Notes: A, B, C, D, E, F, G (repeating pattern)\n- Scales: Sequences of notes (Major, Minor)\n- Chords: Multiple notes played together\n- Rhythm: When notes are played in time\n\n🎼 Key Signatures:\n- Major scales: Happy, bright sound\n- Minor scales: Sad, dark sound\n- Circle of Fifths: Relationship between keys\n\n💡 Start with C Major - all white keys on piano!",
        "music-2": "🎛️ Digital Audio Workstations\n\n• DAWs are software for recording and producing music\n• Essential tool for modern music creation\n\n🖥️ Popular DAWs:\n- Logic Pro (Mac): Professional, user-friendly\n- Pro Tools: Industry standard for recording\n- Ableton Live: Great for electronic music\n- GarageBand: Free, beginner-friendly\n\n🎚️ Basic Functions:\n- Recording: Capture audio and MIDI\n- Editing: Cut, copy, paste, and arrange\n- Mixing: Balance levels and add effects\n- Automation: Change settings over time\n\n💡 Start with free options to learn the basics!",
        "music-3": "🎧 Mixing and Mastering\n\n• Mixing balances individual tracks\n• Mastering polishes the final mix\n\n🎛️ Mixing Tools:\n- EQ: Adjust frequency balance\n- Compression: Control dynamics\n- Reverb: Add space and depth\n- Delay: Create echoes and rhythmic effects\n\n🎯 Mixing Process:\n1. Set rough levels\n2. EQ each track\n3. Add compression\n4. Apply effects\n5. Automate changes\n\n✨ Mastering Goals:\n- Consistent volume across songs\n- Enhanced clarity and punch\n- Optimized for different playback systems",
        "music-4": "🔊 Sound Design\n\n• Create unique sounds and textures\n• Essential for electronic music and film scoring\n\n🎛️ Synthesis Types:\n- Subtractive: Start with rich sound, filter down\n- Additive: Build up from simple waveforms\n- FM: Frequency modulation creates complex timbres\n- Granular: Manipulate tiny pieces of audio\n\n🎨 Creative Techniques:\n- Layer multiple sounds\n- Process field recordings\n- Use unusual sound sources\n- Experiment with effects chains\n\n💡 Listen actively to analyze sounds in your favorite music!"
      },
      filmmaking: {
        "film-1": "🎬 Storytelling Basics\n\n• Great films start with compelling stories\n• Structure helps audiences follow your narrative\n\n📖 Three-Act Structure:\n- Act 1: Setup (introduce characters, world, conflict)\n- Act 2: Confrontation (develop conflict, obstacles)\n- Act 3: Resolution (climax and conclusion)\n\n👥 Character Development:\n- Give characters clear goals and motivations\n- Create obstacles that test their resolve\n- Show character growth through actions\n\n💡 Remember: Show, don't tell!",
        "film-2": "📹 Camera Techniques\n\n• Camera work tells the story visually\n• Different shots create different emotions\n\n🎯 Essential Shots:\n- Wide shot: Establishes location and context\n- Medium shot: Shows character interactions\n- Close-up: Reveals emotions and details\n- Extreme close-up: Creates intimacy or tension\n\n📐 Camera Angles:\n- Eye level: Natural, neutral perspective\n- Low angle: Makes subject appear powerful\n- High angle: Makes subject appear vulnerable\n\n🎥 Camera Movement:\n- Pan: Horizontal movement\n- Tilt: Vertical movement\n- Dolly: Moving closer or farther\n- Tracking: Following subject movement",
        "film-3": "💡 Lighting for Film\n\n• Lighting sets mood and directs attention\n• Master basic lighting setups first\n\n🔦 Three-Point Lighting:\n- Key light: Main light source (brightest)\n- Fill light: Softens shadows from key light\n- Back light: Separates subject from background\n\n🎨 Lighting Moods:\n- High key: Bright, cheerful, minimal shadows\n- Low key: Dark, dramatic, high contrast\n- Natural: Mimics real-world lighting\n\n⚡ Practical Tips:\n- Use available light when possible\n- Bounce light off walls for softer illumination\n- Watch for unwanted shadows on faces\n- Golden hour provides beautiful natural light",
        "film-4": "✂️ Video Editing\n\n• Editing shapes the final story\n• Rhythm and pacing control audience engagement\n\n🎬 Basic Editing Principles:\n- Cut on action for smooth transitions\n- Match eyelines in conversations\n- Use cutaways to hide jump cuts\n- Maintain screen direction\n\n⏱️ Pacing Techniques:\n- Quick cuts: Create energy and excitement\n- Long takes: Build tension or show detail\n- Cross-cutting: Show parallel action\n- Montage: Compress time or show progression\n\n🎵 Audio Editing:\n- Clean dialogue is priority #1\n- Use music to enhance emotion\n- Sound effects add realism\n- Leave room for silence"
      },
      automotive: {
        "auto-1": "🚗 Car Basics\n\n• Understanding your car helps you maintain it better\n• Learn the major systems and components\n\n🔧 Major Systems:\n- Engine: Converts fuel to power\n- Transmission: Transfers power to wheels\n- Brakes: Stops the vehicle safely\n- Suspension: Provides smooth ride\n- Electrical: Powers lights, ignition, accessories\n\n⚙️ Key Components:\n- Battery: Stores electrical energy\n- Alternator: Charges battery while driving\n- Radiator: Cools the engine\n- Oil pump: Lubricates engine parts\n\n💡 Warning Signs to Watch:\n- Strange noises or vibrations\n- Dashboard warning lights\n- Fluid leaks under the car\n- Changes in performance",
        "auto-2": "🛠️ Regular Maintenance\n\n• Preventive maintenance saves money and prevents breakdowns\n• Follow your owner's manual schedule\n\n🛢️ Oil Changes:\n- Every 3,000-7,500 miles (check manual)\n- Use correct oil type and viscosity\n- Replace oil filter each time\n- Check oil level monthly\n\n🔍 Regular Inspections:\n- Tire pressure and tread depth\n- Brake pads and fluid\n- Coolant level and condition\n- Air filter cleanliness\n- Battery terminals and connections\n\n📅 Seasonal Maintenance:\n- Summer: Check A/C and cooling system\n- Winter: Test battery and heating system\n- Spring/Fall: Inspect wipers and lights",
        "auto-3": "🔍 Troubleshooting Common Issues\n\n• Learn to identify problems early\n• Know when to DIY vs. see a mechanic\n\n🚨 Common Problems:\n- Car won't start: Check battery, starter, fuel\n- Overheating: Check coolant, radiator, thermostat\n- Strange noises: Identify location and type\n- Poor performance: Check air filter, spark plugs\n\n🛠️ Basic Tools:\n- Socket set and wrenches\n- Screwdrivers (flathead and Phillips)\n- Multimeter for electrical issues\n- Jack and jack stands\n- Basic fluids (oil, coolant, brake fluid)\n\n⚠️ Safety First:\n- Never work under a car supported only by a jack\n- Disconnect battery when working on electrical\n- Let engine cool before checking fluids\n- Wear safety glasses and gloves"
      },
      culinary: {
        "culinary-1": "🔪 Knife Skills\n\n• Good knife skills are the foundation of cooking\n• Proper technique improves safety and efficiency\n\n🔧 Essential Knives:\n- Chef's knife: 8-10 inch, most versatile\n- Paring knife: Small, precise work\n- Serrated knife: Bread and tomatoes\n- Boning knife: Meat and fish preparation\n\n✂️ Basic Cuts:\n- Julienne: Thin matchsticks\n- Dice: Small cubes (small, medium, large)\n- Chiffonade: Thin ribbons (herbs, leafy greens)\n- Brunoise: Very fine dice\n\n🛡️ Safety Tips:\n- Keep knives sharp (dull knives are dangerous)\n- Use proper cutting board\n- Curl fingers when holding food\n- Cut away from your body\n- Clean knives immediately after use",
        "culinary-2": "🔥 Cooking Methods\n\n• Different methods create different flavors and textures\n• Master the basics before trying advanced techniques\n\n🍳 Dry Heat Methods:\n- Sautéing: Quick cooking in small amount of fat\n- Roasting: Oven cooking with dry heat\n- Grilling: Direct heat from below\n- Broiling: Direct heat from above\n\n💧 Moist Heat Methods:\n- Boiling: Cooking in bubbling water\n- Steaming: Cooking with steam\n- Braising: Combination of searing and slow cooking\n- Poaching: Gentle cooking in simmering liquid\n\n🌡️ Temperature Control:\n- Use thermometers for accuracy\n- Preheat pans and ovens\n- Adjust heat as needed during cooking\n- Rest meat after cooking",
        "culinary-3": "🎨 Flavor Development\n\n• Great cooking is about building layers of flavor\n• Balance is key to delicious dishes\n\n🧂 The Five Tastes:\n- Sweet: Sugar, honey, fruits\n- Salty: Salt, soy sauce, cheese\n- Sour: Vinegar, citrus, wine\n- Bitter: Coffee, dark chocolate, greens\n- Umami: Mushrooms, tomatoes, aged cheese\n\n🌿 Flavor Building Techniques:\n- Mise en place: Prepare ingredients first\n- Build aromatics: Onions, garlic, herbs\n- Deglaze pans: Capture browned bits\n- Season throughout cooking, not just at end\n\n🧪 Balancing Act:\n- Taste frequently while cooking\n- Adjust seasoning gradually\n- Use acid to brighten heavy dishes\n- Add sweetness to balance heat or acidity",
        "culinary-4": "🍽️ Plating and Presentation\n\n• We eat with our eyes first\n• Good presentation enhances the dining experience\n\n🎨 Plating Principles:\n- Use odd numbers (3, 5, 7 elements)\n- Create height and dimension\n- Leave white space on the plate\n- Consider color contrast\n\n🖌️ Plating Techniques:\n- Sauce dots and drizzles\n- Microgreens for color and texture\n- Edible flowers for elegance\n- Strategic placement of components\n\n🧽 Final Touches:\n- Clean plate edges with damp towel\n- Warm plates for hot dishes\n- Chill plates for cold dishes\n- Serve immediately after plating\n\n💡 Remember: Taste comes first, but presentation makes it memorable!"
      },
      psychology: {
        "psych-1": "😊 Understanding Emotions\n\n• Emotions are natural and serve important functions\n• Emotional intelligence can be developed\n\n🧠 Basic Emotions:\n- Joy: Signals success and connection\n- Sadness: Helps process loss and seek support\n- Anger: Motivates action against injustice\n- Fear: Protects from danger\n- Surprise: Helps us adapt to new situations\n- Disgust: Protects from harmful substances\n\n💡 Emotional Intelligence Skills:\n- Self-awareness: Recognizing your emotions\n- Self-regulation: Managing emotional responses\n- Empathy: Understanding others' emotions\n- Social skills: Navigating relationships\n\n🛠️ Emotion Regulation Techniques:\n- Deep breathing exercises\n- Progressive muscle relaxation\n- Cognitive reframing\n- Mindfulness meditation",
        "psych-2": "😌 Stress Management\n\n• Stress is normal but chronic stress harms health\n• Effective coping strategies can be learned\n\n⚡ Types of Stress:\n- Acute: Short-term, specific situations\n- Chronic: Long-term, ongoing pressures\n- Eustress: Positive stress that motivates\n- Distress: Negative stress that overwhelms\n\n🎯 Stress Management Techniques:\n- Time management and prioritization\n- Regular exercise and physical activity\n- Adequate sleep and rest\n- Social support and connection\n- Relaxation techniques\n\n🧘 Quick Stress Relief:\n- 4-7-8 breathing technique\n- Progressive muscle relaxation\n- Visualization exercises\n- Brief meditation or mindfulness\n- Physical movement or stretching",
        "psych-3": "🧘 Mindfulness and Meditation\n\n• Mindfulness is awareness of the present moment\n• Regular practice improves mental and physical health\n\n🎯 Core Principles:\n- Non-judgmental awareness\n- Acceptance of present experience\n- Letting go of past and future worries\n- Observing thoughts without attachment\n\n🧘‍♀️ Types of Meditation:\n- Focused attention: Concentrate on breath or object\n- Open monitoring: Observe all thoughts and sensations\n- Loving-kindness: Cultivate compassion\n- Body scan: Progressive awareness of physical sensations\n\n📱 Getting Started:\n- Start with 5-10 minutes daily\n- Use guided meditation apps\n- Find quiet, comfortable space\n- Be patient with yourself\n- Consistency matters more than duration"
      },
      law: {
        "law-1": "⚖️ Legal System Overview\n\n• Understanding the legal system helps you navigate life\n• Laws exist to maintain order and protect rights\n\n🏛️ Branches of Government:\n- Legislative: Makes laws (Congress)\n- Executive: Enforces laws (President)\n- Judicial: Interprets laws (Courts)\n\n📚 Types of Law:\n- Criminal: Crimes against society\n- Civil: Disputes between individuals\n- Constitutional: Fundamental rights and powers\n- Administrative: Government agency regulations\n\n🏛️ Court System:\n- Trial courts: Hear cases first\n- Appellate courts: Review trial court decisions\n- Supreme Court: Final authority on constitutional issues\n\n💡 Legal Process:\n- Investigation and charges\n- Arraignment and plea\n- Discovery and pre-trial motions\n- Trial and verdict\n- Sentencing or judgment",
        "law-2": "🗽 Your Rights\n\n• Constitutional rights protect individual freedoms\n• Know your rights to protect yourself\n\n📜 Bill of Rights Highlights:\n- 1st Amendment: Speech, religion, press, assembly\n- 4th Amendment: Protection from unreasonable searches\n- 5th Amendment: Right to remain silent\n- 6th Amendment: Right to attorney and fair trial\n- 8th Amendment: No cruel or unusual punishment\n\n👮‍♂️ Police Interactions:\n- You have the right to remain silent\n- You can refuse searches without a warrant\n- Ask 'Am I free to leave?'\n- Request an attorney if arrested\n- Stay calm and respectful\n\n⚖️ Due Process Rights:\n- Presumption of innocence\n- Right to legal representation\n- Right to confront witnesses\n- Protection against double jeopardy",
        "law-3": "📄 Contracts and Agreements\n\n• Contracts are legally binding agreements\n• Understanding contract basics protects your interests\n\n✅ Elements of Valid Contract:\n- Offer: One party proposes terms\n- Acceptance: Other party agrees to terms\n- Consideration: Exchange of value\n- Capacity: Parties able to enter contract\n- Legality: Contract purpose is legal\n\n📋 Common Contract Types:\n- Employment agreements\n- Rental/lease agreements\n- Purchase contracts\n- Service agreements\n- Non-disclosure agreements\n\n🔍 Before Signing:\n- Read entire document carefully\n- Understand all terms and conditions\n- Ask questions about unclear provisions\n- Consider having attorney review important contracts\n- Keep copies of all signed documents\n\n⚠️ Red Flags:\n- Pressure to sign immediately\n- Blank spaces in contract\n- Verbal promises not in writing\n- Unreasonable terms or penalties"
      },
      academics: {
        "academic-1": "📚 Effective Study Techniques\n\n• Active learning is more effective than passive reading\n• Different techniques work for different subjects\n\n🧠 Active Learning Methods:\n- Spaced repetition: Review material at increasing intervals\n- Active recall: Test yourself without looking at notes\n- Elaborative interrogation: Ask 'why' and 'how' questions\n- Self-explanation: Explain concepts in your own words\n\n📝 Note-Taking Systems:\n- Cornell Method: Divide page into notes, cues, summary\n- Mind mapping: Visual representation of connections\n- Outline method: Hierarchical organization\n- Charting method: Tables for comparing information\n\n🎯 Study Environment:\n- Minimize distractions (phone, social media)\n- Good lighting and comfortable seating\n- Consistent study location\n- Background music (if helpful)\n- Regular breaks using Pomodoro Technique",
        "academic-2": "⏰ Time Management\n\n• Effective time management reduces stress and improves performance\n• Planning and prioritization are key skills\n\n📅 Planning Tools:\n- Academic calendar with all important dates\n- Weekly schedule with classes and commitments\n- Daily to-do lists with priorities\n- Time blocking for focused work\n\n🎯 Prioritization Methods:\n- Eisenhower Matrix: Urgent vs. Important\n- ABC Method: Rank tasks by importance\n- Eat the Frog: Do hardest task first\n- Time boxing: Allocate specific time for tasks\n\n⚡ Productivity Tips:\n- Break large projects into smaller tasks\n- Use deadlines to create urgency\n- Batch similar activities together\n- Eliminate or delegate non-essential tasks\n- Review and adjust plans regularly",
        "academic-3": "🔍 Research Skills\n\n• Good research is the foundation of academic success\n• Learn to find, evaluate, and use sources effectively\n\n📖 Types of Sources:\n- Primary: Original research, firsthand accounts\n- Secondary: Analysis of primary sources\n- Tertiary: Summaries and overviews\n- Peer-reviewed: Scholarly articles reviewed by experts\n\n🔍 Research Process:\n1. Define research question clearly\n2. Develop search strategy and keywords\n3. Use multiple databases and sources\n4. Evaluate source credibility and relevance\n5. Take detailed notes with citations\n6. Organize information logically\n\n✅ Evaluating Sources:\n- Author credentials and expertise\n- Publication date and relevance\n- Publisher reputation\n- Bias and objectivity\n- Supporting evidence and references\n\n📚 Citation Basics:\n- Always cite sources to avoid plagiarism\n- Use consistent citation style (APA, MLA, Chicago)\n- Include in-text citations and bibliography\n- Cite both direct quotes and paraphrased ideas",
        "academic-4": "✍️ Writing Excellence\n\n• Clear writing demonstrates clear thinking\n• Good writing is rewriting and revision\n\n📝 Essay Structure:\n- Introduction: Hook, background, thesis statement\n- Body paragraphs: Topic sentence, evidence, analysis\n- Conclusion: Restate thesis, summarize, broader implications\n- Transitions: Connect ideas smoothly\n\n💡 Writing Process:\n1. Brainstorm and outline ideas\n2. Write first draft without editing\n3. Revise for content and organization\n4. Edit for grammar and style\n5. Proofread for final errors\n\n🎯 Strong Arguments:\n- Clear thesis statement\n- Logical organization of ideas\n- Strong evidence from credible sources\n- Address counterarguments\n- Smooth transitions between points\n\n✨ Style Tips:\n- Use active voice when possible\n- Vary sentence length and structure\n- Choose precise, specific words\n- Eliminate unnecessary words\n- Read work aloud to check flow"
      }
    };

    return lessonContents[categoryId]?.[lessonId] || "📚 Lesson content coming soon! This lesson will cover important concepts and practical skills in this field. Stay tuned for detailed content!\n\n💡 In the meantime, you can:\n• Explore other available lessons\n• Practice the concepts you've already learned\n• Ask questions in our community forums\n• Schedule a 1-on-1 session with a specialist";
  };

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  const Icon = category.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: category.title,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#fff',

        }}
      />
      <LinearGradient
        colors={category.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.header}>
            <View style={styles.categoryInfo}>
              <View style={styles.iconContainer}>
                <Icon size={32} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{category.title}</Text>
                <Text style={styles.subtitle}>{category.description}</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {completedLessons.length} / {categoryLessons.length} Completed
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${categoryLessons.length > 0 ? (completedLessons.length / categoryLessons.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.lessonsContainer}
            contentContainerStyle={styles.lessonsContent}
            showsVerticalScrollIndicator={false}
          >
            {categoryLessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isLocked = index > 0 && !completedLessons.includes(categoryLessons[index - 1].id);

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    isLocked && styles.lockedCard,
                  ]}
                  onPress={() => handleLessonPress(lesson.id, isLocked)}
                  activeOpacity={0.8}
                  disabled={false}
                >
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonIcon}>
                      {isCompleted ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : isLocked ? (
                        <Lock size={24} color="#9CA3AF" />
                      ) : (
                        <PlayCircle size={24} color="#3B82F6" />
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[
                        styles.lessonTitle,
                        isLocked && styles.lockedText,
                      ]}>
                        {lesson.title}
                      </Text>
                      <Text style={[
                        styles.lessonDescription,
                        isLocked && styles.lockedText,
                      ]}>
                        {lesson.description}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonDuration}>
                          {lesson.duration}
                        </Text>
                        {lesson.difficulty && (
                          <View style={[
                            styles.difficultyBadge,
                            lesson.difficulty === 'Beginner' && styles.beginnerBadge,
                            lesson.difficulty === 'Intermediate' && styles.intermediateBadge,
                            lesson.difficulty === 'Advanced' && styles.advancedBadge,
                          ]}>
                            <Text style={styles.difficultyText}>
                              {lesson.difficulty}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  progressContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
  },
  progressText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  lessonsContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  lessonsContent: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lessonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonIcon: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  lockedText: {
    color: "#9CA3AF",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beginnerBadge: {
    backgroundColor: "#D1FAE5",
  },
  intermediateBadge: {
    backgroundColor: "#FEF3C7",
  },
  advancedBadge: {
    backgroundColor: "#FEE2E2",
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
});