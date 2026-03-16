import { useAppFonts } from "@/hooks/useAppFonts";
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return <RootNavigator />;
}