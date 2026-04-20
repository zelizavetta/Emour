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
import { useUserRecords } from "@/providers/UserContext";
import { Feeling, Symptom } from "@emour/core";
import { colors } from "@/constants/colors";
import Button from "@/components/ui/button";

import { symptomItems } from "@/constants/data";


export default function HomeScreen() {
    const { feelings, symptoms, addFeelingRecord, addSymptomsRecord } = useUserRecords()
    const [moodRecords, setMoodRecords] = useState<Feeling[]>([])
    const [energyRecords, setEnergyRecords] = useState<Feeling[]>([])
    const [anxietyRecords, setAnxietyRecords] = useState<Feeling[]>([])
    const [symptomsRecords, setSymptomsRecords] = useState<Symptom[]>([])
    const [symptomsChecked, setSymptomsChecked] = useState<string[]>([])
    const [haveSymptoms, setHaveSymptoms] = useState<boolean>()
    const time = new Date().toISOString()
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
        if (symptoms.length === 0) {
            setSymptomsRecords([])
        }
    }, [feelings, symptoms]);

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
            <Card style={styles.symptomsCard}>
                <TextWrapper variant="title">
                    Есть сегодня симптомы?
                </TextWrapper>
                <View style={styles.symptompsOptionsContainer}>
                    <View style={styles.symptompsOptions}>
                        <RadioButton 
                            value='Нет'
                            color={colors.primary}
                            status={haveSymptoms ? 'unchecked' : 'checked'} 
                            onPress={() => {setHaveSymptoms(false); setSymptomsChecked([])}}
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
                    {symptomItems.map(item => (
                        <View key={item.value} style={styles.symptomsList}>
                            <Checkbox
                                key={item.value}
                                disabled={!haveSymptoms}
                                onPress={() => 
                                    symptomsChecked.findIndex(sym => sym === item.value) === -1 ? 
                                    setSymptomsChecked(prev => [...prev, item.value]) :
                                    setSymptomsChecked(prev => prev.filter(p => p !== item.value))
                                }
                                status={symptomsChecked.findIndex(sym => sym === item.value) === -1 ? "unchecked" : "checked"} 
                            />
                            <TextWrapper>
                                {item.label}
                            </TextWrapper>
                        </View>
                    ))}
                </View>
                <Button 
                    variant="secondary" 
                    onPress={() => addSymptomsRecord(symptomsChecked, time)}
                    style={styles.symptomsButton}
                    disabled={!haveSymptoms || symptomsChecked.length === 0}
                >
                    Отправить
                </Button>
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
    symptomsCard: {
        display: "flex",
        flexDirection: "column",
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
    },
    symptomsButton: {
        alignSelf: "center",
        marginTop: 16
    },
})