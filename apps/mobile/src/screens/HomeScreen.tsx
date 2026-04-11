import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import AnxietySlider from "@/components/AnxietySlieder";
import EnergySlider from "@/components/EnergySlider";
import MoodSlider from "@/components/MoodSlider";
import Card from "@/components/ui/card/card";
import CarouselWrapper from "@/components/ui/carouselWrapper";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { useFeelings } from "@/providers/UserContext";
import { useEffect, useState } from "react";
import { Feeling } from "@emour/core";


export default function HomeScreen() {
    const { feelings, addFeelingRecord } = useFeelings()
    const [moodRecords, setMoodRecords] = useState<Feeling[]>([])
    const [energyRecords, setEnergyRecords] = useState<Feeling[]>([])
    const [anxietyRecords, setAnxietyRecords] = useState<Feeling[]>([])
    // console.log('feelings: ', feelings)
    useEffect(() => {
        if (feelings.length === 0) {
            setMoodRecords([])
            setEnergyRecords([])
            setAnxietyRecords([])
        }
        const moodItems = feelings.filter(record => record.feelingType === "mood")
        const energyItems = feelings.filter(record => record.feelingType === "energy")
        const anxietyItems = feelings.filter(record => record.feelingType === "anxiety")
        setMoodRecords(moodItems)
        setEnergyRecords(energyItems)
        setAnxietyRecords(anxietyItems)
    }, [feelings]);


    return (
        <Screen>
            <TextWrapper variant="bigTitle">
                Че как, котёнок?
            </TextWrapper>
            <CarouselWrapper data={
                [<Card>
                    <MoodSlider addFeelingRecord={addFeelingRecord} feelings={moodRecords}></MoodSlider>
                </Card>,
                <Card>
                    <EnergySlider addFeelingRecord={addFeelingRecord} feelings={energyRecords}></EnergySlider>
                </Card>,
                <Card>
                    <AnxietySlider addFeelingRecord={addFeelingRecord} feelings={anxietyRecords}></AnxietySlider>
                </Card>,
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