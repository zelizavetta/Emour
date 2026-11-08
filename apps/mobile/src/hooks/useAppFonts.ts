import { useFonts } from "expo-font";


export function useAppFonts() {
    const [fontsLoaded] = useFonts({
        ForestSmoothRegular: require("@/assets/fonts/ForestSmooth-Regular.ttf"),
        Exo2VariableFontwght: require("@/assets/fonts/Exo2-VariableFont_wght.ttf"),
        Exo2ItalicVariableFontwght: require("@/assets/fonts/Exo2-Italic-VariableFont_wght.ttf")
    });
    
    return fontsLoaded;
}