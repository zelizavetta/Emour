import { StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { RadioButton, List, Checkbox } from "react-native-paper";
import { useEffect, useState } from "react";

import AnxietySlider from "@/components/AnxietySlieder";
import EnergySlider from "@/components/EnergySlider";
import MoodSlider from "@/components/MoodSlider";
import Card from "@/components/ui/card/card";
import CarouselWrapper from "@/components/ui/carouselWrapper";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { useFeelings } from "@/providers/UserContext";
import { Feeling } from "@emour/core";
import { colors } from "@/constants/colors";


export default function HomeScreen() {
    const { feelings, addFeelingRecord } = useFeelings()
    const [moodRecords, setMoodRecords] = useState<Feeling[]>([])
    const [energyRecords, setEnergyRecords] = useState<Feeling[]>([])
    const [anxietyRecords, setAnxietyRecords] = useState<Feeling[]>([])
    const [symptoms, setSymptoms] = useState<string[]>([])
    const [haveSymptoms, setHaveSymptoms] = useState<boolean>()
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

    const symptomsItems = [
        "Тремор",
        "Спутанные мысли",
        "Суицидальные мысли",
        "Апатия",
        "Странные идеи",
        "Раздражительность",
        "Неусидчивость",
        "Галлюцинации"
    ]

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
            <Card>
                <TextWrapper variant="title">
                    Есть сегодня симптомы?
                </TextWrapper>
                <View style={styles.symptompsOptionsContainer}>
                    <View style={styles.symptompsOptions}>
                        <RadioButton 
                            value='Нет'
                            color={colors.primary}
                            status={haveSymptoms ? 'unchecked' : 'checked'} 
                            onPress={() => {setHaveSymptoms(false); setSymptoms([])}}
                        />
                        <TextWrapper>
                            Нет
                        </TextWrapper>
                    </View>
                    <View style={styles.symptompsOptions}>
                        <RadioButton 
                            value="Да" 
                            color={colors.primary}
                            status={haveSymptoms ? 'checked' : 'unchecked'} 
                            onPress={() => setHaveSymptoms(true)}
                        />
                        <TextWrapper>
                            Да
                        </TextWrapper>
                    </View>
                    {symptomsItems.map(item => (
                        <View style={styles.symptomsList}>
                            <Checkbox
                                key={item}
                                disabled={!haveSymptoms}
                                onPress={() => 
                                    symptoms.findIndex(sym => sym === item) === -1 ? 
                                    setSymptoms(prev => [...prev, item]) :
                                    setSymptoms(prev => prev.filter(p => p !== item))
                                }
                                status={symptoms.findIndex(sym => sym === item) === -1 ? "unchecked" : "checked"} 
                            />
                            <TextWrapper>
                                {item}
                            </TextWrapper>
                        </View>
                    ))}
                </View>
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
    },
    symptompsOptionsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: 300,
        overflow: "scroll"
    },
    symptompsOptions: {
        display: "flex",
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    symptomsList: {
        display: "flex", 
        flexDirection: "row",
        gap: 4, 
        alignItems: "center",
    }
})