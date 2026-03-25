import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import AnxietySlider from "@/components/AnxietySlieder";
import EnergySlider from "@/components/EnergySlider";
import MoodSlider from "@/components/MoodSlider";
import Card from "@/components/ui/card/card";
import CarouselWrapper from "@/components/ui/carouselWrapper";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { useRecords } from "@/providers/RecordsContext";


export default function HomeScreen() {
    const { feelings, addFeelingRecord } = useRecords()

    async function fetchCheckRecords() {
        
    }
    return (
        <Screen>
            <TextWrapper variant="bigTitle">
                Че как, котенок?
            </TextWrapper>
            <CarouselWrapper data={
                [<Card>
                    <MoodSlider addFeelingRecord={addFeelingRecord}></MoodSlider>
                </Card>,
                <Card>
                    <EnergySlider addFeelingRecord={addFeelingRecord}></EnergySlider>
                </Card>,
                <Card>
                    <AnxietySlider addFeelingRecord={addFeelingRecord}></AnxietySlider>
                </Card>
                ]
            }>
            </CarouselWrapper>            
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