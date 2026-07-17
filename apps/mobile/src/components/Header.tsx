import { colors } from "@/constants/colors";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TextWrapper from "@/components/ui/textWrapper";
import { useAuth } from "@/providers/AuthProvider";


export default function Header() {
    const { logout } = useAuth();

    function handleLogout() {
        Alert.alert("Выйти из аккаунта", "Точно выйти?", [
            { text: "Отмена", style: "cancel" },
            { text: "Выйти", style: "destructive", onPress: () => logout() },
        ]);
    }

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
            <Pressable onPress={handleLogout} style={styles.logout} hitSlop={12}>
                <Ionicons name="log-out-outline" size={28} color={colors.text} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "row",
        gap: 20,
        width: "100%",
        paddingTop: 60,
        height: 120,
        paddingHorizontal: 20,
        alignItems: "center"
    },
    logo: {
        margin: 0,
        padding: 0,
    },
    logout: {
        marginLeft: "auto",
    }
})
