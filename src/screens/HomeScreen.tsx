import EnergySlider from "@/components/EnergySlider";
import Header from "@/components/Header";
import MoodSlider from "@/components/MoodSlider";
import Card from "@/components/ui/card/card";
import CarouselWrapper from "@/components/ui/carouselWrapper";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { StyleSheet, Text, View } from "react-native";


export default function HomeScreen() {
    return (
        <Screen>
            <TextWrapper variant="bigTitle">
                Че как, котенок?
            </TextWrapper>
            <CarouselWrapper data={
                [<Card>
                    <MoodSlider></MoodSlider>
                </Card>,
                <Card>
                    <EnergySlider></EnergySlider>
                </Card>
                ]
            }>
                
            </CarouselWrapper>
            
        </Screen>
    );
}

const styles = StyleSheet.create({
})