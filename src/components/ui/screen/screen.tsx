import { View, ViewProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import Header from "@/components/Header";

export default function Screen({ 
    children,  
    style,
    ...props
  }: ViewProps) {
  return(
    <LinearGradient
      colors={colors.gradients.background}
      style={{ flex: 1 }}
    >
      <Header></Header>
      <View 
        style={[styles.container, style]}
        {...props}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    color: colors.text
  }
});