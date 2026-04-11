import { useAppFonts } from "@/hooks/useAppFonts";
import RootNavigator from "@/navigation/RootNavigator";
import { configureApi } from "@emour/core"
import { config } from "@/constants/config";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { colors } from "@/constants/colors";


configureApi(config.apiUrl)

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: colors.text
  },
};

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return(
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  )
}