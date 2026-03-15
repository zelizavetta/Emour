import { StyleSheet, View, ViewProps } from "react-native";
import { colors } from "src/constants/colors";

export default function Card({ children, style, ...props }: ViewProps) {
    return(
        <View style={[styles.container, style]} {...props}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.card.background,
        borderRadius: 20,
    }
});