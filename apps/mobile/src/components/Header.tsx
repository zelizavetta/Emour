import { colors } from "mobile/src/constants/colors";
import { Image, StyleSheet, View } from "react-native";
import TextWrapper from "mobile/src/components/ui/textWrapper";


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
            <TextWrapper variant="logo" style={styles.logo}>
                EMOUR
            </TextWrapper>
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
        marginBottom: 0
    }
})