import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "@/screens/HomeScreen";
import WelcomeScreen from "@/screens/WelcomeScreen";
import StatisticScreen from "@/screens/StatisticsScreen";
import NotesScreen from "@/screens/NotesScreen";
import MedsScreen from "@/screens/MedsScreen";
// import ActivityScreen from "../screens/ActivityScreen";
// import JournalScreen from "../screens/JournalScreen";
// import ProfileScreen from "../screens/ProfileScreen";

import { MainTabParamList } from "@/types/navigation";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { useAuth } from "@/providers/AuthProvider";


const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { isViewer } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="Statistic"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 5,
          height: 80,
          backgroundColor: "#13121D",
          borderColor: "#00000000"
        },
        tabBarActiveTintColor: colors.primary,  
        tabBarInactiveTintColor: "#ffff",
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: fonts?.base
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          }
          if (route.name === "Statistic") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          }
          if (route.name === "Notes") {
            iconName = focused ? "document-text" : "document-text-outline";
          }
          if (route.name === "Meds") {
            iconName = focused ? "medkit" : "medkit-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      {!isViewer && (
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: "Home" }}
        />
      )}
      <Tab.Screen
        name="Statistic"
        component={StatisticScreen}
        options={{ tabBarLabel: "Statistic" }}
      />
      {!isViewer && (
        <Tab.Screen
          name="Notes"
          component={NotesScreen}
          options={{ tabBarLabel: "Notes" }}
        />
      )}
      {!isViewer && (
        <Tab.Screen
          name="Meds"
          component={MedsScreen}
          options={{ tabBarLabel: "Meds" }}
        />
      )}
      {/* <Tab.Screen
        name="Welcome"
        component={WelcomeScreen}
      /> */}
    </Tab.Navigator>
  );
}