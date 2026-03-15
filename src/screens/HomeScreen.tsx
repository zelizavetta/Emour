import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import AnxietySlider from "src/components/AnxietySlieder";
import EnergySlider from "src/components/EnergySlider";
import MoodSlider from "src/components/MoodSlider";
import Card from "src/components/ui/card/card";
import CarouselWrapper from "src/components/ui/carouselWrapper";
import Screen from "src/components/ui/screen";
import TextWrapper from "src/components/ui/textWrapper";


export default function HomeScreen() {
    const data = [
        {value: 15},
        {value: 25},
        {value: 18},
    ]
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
                </Card>,
                <Card>
                    <AnxietySlider></AnxietySlider>
                </Card>
                ]
            }>
                
            </CarouselWrapper>

            <Card>
                <LineChart 
                    areaChart
                    data={data}
                />
            </Card>
            
        </Screen>
    );
}

const styles = StyleSheet.create({
    stateCard: {
        width: 120,
        height: 120,
        justifyContent: "center",
        alignItems: "center"
    }
})