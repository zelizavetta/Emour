import { Pressable, PressableProps, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import TextWrapper from "../textWrapper";

type ButtonProps = PressableProps & {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
    children,
    variant = "primary",
    style,
    ...props
  }: ButtonProps) {

  return (
    <Pressable
      style={[
        styles.button,
        { 
          backgroundColor: variantColors[variant],
          shadowColor: variantColors[variant]
        }, style
      ]}
      {...props}
    >
      <TextWrapper variant="base" style={styles.text}>{children}</TextWrapper>
    </Pressable>
  );
}

const variantColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  danger: colors.danger
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 12
  },
  text: {
    fontWeight: "600"
  }
});