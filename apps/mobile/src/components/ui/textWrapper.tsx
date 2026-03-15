import { StyleSheet, Text, TextProps } from "react-native";
import { colors } from "mobile/src/constants/colors";
import { fonts } from "mobile/src/constants/fonts";

type TextWrapperProps = TextProps & {
  variant?: "title" | "bigTitle" | "base" | "description" | "logo";
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
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 24
  },
  bigTitle: {
    fontSize: 24,
    marginBottom: 24
  },
  description: {
    fontSize: 10,
    marginBottom: 8
  },
  logo: {
    fontSize: 40,
    fontFamily: fonts.title,
    color: colors.primary,
    fontWeight: 500
  }
});