import { StyleSheet, Text, TextProps } from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";

type TextWrapperProps = TextProps & {
  variant?: "title" | "base" | "description";
};

export default function TextWrapper({
  children,
  variant = "base",
  style,
  ...props
}: TextWrapperProps) {
  return (
    <Text style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.base,
    color: colors.text,
    fontSize: 16
  },

  title: {
    fontSize: 20,
    fontWeight: "600"
  },

  description: {
    fontSize: 12
  }
});