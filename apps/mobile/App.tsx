import { useAppFonts } from "mobile/src/hooks/useAppFonts";
import RootNavigator from "mobile/src/navigation/RootNavigator";

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return <RootNavigator />;
}