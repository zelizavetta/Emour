import { View, ViewProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "mobile/src/constants/colors";
import Header from "mobile/src/components/Header";


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
      style={{ flex: 1 }}
    >
      {hasHeader ? <Header></Header> : <></>}
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