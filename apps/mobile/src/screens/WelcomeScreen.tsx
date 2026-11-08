import { useEffect } from "react";
import { StyleSheet } from "react-native";

import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { getOrCreateInstallationId } from "@/utils/getOrCreateInstallationId";
import { config } from "@/constants/config";

export default function WelcomeScreen() {
    async function getInstallationId() {
        const installationId = await getOrCreateInstallationId();
        await fetch(`${config.apiUrl}/api/auth/device`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ installationId }),
        });
        console.log('installationId:', installationId); 
    }
    useEffect(() => {
        getInstallationId();
    }, []);

    return (
        <Screen hasHeader={false} style={styles.container}>
            <TextWrapper variant="bigTitle" style={styles.title}>
                Добро пожаловать в
            </TextWrapper>
            <TextWrapper variant="logo" style={styles.logo}>
                EMOUR
            </TextWrapper>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center"
    },
    title: {
        marginBottom: 12
    },
    logo: {
        fontSize: 80
    }
})