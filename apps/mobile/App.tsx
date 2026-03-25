import { useAppFonts } from "@/hooks/useAppFonts";
import RootNavigator from "@/navigation/RootNavigator";
import { configureApi } from "@emour/core"
import { config } from "@/constants/config";


configureApi(config.apiUrl)

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return <RootNavigator />;
}