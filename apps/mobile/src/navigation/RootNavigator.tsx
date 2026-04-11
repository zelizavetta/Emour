import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabs from "./MainTabs";
// import SessionDetailsScreen from "../screens/SessionDetailsScreen";

import { RootStackParamList } from "@/types/navigation";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { UserProvider } from "@/providers/UserContext";


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <UserProvider>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: fonts?.base,
          }
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </UserProvider>
  );
}