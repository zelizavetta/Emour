import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";
import TextWrapper from "@/components/ui/textWrapper";
import { ReactNode } from "react";

type ButtonProps = PressableProps & {
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    disabled,
    style,
    ...props
  }: ButtonProps) {

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { 
          backgroundColor: variantColors[variant],
          shadowColor: variantColors[variant]
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
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
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    elevation: 12,
    alignSelf: "flex-start"
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.3,
  },
  text: {
    marginBottom: 0
  }
});