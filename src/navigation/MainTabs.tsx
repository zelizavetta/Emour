import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "@/screens/HomeScreen";
// import ActivityScreen from "../screens/ActivityScreen";
// import JournalScreen from "../screens/JournalScreen";
// import ProfileScreen from "../screens/ProfileScreen";

import { MainTabParamList } from "./types";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";


const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: fonts?.base
        },
        // tabBarIcon: ({ color, size, focused }) => {
        //   let iconName: keyof typeof Ionicons.glyphMap = "ellipse";

        //   if (route.name === "Home") {
        //     iconName = focused ? "home" : "home-outline";
        //   }

        //   return <Ionicons name={iconName} size={size} color={color} />;
        // }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        // options={{ tabBarLabel: "Home" }}
      />
    </Tab.Navigator>
  );
}