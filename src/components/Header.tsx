import { colors } from "@constants/colors";
import { fonts } from "@constants/fonts";
import { Image, StyleSheet, Text, View } from "react-native";


export default function Header() {
    return (
        <View
            style={styles.header}
        >
            <Image 
                source={require("@/assets/logo.jpg")}
                style={{ height: 50, width: 80 }}
            >
            </Image>
            <Text style={styles.logo}>
                EMOUR
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        width: "100%",
        height: 80,
        paddingHorizontal: 20,
        alignItems: "center"
    },
    logo: {
        color: colors.primary,
        fontSize: 40,
        fontFamily: fonts?.title,
        fontWeight: 500
    }
})