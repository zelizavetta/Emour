import { View, ViewProps, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import Header from "@/components/Header";


type ScreenProps = ViewProps & {
  hasHeader?: boolean
}

export default function Screen({ 
    children,  
    hasHeader = true,
    style,
    ...props
  }: ScreenProps) {
  return(
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.wrapper}
    >
      {hasHeader ? <Header></Header> : <></>}
      <ScrollView 
        contentContainerStyle={[styles.container, styles.scrollContent, style]}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});